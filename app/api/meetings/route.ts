import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../server/storage';
import { insertMeetingSchema, insertAttendeeSchema } from '../../../shared/schema';
import { requireAuth } from '../../../lib/authMiddleware';
import { z } from 'zod';

// Simple schema that matches frontend exactly
const createMeetingSchema = z.object({
  title: z.string().min(1),
  language: z.string().optional(),
  attendees: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    role: z.string().optional()
  })).min(1),
  consentGiven: z.boolean().refine(val => val === true, {
    message: "Privacy consent is required to create a meeting"
  })
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

    const { title, attendees, language, consentGiven } = validation.data;
    
    const id = crypto.randomUUID();
    const meetingData = {
      id,
      title,
      language: language ?? 'nl',
      status: 'recording' as const,
      organizerConsentGiven: consentGiven,
      organizerConsentTimestamp: new Date()
    };

    // Create meeting with attendees and link to authenticated user
    const meeting = await storage.createMeeting(
      meetingData, 
      attendees.filter(a => a?.email),
      user.id
    );
    
    // Send consent emails to all attendees (background process)
    setTimeout(async () => {
      try {
        const { EmailService } = await import('../../../lib/emailService');
        const meetingWithAttendees = await storage.getMeetingWithAttendees(meeting.id);
        const fullUser = await storage.getUser(user.id); // Get full user details
        
        if (meetingWithAttendees?.attendees) {
          for (const attendee of meetingWithAttendees.attendees) {
            if (attendee.consentToken) {
              await EmailService.sendConsentRequest({
                attendeeName: attendee.name || '',
                attendeeEmail: attendee.email,
                meetingTitle: meeting.title,
                organizerName: fullUser ? `${fullUser.firstName || ''} ${fullUser.lastName || ''}`.trim() || 'Meeting organizer' : 'Meeting organizer',
                consentToken: attendee.consentToken,
                meetingDate: new Date(meeting.createdAt).toLocaleDateString()
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to send consent emails:', error);
      }
    }, 100); // Small delay to avoid blocking response
    
    return NextResponse.json({ 
      id: meeting.id,
      message: 'Meeting created. Consent emails sent to attendees.'
    });
  } catch (e: any) {
    if (e.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.error('Error creating meeting:', e);
    return NextResponse.json({ error: e?.message ?? 'onbekende fout' }, { status: 500 });
  }
}