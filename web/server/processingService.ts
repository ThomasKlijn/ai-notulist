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

      // NEW APPROACH: Combine all chunks into single audio file for transcription
      console.log('🎯 NEW: Combining all audio chunks into single file...');
      const combinedAudioBuffer = await this.audioStorage.combineAudioChunks(meetingId);
      if (combinedAudioBuffer.length === 0) {
        throw new Error('No audio data found for transcription');
      }
      
      console.log(`✅ Combined audio size: ${combinedAudioBuffer.length} bytes (${Math.round(combinedAudioBuffer.length / 1024 / 1024 * 10) / 10} MB)`);
      
      // Transcribe the complete audio file once
      console.log('🎙️ Transcribing complete audio file...');
      const transcription = await transcribeAudio(combinedAudioBuffer, meeting.language || 'nl');
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