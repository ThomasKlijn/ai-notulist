import { storage } from './storage';
import { transcribeAudio, generateMeetingSummary } from './openai';
import type { MeetingSummary } from './openai';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

export class MeetingProcessingService {
  private processingQueue: Map<string, Promise<void>> = new Map();
  private processingChain: Promise<void> = Promise.resolve(); // Serialize all processing
  private cleanupInterval?: NodeJS.Timeout;

  constructor() {
    // No longer using AudioStorageService - we work directly with temp files
    // Schedule periodic cleanup every 6 hours
    this.cleanupInterval = setInterval(() => {
      this.cleanupOrphanedChunks(24).catch(err => 
        console.error('Periodic cleanup failed:', err)
      );
    }, 6 * 60 * 60 * 1000); // 6 hours
  }

  // Process a finished meeting: transcribe audio and generate summary (strict serialization)
  async processMeeting(meetingId: string): Promise<void> {
    // Check if already processing this meeting
    if (this.processingQueue.has(meetingId)) {
      console.log(`⚠️ Meeting ${meetingId} is already being processed`);
      return this.processingQueue.get(meetingId)!;
    }
    
    // STRICT SERIALIZATION: Chain all processing to guarantee max 1 at a time
    const processingPromise = this.processingChain.then(async () => {
      console.log(`🚀 Starting serialized processing for meeting ${meetingId}`);
      return this.doProcessMeeting(meetingId);
    }).finally(() => {
      // Clean up from queue when done
      this.processingQueue.delete(meetingId);
      console.log(`✅ Serialized processing completed for ${meetingId}`);
    });
    
    // Add to queue and update chain
    this.processingQueue.set(meetingId, processingPromise);
    this.processingChain = processingPromise.catch(() => {}); // Continue chain even on errors
    
    return processingPromise;
  }
  
  // Internal processing method
  private async doProcessMeeting(meetingId: string): Promise<void> {
    try {
      console.log(`Starting processing for meeting ${meetingId}`);
      
      // Get meeting details
      const meeting = await storage.getMeetingWithAttendees(meetingId);
      if (!meeting) {
        throw new Error(`Meeting ${meetingId} not found`);
      }

      // Update status to processing
      await storage.updateMeeting(meetingId, { status: 'processing' });

      // MEMORY-OPTIMIZED: Transcribe chunks sequentially to avoid memory spikes
      console.log('🎯 OPTIMIZED: Processing audio chunks sequentially...');
      const transcription = await this.transcribeChunksSequentially(meetingId, meeting.language || 'nl');
      if (!transcription || transcription.length === 0) {
        throw new Error('No audio data found for transcription');
      }
      
      console.log(`✅ Sequential transcription completed (${transcription.length} chars): ${transcription.substring(0, 100)}...`);
      
      // Generate summary
      console.log('Generating AI summary...');
      const summary = await generateMeetingSummary(
        transcription, 
        meeting.title, 
        meeting.language || 'nl'
      );

      // Update meeting with results
      await storage.updateMeeting(meetingId, {
        status: 'completed',
        transcription: transcription,
        summary: summary as any, // Store as JSONB
      });

      console.log(`Meeting ${meetingId} processing completed successfully`);
      
      // Final cleanup of any remaining chunk files
      await this.forceCleanupMeetingChunks(meetingId);

      // Send email summary to attendees
      console.log(`Starting email delivery for meeting ${meetingId} to ${meeting.attendees.length} attendees`);
      await this.sendEmailSummary(meeting, transcription, summary);

    } catch (error: any) {
      console.error(`Error processing meeting ${meetingId}:`, error);
      
      // Mark as failed
      await storage.updateMeeting(meetingId, { 
        status: 'failed',
        summary: { error: error.message } as any
      });
      
      throw error;
    }
  }

