import { db } from "./db";
import { meetings, attendees, audioChunks, type Meeting, type Attendee, type AudioChunk, type InsertMeeting, type InsertAttendee, type InsertAudioChunk, type MeetingWithAttendees } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Meeting operations
  createMeeting(meeting: InsertMeeting, attendeesList: InsertAttendee[]): Promise<Meeting>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  getMeetingWithAttendees(id: string): Promise<MeetingWithAttendees | undefined>;
  updateMeeting(id: string, updates: Partial<Meeting>): Promise<void>;
  finishMeeting(id: string): Promise<void>;
  
  // Audio chunk operations
  addAudioChunk(chunk: InsertAudioChunk): Promise<AudioChunk>;
  getAudioChunks(meetingId: string): Promise<AudioChunk[]>;
  incrementChunkCount(meetingId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createMeeting(meeting: InsertMeeting, attendeesList: InsertAttendee[]): Promise<Meeting> {
    // Create meeting and attendees in a transaction
    const result = await db.transaction(async (tx) => {
      // Insert meeting
      const [newMeeting] = await tx
        .insert(meetings)
        .values(meeting)
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

    return {
      ...meeting,
      attendees: meetingAttendees
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
}

export const storage = new DatabaseStorage();