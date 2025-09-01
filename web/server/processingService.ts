import { storage } from './storage';
import { ObjectStorageService } from './objectStorage';
import { transcribeAudio, generateMeetingSummary, MeetingSummary } from './openai';

export class MeetingProcessingService {
  private objectStorage: ObjectStorageService;

  constructor() {
    this.objectStorage = new ObjectStorageService();
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

      // Combine all audio chunks
      console.log('Combining audio chunks...');
      const combinedAudio = await this.objectStorage.combineAudioChunks(meetingId);
      
      // Transcribe audio
      console.log('Transcribing audio...');
      const transcription = await transcribeAudio(combinedAudio, meeting.language || 'nl');
      
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

      // TODO: Send email summary to attendees
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
      const { emailService } = await import('./emailService');
      
      const success = await emailService.sendMeetingSummary(
        meeting.title,
        meeting.attendees,
        transcription,
        summary,
        meeting.language || 'nl'
      );

      if (success) {
        console.log(`Email summary sent successfully for meeting ${meeting.id}`);
      } else {
        console.error(`Failed to send email summary for meeting ${meeting.id}`);
      }
    } catch (error) {
      console.error(`Error sending email summary for meeting ${meeting.id}:`, error);
    }
  }
}

export const processingService = new MeetingProcessingService();