  // Memory-optimized: Process chunks sequentially instead of loading all in memory
  private async transcribeChunksSequentially(meetingId: string, language: string): Promise<string> {
    console.log(`🔄 Starting sequential chunk transcription for meeting ${meetingId}`);
    
    const tempDir = path.join('/tmp', 'audio-chunks');
    let fullTranscription = '';
    let processedChunks = 0;
    
    try {
      // Get all chunk files for this meeting, sorted by index
      const files = await readdir(tempDir);
      const chunkFiles = files
        .filter(file => file.startsWith(`${meetingId}-chunk-`) && file.endsWith('.webm'))
        .map(file => {
          const match = file.match(new RegExp(`^${meetingId}-chunk-(\\d+)\\.webm$`));
          return match ? { 
            file, 
            chunkIndex: parseInt(match[1]),
            filePath: path.join(tempDir, file)
          } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a!.chunkIndex - b!.chunkIndex);

      console.log(`📋 Found ${chunkFiles.length} chunks to process sequentially`);
      
      if (chunkFiles.length === 0) {
        throw new Error('No audio chunks found for transcription');
      }
      
      // Process each chunk individually
      for (const chunkFile of chunkFiles) {
        if (chunkFile && fs.existsSync(chunkFile.filePath)) {
          try {
            console.log(`🎙️ Processing chunk ${chunkFile.chunkIndex} (${processedChunks + 1}/${chunkFiles.length})...`);
            
            // Read chunk into memory temporarily
            const chunkBuffer = await readFile(chunkFile.filePath);
            console.log(`📥 Chunk ${chunkFile.chunkIndex} size: ${Math.round(chunkBuffer.length / 1024)} KB`);
            
            // Transcribe this chunk
            const chunkTranscription = await transcribeAudio(chunkBuffer, language);
            
            // Add to full transcription with space separator
            if (chunkTranscription.trim()) {
              fullTranscription += (fullTranscription ? ' ' : '') + chunkTranscription.trim();
              console.log(`✅ Chunk ${chunkFile.chunkIndex} transcribed: ${chunkTranscription.length} chars`);
            }
            
            processedChunks++;
            
            // Clean up chunk file immediately to save disk space
            await unlink(chunkFile.filePath);
            console.log(`🗑️ Cleaned up chunk file: ${chunkFile.file}`);
            
          } catch (error) {
            console.error(`❌ Error processing chunk ${chunkFile.chunkIndex}:`, error);
            // Continue with next chunk instead of failing completely
          }
        }
      }
      
      console.log(`🎉 Sequential transcription completed: ${processedChunks} chunks processed, ${fullTranscription.length} total characters`);
      return fullTranscription;
      
    } catch (error) {
      console.error(`❌ Error in sequential chunk transcription:`, error);
      
      // Cleanup remaining chunks on error
      await this.forceCleanupMeetingChunks(meetingId);
      throw error;
    }
  }
  
  // Robust cleanup that doesn't depend on in-memory Map (works after restarts)
  private async forceCleanupMeetingChunks(meetingId: string): Promise<void> {
    const tempDir = path.join('/tmp', 'audio-chunks');
    
    try {
      console.log(`🗑️ Force cleanup: scanning ${tempDir} for meeting ${meetingId} files...`);
      
      // Check if temp directory exists
      if (!fs.existsSync(tempDir)) {
        console.log(`🗋 Temp directory ${tempDir} doesn't exist, nothing to clean`);
        return;
      }
      
      const files = await readdir(tempDir);
      const meetingFiles = files.filter(file => file.startsWith(`${meetingId}-chunk-`) && file.endsWith('.webm'));
      
      console.log(`🗋 Found ${meetingFiles.length} files to cleanup for meeting ${meetingId}`);
      
      for (const file of meetingFiles) {
        const filePath = path.join(tempDir, file);
        try {
          if (fs.existsSync(filePath)) {
            await unlink(filePath);
            console.log(`✅ Cleaned up: ${file}`);
          }
        } catch (error) {
          console.error(`⚠️ Could not delete ${file}:`, error);
        }
      }
      
      console.log(`🎉 Cleanup completed for meeting ${meetingId}`);
      
    } catch (error) {
      console.error(`❌ Error during force cleanup for meeting ${meetingId}:`, error);
    }
  }
  
  // Periodic cleanup of orphaned files (called periodically)
  async cleanupOrphanedChunks(maxAgeHours: number = 24): Promise<void> {
    const tempDir = path.join('/tmp', 'audio-chunks');
    
    try {
      console.log(`🔄 Running periodic cleanup of orphaned chunks older than ${maxAgeHours} hours...`);
      
      if (!fs.existsSync(tempDir)) {
        console.log(`🗋 No temp directory found at ${tempDir}`);
        return;
      }
      
      const files = await readdir(tempDir);
      const chunkFiles = files.filter(file => file.match(/^[a-f0-9-]+-chunk-\d+\.webm$/));
      
      let cleanedCount = 0;
      const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
      
      for (const file of chunkFiles) {
        const filePath = path.join(tempDir, file);
        try {
          const stats = fs.statSync(filePath);
          const age = Date.now() - stats.mtime.getTime();
          
          if (age > maxAge) {
            await unlink(filePath);
            console.log(`🗑️ Cleaned up orphaned chunk: ${file} (${Math.round(age / 1000 / 60)} minutes old)`);
            cleanedCount++;
          }
        } catch (error) {
          console.error(`⚠️ Error checking/deleting orphaned file ${file}:`, error);
        }
      }
      
      console.log(`🎉 Periodic cleanup completed: ${cleanedCount} orphaned files removed`);
      
    } catch (error) {
      console.error(`❌ Error during periodic cleanup:`, error);
    }
  }

  // Send email summary to attendees
  private async sendEmailSummary(
    meeting: any, 
    transcription: string, 
    summary: MeetingSummary
  ): Promise<void> {
    try {
      console.log(`sendEmailSummary called for meeting ${meeting.id} with ${meeting.attendees.length} attendees`);
      console.log('Attendees:', meeting.attendees.map((a: any) => a.email));
      
      const { emailService } = await import('./emailService');
      
      console.log('EmailService imported, calling sendMeetingSummary...');
      const success = await emailService.sendMeetingSummary(
        meeting.title,
        meeting.attendees,
        transcription,
        summary,
        meeting.language || 'nl'
      );

      if (success) {
        console.log(`✅ Email summary sent successfully for meeting ${meeting.id}`);
      } else {
        console.error(`❌ Failed to send email summary for meeting ${meeting.id}`);
      }
    } catch (error: any) {
      console.error(`❌ Error sending email summary for meeting ${meeting.id}:`, error);
      console.error('Error details:', error?.message || error);
    }
  }
}

export const processingService = new MeetingProcessingService();