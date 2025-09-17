import { storage } from './storage';
import { transcribeAudio, generateMeetingSummary } from './openai';
import { transcribeWithSpeakerAnalysis } from './elevenlabs';
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
      // Clean orphaned audio chunks
      this.cleanupOrphanedChunks(24).catch(err => 
        console.error('Periodic orphaned chunks cleanup failed:', err)
      );
      
      // Clean old meetings according to retention policy
      this.runAutoCleanup().catch(err => 
        console.error('Periodic meeting cleanup failed:', err)
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

      // MEMORY-OPTIMIZED: Transcribe chunks sequentially WITH SPEAKER DIARIZATION
      console.log('🎯 OPTIMIZED: Processing audio chunks sequentially with speaker analysis...');
      const { transcription, speakers } = await this.transcribeChunksWithSpeakers(meetingId, meeting.language || 'nl');
      if (!transcription || transcription.length === 0) {
        throw new Error('No audio data found for transcription');
      }
      
      console.log(`✅ Sequential transcription completed (${transcription.length} chars): ${transcription.substring(0, 100)}...`);
      console.log(`👥 Speaker analysis: ${speakers.length} speakers detected`);
      
      // Save speaker data to database
      if (speakers.length > 0) {
        await storage.addSpeakers(meetingId, speakers.map(speaker => ({
          speakerId: speaker.id,
          duration: Math.round(speaker.duration),
          percentage: speaker.percentage
        })));
        
        // Also store raw speaker data as JSONB
        await storage.updateMeeting(meetingId, { speakerData: speakers as any });
        console.log(`👥 Saved ${speakers.length} speakers to database`);
      }
      
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

      // Send email summary to attendees (refetch meeting with speakers)
      console.log(`Starting email delivery for meeting ${meetingId} to ${meeting.attendees.length} attendees`);
      const meetingWithSpeakers = await storage.getMeetingWithAttendees(meetingId);
      await this.sendEmailSummary(meetingWithSpeakers || meeting, transcription, summary);

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

  // Memory-optimized: Process chunks sequentially WITH SPEAKER DIARIZATION
  private async transcribeChunksWithSpeakers(meetingId: string, language: string): Promise<{
    transcription: string;
    speakers: Array<{ id: string; duration: number; percentage: number; }>;
  }> {
    console.log(`🔄 Starting sequential chunk transcription with speaker analysis for meeting ${meetingId}`);
    
    const tempDir = path.join('/tmp', 'audio-chunks');
    let fullTranscription = '';
    let allSpeakers = new Map<string, { duration: number; segments: number; }>();
    let totalDuration = 0;
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
            
            // Transcribe this chunk WITH speaker analysis  
            const chunkResult = await transcribeWithSpeakerAnalysis(chunkBuffer, language);
            
            // Add to full transcription with space separator
            if (chunkResult.text.trim()) {
              fullTranscription += (fullTranscription ? ' ' : '') + chunkResult.text.trim();
              console.log(`✅ Chunk ${chunkFile.chunkIndex} transcribed: ${chunkResult.text.length} chars, ${chunkResult.speakers.length} speakers`);
              
              // Accumulate speaker data
              totalDuration += chunkResult.totalDuration;
              for (const speaker of chunkResult.speakers) {
                if (!allSpeakers.has(speaker.id)) {
                  allSpeakers.set(speaker.id, { duration: 0, segments: 0 });
                }
                const existing = allSpeakers.get(speaker.id)!;
                existing.duration += speaker.duration;
                existing.segments++;
              }
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
      
      // Calculate final speaker percentages
      const speakers = Array.from(allSpeakers.entries()).map(([id, data]) => ({
        id,
        duration: Math.round(data.duration * 10) / 10,
        percentage: totalDuration > 0 ? Math.round((data.duration / totalDuration) * 100) : 0
      })).sort((a, b) => b.percentage - a.percentage); // Sort by speaking time
      
      console.log(`🎉 Sequential transcription completed: ${processedChunks} chunks processed, ${fullTranscription.length} total characters`);
      console.log(`👥 Final speaker analysis: ${speakers.length} unique speakers over ${Math.round(totalDuration)}s`);
      speakers.forEach(speaker => {
        console.log(`   - ${speaker.id}: ${speaker.duration}s (${speaker.percentage}%)`);
      });
      
      return { transcription: fullTranscription, speakers };
      
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
  
  // AUTO-CLEANUP POLICY: Remove old meetings according to retention settings
  async runAutoCleanup(): Promise<void> {
    try {
      console.log('🔄 Running auto-cleanup policy for old meetings...');
      
      // Get all meetings that could be candidates for cleanup
      const meetings = await storage.getMeetingsForCleanup();
      let cleanedCount = 0;
      
      for (const meeting of meetings) {
        if (!meeting.autoCleanupEnabled) {
          continue;
        }
        
        const retentionDays = meeting.retentionDays || 30;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        
        // Check if meeting is older than retention period
        if (meeting.createdAt <= cutoffDate) {
          console.log(`🗑️ Auto-cleanup: Meeting "${meeting.title}" (${meeting.id}) is ${retentionDays}+ days old`);
          
          try {
            // Clean up associated audio files first
            await this.forceCleanupMeetingChunks(meeting.id);
            
            // Delete meeting from database (cascades to attendees, speakers, chunks)
            await storage.cleanupMeeting(meeting.id);
            
            cleanedCount++;
            console.log(`✅ Auto-cleanup: Removed meeting "${meeting.title}" and all associated data`);
            
          } catch (error) {
            console.error(`❌ Auto-cleanup failed for meeting ${meeting.id}:`, error);
            // Update last cleanup attempt even if failed
            await storage.updateLastCleanup(meeting.id);
          }
        } else {
          // Meeting is still within retention period, just update last check
          await storage.updateLastCleanup(meeting.id);
        }
      }
      
      console.log(`🎉 Auto-cleanup completed: ${cleanedCount} meetings removed`);
      
    } catch (error) {
      console.error('❌ Error during auto-cleanup policy execution:', error);
    }
  }
  
  // Manual cleanup for specific meeting (for user-triggered deletion)
  async manualCleanupMeeting(meetingId: string): Promise<void> {
    try {
      console.log(`🗑️ Manual cleanup requested for meeting ${meetingId}`);
      
      // Clean audio files
      await this.forceCleanupMeetingChunks(meetingId);
      
      // Delete from database
      await storage.cleanupMeeting(meetingId);
      
      console.log(`✅ Manual cleanup completed for meeting ${meetingId}`);
      
    } catch (error) {
      console.error(`❌ Manual cleanup failed for meeting ${meetingId}:`, error);
      throw error;
    }
  }
  
  // Configure retention policy for a meeting
  async updateRetentionPolicy(meetingId: string, retentionDays: number, autoCleanup: boolean = true): Promise<void> {
    await storage.updateMeeting(meetingId, {
      retentionDays: retentionDays,
      autoCleanupEnabled: autoCleanup
    });
    
    console.log(`📝 Updated retention policy for meeting ${meetingId}: ${retentionDays} days, auto-cleanup: ${autoCleanup}`);
  }
  
  // Get cleanup statistics
  async getCleanupStats(): Promise<{
    totalMeetings: number;
    meetingsWithAutoCleanup: number;
    meetingsEligibleForCleanup: number;
    averageRetentionDays: number;
  }> {
    const meetings = await storage.getMeetingsForCleanup();
    const withAutoCleanup = meetings.filter(m => m.autoCleanupEnabled);
    
    let eligibleCount = 0;
    let totalRetentionDays = 0;
    
    for (const meeting of meetings) {
      const retentionDays = meeting.retentionDays || 30;
      totalRetentionDays += retentionDays;
      
      if (meeting.autoCleanupEnabled) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        
        if (meeting.createdAt <= cutoffDate) {
          eligibleCount++;
        }
      }
    }
    
    return {
      totalMeetings: meetings.length,
      meetingsWithAutoCleanup: withAutoCleanup.length,
      meetingsEligibleForCleanup: eligibleCount,
      averageRetentionDays: meetings.length > 0 ? Math.round(totalRetentionDays / meetings.length) : 30
    };
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

  // Send email summary to attendees (with speaker info if available)
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
      
      // Enhance summary with speaker information if available
      const enhancedSummary = {
        ...summary,
        speakers: meeting.speakers || []
      };
      
      const success = await emailService.sendMeetingSummary(
        meeting.title,
        meeting.attendees,
        transcription,
        enhancedSummary,
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