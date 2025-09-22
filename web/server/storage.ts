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
      
      // Insert attendees
      if (attendeesList.length > 0) {
        await tx
          .insert(attendees)
          .values(attendeesList.map(attendee => ({
            ...attendee,
            meetingId: newMeeting.id
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
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
}

export const storage = new DatabaseStorage();