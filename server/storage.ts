import { db } from "./db";
import { meetings, attendees, audioChunks, speakers, users, type Meeting, type Attendee, type AudioChunk, type Speaker, type User, type InsertMeeting, type InsertAttendee, type InsertAudioChunk, type InsertSpeaker, type UpsertUser, type MeetingWithAttendees } from "../shared/schema";
import { eq, and, lt } from "drizzle-orm";

export interface IStorage {
  // Meeting operations  
  createMeeting(meeting: InsertMeeting, attendeesList: InsertAttendee[], userId: string): Promise<Meeting>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  getMeetingWithAttendees(id: string): Promise<MeetingWithAttendees | undefined>;
  updateMeeting(id: string, updates: Partial<Meeting>): Promise<void>;
  finishMeeting(id: string): Promise<void>;
  
  // Audio chunk operations
  addAudioChunk(chunk: InsertAudioChunk): Promise<AudioChunk>;
  getAudioChunks(meetingId: string): Promise<AudioChunk[]>;
  incrementChunkCount(meetingId: string): Promise<void>;
  
  // Speaker operations
  addSpeakers(meetingId: string, speakersList: InsertSpeaker[]): Promise<Speaker[]>;
  getSpeakers(meetingId: string): Promise<Speaker[]>;
  updateSpeakerName(meetingId: string, speakerId: string, name: string): Promise<void>;
  
  // Auto-cleanup operations
  getMeetingsForCleanup(retentionDays?: number): Promise<Meeting[]>;
  cleanupMeeting(meetingId: string): Promise<void>;
  updateLastCleanup(meetingId: string): Promise<void>;
  
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // GDPR Consent Management
  getAttendeeByConsentToken(token: string): Promise<(Attendee & { meetingId: string }) | null>;
  updateAttendeeConsent(token: string, consentGiven: boolean): Promise<{ meetingId: string } | null>;
  updateMeetingConsentStatus(meetingId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createMeeting(meeting: InsertMeeting, attendeesList: InsertAttendee[], userId: string): Promise<Meeting> {
    // Create meeting and attendees in a transaction
    const result = await db.transaction(async (tx) => {
      // Insert meeting with userId
      const [newMeeting] = await tx
        .insert(meetings)
        .values({ ...meeting, userId })
        .returning();
      
      // Insert attendees with consent tokens
      if (attendeesList.length > 0) {
        await tx
          .insert(attendees)
          .values(attendeesList.map(attendee => ({
            ...attendee,
            meetingId: newMeeting.id,
            consentToken: crypto.randomUUID() // Generate unique consent token for each attendee
          })));
      }
      
      return newMeeting;
    });
    
    return result;
  }

  async getMeeting(id: string): Promise<Meeting | undefined> {
    const [meeting] = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, id));
    
