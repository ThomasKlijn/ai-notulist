import { storage } from './storage';
import { AudioStorageService } from './audioStorage';
import { transcribeAudio, generateMeetingSummary, MeetingSummary } from './openai';

export class MeetingProcessingService {
  private audioStorage: AudioStorageService;

  constructor() {
    this.audioStorage = new AudioStorageService();
  }

  // Process a finished meeting: transcribe audio and generate summary
  async processMeeting(meetingId: string): Promise<void> {
    try {
      console.log(`Starting processing for meeting ${meetingId}`);
      
      // Get meeting details
      const meeting = await storage.getMeetingWithAttendees(meetingId);
      if (!meeting) {
        throw new Error(`Meeting ${meetingId} not found`);
      }

      // Update status to processing
      await storage.updateMeeting(meetingId, { status: 'processing' });

      // Get all audio chunks for transcription (transcribe each chunk separately)
      console.log('Getting all audio chunks for transcription...');
      const audioChunks = await storage.getAudioChunks(meetingId);
      if (audioChunks.length === 0) {
        throw new Error('No audio chunks found for transcription');
      }
      
      console.log(`Found ${audioChunks.length} audio chunks to transcribe`);
      
      // Transcribe each chunk separately and combine results
      const transcriptions: string[] = [];
      for (let i = 0; i < audioChunks.length; i++) {
        const chunk = audioChunks[i];
        if (!chunk.objectPath) {
          console.warn(`Skipping chunk ${i}: no object path`);
          continue;
        }
        
        try {
          console.log(`Transcribing chunk ${i + 1}/${audioChunks.length} (${chunk.sizeBytes} bytes)...`);
          const audioBuffer = await this.audioStorage.downloadAudioChunk(chunk.objectPath);
          const chunkTranscription = await transcribeAudio(audioBuffer, meeting.language || 'nl');
          
          if (chunkTranscription.trim()) {
            transcriptions.push(chunkTranscription.trim());
            console.log(`✅ Chunk ${i + 1} transcribed: ${chunkTranscription.substring(0, 50)}...`);
          }
        } catch (error) {
          console.error(`❌ Error transcribing chunk ${i + 1}:`, error);
          // Continue with other chunks
        }
      }
      
      // Combine all transcriptions into one text
      const transcription = transcriptions.join(' ').trim();
      console.log(`✅ Complete transcription (${transcription.length} chars): ${transcription.substring(0, 100)}...`);
      
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