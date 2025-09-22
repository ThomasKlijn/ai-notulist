import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../server/storage';
import { requireMeetingOwnership } from '../../../../../lib/ownershipMiddleware';

// Use Node.js runtime for file system operations in processingService
export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Require authentication and meeting ownership
    await requireMeetingOwnership(req, id);

    // Mark meeting as finished and set processing status
    await storage.finishMeeting(id);
    
    // Trigger background processing for speech-to-text and AI summarization
    const { processingService } = await import('../../../../../server/processingService');
    
    // Process in background (don't await to avoid timeout)
    processingService.processMeeting(id).catch(error => {
      console.error(`Background processing failed for meeting ${id}:`, error);
    });
    
    return NextResponse.json({ ok: true });
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
    console.error('Error finishing meeting:', error);
    return NextResponse.json({ error: 'Fout bij afronden meeting' }, { status: 500 });
  }
}