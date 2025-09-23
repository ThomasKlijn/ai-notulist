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
      const errorResponse = NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.issues 
      }, { status: 400 });
      
      // Add aggressive cache prevention headers
      errorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
      errorResponse.headers.set('Pragma', 'no-cache');
      errorResponse.headers.set('Expires', '0');
      
      return errorResponse;
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
    
    // No consent emails sent - consent already given in app
    // Meeting summary with consent confirmation will be sent after recording
    
    const response = NextResponse.json({ 
      id: meeting.id,
      message: 'Meeting created successfully. Recording can begin.'
    });
    
    // Add aggressive cache prevention headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (e: any) {
    if (e.message === 'Authentication required') {
      const authErrorResponse = NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      
      // Add aggressive cache prevention headers
      authErrorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
      authErrorResponse.headers.set('Pragma', 'no-cache');
      authErrorResponse.headers.set('Expires', '0');
      
      return authErrorResponse;
    }
    console.error('Error creating meeting:', e);
    const serverErrorResponse = NextResponse.json({ error: e?.message ?? 'onbekende fout' }, { status: 500 });
    
    // Add aggressive cache prevention headers
    serverErrorResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private, max-age=0');
    serverErrorResponse.headers.set('Pragma', 'no-cache');
    serverErrorResponse.headers.set('Expires', '0');
    
    return serverErrorResponse;
  }
}