import { pgTable, varchar, text, timestamp, integer, jsonb, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Meetings table
export const meetings = pgTable('meetings', {
  id: varchar('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  language: varchar('language', { length: 10 }).default('nl'),
  status: varchar('status', { length: 20 }).notNull().default('recording'), // 'recording' | 'processing' | 'completed' | 'failed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  finishedAt: timestamp('finished_at'),
  transcription: text('transcription'),
  summary: jsonb('summary'), // Will store structured summary with key points, decisions, actions
});

// Attendees table
export const attendees = pgTable('attendees', {
  id: serial('id').primaryKey(),
  meetingId: varchar('meeting_id').notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 100 }),
});

// Audio chunks table - tracks audio file segments
export const audioChunks = pgTable('audio_chunks', {
  id: serial('id').primaryKey(),
  meetingId: varchar('meeting_id').notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  chunkIndex: integer('chunk_index').notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  objectPath: varchar('object_path', { length: 500 }), // Path in object storage
  sizeBytes: integer('size_bytes'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
});

// Relations
import { relations } from 'drizzle-orm';

export const meetingsRelations = relations(meetings, ({ many }) => ({
  attendees: many(attendees),
  audioChunks: many(audioChunks),
}));

export const attendeesRelations = relations(attendees, ({ one }) => ({
  meeting: one(meetings, {
    fields: [attendees.meetingId],
    references: [meetings.id],
  }),
}));

export const audioChunksRelations = relations(audioChunks, ({ one }) => ({
  meeting: one(meetings, {
    fields: [audioChunks.meetingId],
    references: [meetings.id],
  }),
}));

// Zod schemas for validation
export const insertMeetingSchema = createInsertSchema(meetings).omit({
  createdAt: true,
  finishedAt: true,
  transcription: true,
  summary: true,
});

export const insertAttendeeSchema = createInsertSchema(attendees).omit({
  id: true,
  meetingId: true,
});

export const insertAudioChunkSchema = createInsertSchema(audioChunks).omit({
  id: true,
  uploadedAt: true,
});

// Types
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Attendee = typeof attendees.$inferSelect;
export type InsertAttendee = z.infer<typeof insertAttendeeSchema>;
export type AudioChunk = typeof audioChunks.$inferSelect;
export type InsertAudioChunk = z.infer<typeof insertAudioChunkSchema>;

// Extended types for API responses
export type MeetingWithAttendees = Meeting & {
  attendees: Attendee[];
  audioChunks?: AudioChunk[];
};