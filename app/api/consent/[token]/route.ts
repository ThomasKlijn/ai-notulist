import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../server/storage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    
    // Get attendee by consent token
    const attendee = await storage.getAttendeeByConsentToken(token);
    
    if (!attendee) {
      return NextResponse.json({ error: 'Invalid consent token' }, { status: 404 });
    }
    
    // Get meeting details
    const meeting = await storage.getMeeting(attendee.meetingId);
    
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      attendee: {
        name: attendee.name,
        email: attendee.email,
        consentGiven: attendee.consentGiven
      },
      meeting: {
        title: meeting.title,
        createdAt: meeting.createdAt,
        language: meeting.language
      },
      token
    });
  } catch (error: any) {
    console.error('Error fetching consent details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const body = await req.json();
    const { action } = body; // 'give' or 'withdraw'
    
    if (!['give', 'withdraw'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Use "give" or "withdraw"' }, { status: 400 });
    }
    
    // Update attendee consent
    const result = await storage.updateAttendeeConsent(token, action === 'give');
    
    if (!result) {
      return NextResponse.json({ error: 'Invalid consent token or operation failed' }, { status: 404 });
    }
    
    // Check if all attendees have consented and update meeting status
    await storage.updateMeetingConsentStatus(result.meetingId);
    
    return NextResponse.json({ 
      ok: true, 
      consentGiven: action === 'give',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error updating consent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}