    return meeting || undefined;
  }

  async getMeetingWithAttendees(id: string): Promise<MeetingWithAttendees | undefined> {
    const meeting = await this.getMeeting(id);
    if (!meeting) return undefined;

    const meetingAttendees = await db
      .select()
      .from(attendees)
      .where(eq(attendees.meetingId, id));

    const meetingSpeakers = await db
      .select()
      .from(speakers)
      .where(eq(speakers.meetingId, id))
      .orderBy(speakers.percentage); // Order by speaking time

    return {
      ...meeting,
      attendees: meetingAttendees,
      speakers: meetingSpeakers
    };
  }

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<void> {
    await db
      .update(meetings)
      .set(updates)
      .where(eq(meetings.id, id));
  }

  async finishMeeting(id: string): Promise<void> {
    await this.updateMeeting(id, {
      status: 'processing',
      finishedAt: new Date()
    });
  }

  async addAudioChunk(chunk: InsertAudioChunk): Promise<AudioChunk> {
    const [newChunk] = await db
      .insert(audioChunks)
      .values(chunk)
      .returning();
    
    return newChunk;
  }

  async getAudioChunks(meetingId: string): Promise<AudioChunk[]> {
    return await db
      .select()
      .from(audioChunks)
      .where(eq(audioChunks.meetingId, meetingId))
      .orderBy(audioChunks.chunkIndex);
  }

  async incrementChunkCount(meetingId: string): Promise<void> {
    // This is now handled by adding audio chunks directly
    // Can be used for updating meeting status if needed
  }

  // Speaker operations
  async addSpeakers(meetingId: string, speakersList: InsertSpeaker[]): Promise<Speaker[]> {
    if (speakersList.length === 0) return [];
    
    const newSpeakers = await db
      .insert(speakers)
      .values(speakersList.map(speaker => ({
        ...speaker,
        meetingId
      })))
      .returning();
    
    return newSpeakers;
  }

  async getSpeakers(meetingId: string): Promise<Speaker[]> {
    return await db
      .select()
      .from(speakers)
      .where(eq(speakers.meetingId, meetingId))
      .orderBy(speakers.percentage); // Order by speaking time percentage
  }

  async updateSpeakerName(meetingId: string, speakerId: string, name: string): Promise<void> {
    await db
      .update(speakers)
      .set({ speakerName: name })
      .where(and(eq(speakers.meetingId, meetingId), eq(speakers.speakerId, speakerId)));
  }

  // Auto-cleanup operations - returns meetings that could need cleanup (app filters by age)
  async getMeetingsForCleanup(retentionDays?: number): Promise<Meeting[]> {
    return await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.autoCleanupEnabled, true),
          eq(meetings.status, 'completed') // Only cleanup completed meetings
        )
      )
      .orderBy(meetings.createdAt);
  }

  async cleanupMeeting(meetingId: string): Promise<void> {
    // This will cascade delete attendees, audio_chunks, and speakers due to foreign keys
    await db
      .delete(meetings)
      .where(eq(meetings.id, meetingId));
  }

  async updateLastCleanup(meetingId: string): Promise<void> {
    await db
      .update(meetings)
      .set({ lastCleanupAt: new Date() })
      .where(eq(meetings.id, meetingId));
  }
  
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // GDPR Consent Management Implementation
  async getAttendeeByConsentToken(token: string): Promise<(Attendee & { meetingId: string }) | null> {
    const [attendee] = await db
      .select()
      .from(attendees)
      .where(eq(attendees.consentToken, token));
    
    return attendee || null;
  }

  async updateAttendeeConsent(token: string, consentGiven: boolean): Promise<{ meetingId: string } | null> {
    const timestamp = new Date();
    
    return await db.transaction(async (tx) => {
      // Update attendee consent status
      const [result] = await tx
        .update(attendees)
        .set({
          consentGiven,
          consentTimestamp: consentGiven ? timestamp : attendees.consentTimestamp, // Preserve original timestamp
          consentWithdrawn: !consentGiven,
          withdrawalTimestamp: !consentGiven ? timestamp : null
        })
        .where(eq(attendees.consentToken, token))
        .returning({ meetingId: attendees.meetingId });
      
      if (!result) return null;
      
      // GDPR: If consent withdrawn, delete audio data and cleanup temp files
      if (!consentGiven) {
        await this.handleConsentWithdrawal(result.meetingId, tx);
        
        // Immediate cleanup of temp files (import dynamically to avoid circular deps)
        try {
          const { processingService } = await import('./processingService');
          await processingService.forceCleanupMeetingChunks(result.meetingId);
        } catch (error) {
          console.error('Failed to cleanup temp files after consent withdrawal:', error);
        }
      }
      
      return result;
    });
  }

  // GDPR Data Deletion on Consent Withdrawal
  private async handleConsentWithdrawal(meetingId: string, tx?: any) {
    const dbConn = tx || db;
    
    // Get all audio chunks to delete binary data
    const chunks = await dbConn
      .select()
      .from(audioChunks)
      .where(eq(audioChunks.meetingId, meetingId));
    
    // Delete binary audio data from object storage
    try {
      const { AudioStorageService } = await import('./audioStorage');
      const audioStorageService = new AudioStorageService();
      
      for (const chunk of chunks) {
        if (chunk.objectPath) {
          await audioStorageService.deleteAudioChunk(chunk.objectPath);
        }
      }
    } catch (error) {
      console.error('Failed to delete audio binaries from storage:', error);
      // Continue with DB cleanup even if binary deletion fails
    }
    
    // Delete audio chunk metadata from database
    await dbConn
      .delete(audioChunks)
      .where(eq(audioChunks.meetingId, meetingId));
    
    // Clear transcription and summary data
    await dbConn
      .update(meetings)
      .set({
        transcription: null,
        summary: null,
        speakerData: null,
        status: 'cancelled' // Mark as cancelled due to consent withdrawal
      })
      .where(eq(meetings.id, meetingId));
    
    // Delete speaker analysis data
    await dbConn
      .delete(speakers)
      .where(eq(speakers.meetingId, meetingId));
    
    console.log(`GDPR: Complete data deletion (DB + binaries) for meeting ${meetingId} due to consent withdrawal`);
  }

  async updateMeetingConsentStatus(meetingId: string): Promise<void> {
    // Check if all attendees have consented
    const attendeesList = await db
      .select()
      .from(attendees)
      .where(eq(attendees.meetingId, meetingId));
    
    const allConsented = attendeesList.length > 0 && 
      attendeesList.every(attendee => attendee.consentGiven && !attendee.consentWithdrawn);
    
    // Update meeting status
    await db
      .update(meetings)
      .set({ allAttendeesConsented: allConsented })
      .where(eq(meetings.id, meetingId));
  }
}

export const storage = new DatabaseStorage();