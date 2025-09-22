import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../server/storage';
import { insertMeetingSchema, insertAttendeeSchema } from '../../../shared/schema';
import { requireAuth } from '../../../lib/authMiddleware';
import { z } from 'zod';

const createMeetingSchema = z.object({
  title: z.string().min(1),
  language: z.string().optional(),
  attendees: z.array(insertAttendeeSchema).min(1)
});

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth(req);
    
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

    // Create meeting with attendees and link to authenticated user
    const meeting = await storage.createMeeting(
      meetingData, 
      attendees.filter(a => a?.email),
      user.id
    );
    
    return NextResponse.json({ id: meeting.id });
  } catch (e: any) {
    if (e.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error creating meeting:', e);
    return NextResponse.json({ error: e?.message ?? 'onbekende fout' }, { status: 500 });
  }
}