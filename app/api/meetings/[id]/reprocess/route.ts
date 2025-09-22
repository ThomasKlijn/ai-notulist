import { NextRequest, NextResponse } from 'next/server';
import { requireMeetingOwnership } from '../../../../../lib/ownershipMiddleware';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Require authentication and meeting ownership
    const { meeting } = await requireMeetingOwnership(req, id);
    
    // GDPR: Require full consent before reprocessing
    if (!meeting.organizerConsentGiven || !meeting.allAttendeesConsented) {
      return NextResponse.json({ 
        error: 'Reprocessing is not permitted - missing required consent from organizer or attendees',
        consent_status: {
          organizer_consent: meeting.organizerConsentGiven,
          all_attendees_consent: meeting.allAttendeesConsented
        }
      }, { status: 403 });
    }
    
    // Trigger reprocessing
    const { processingService } = await import('../../../../../server/processingService');
    
    // Process in background (don't await to avoid timeout)
    processingService.processMeeting(id).catch(error => {
      console.error(`Background reprocessing failed for meeting ${id}:`, error);
    });
    
    return NextResponse.json({ 
      ok: true,
      message: 'Meeting reprocessing started'
    });
  } catch (error: any) {
    if (error.name === 'NotFound') {
      return NextResponse.json({ error: 'Meeting niet gevonden' }, { status: 404 });
    }
    if (error.name === 'Forbidden') {
      return NextResponse.json({ error: 'Geen toegang tot deze meeting' }, { status: 403 });
    }
    if (error.message === 'Authentication required') {
      return NextResponse.json({ error: 'Authenticatie vereist' }, { status: 401 });
    }
    console.error('Error reprocessing meeting:', error);
    return NextResponse.json({ error: 'Fout bij herverwerken meeting' }, { status: 500 });
  }
}