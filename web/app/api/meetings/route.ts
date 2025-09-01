import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../server/storage';
import { insertMeetingSchema, insertAttendeeSchema } from '../../../shared/schema';
import { z } from 'zod';

const createMeetingSchema = z.object({
  title: z.string().min(1),
  language: z.string().optional(),
  attendees: z.array(insertAttendeeSchema).min(1)
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validation = createMeetingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.issues 
      }, { status: 400 });
    }

    const { title, attendees, language } = validation.data;
    
    const id = crypto.randomUUID();
    const meetingData = {
      id,
      title,
      language: language ?? 'nl',
      status: 'recording' as const
    };

    // Create meeting with attendees
    const meeting = await storage.createMeeting(
      meetingData, 
      attendees.filter(a => a?.email)
    );
    
    return NextResponse.json({ id: meeting.id });
  } catch (e: any) {
    console.error('Error creating meeting:', e);
    return NextResponse.json({ error: e?.message ?? 'onbekende fout' }, { status: 500 });
  }
}