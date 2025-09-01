import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../server/storage';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const meeting = await storage.getMeeting(params.id);
    if (!meeting) {
      return NextResponse.json({ error: 'meeting niet gevonden' }, { status: 404 });
    }

    // Mark meeting as finished and set processing status
    await storage.finishMeeting(params.id);
    
    // Trigger background processing for speech-to-text and AI summarization
    const { processingService } = await import('../../../../server/processingService');
    
    // Process in background (don't await to avoid timeout)
    processingService.processMeeting(params.id).catch(error => {
      console.error(`Background processing failed for meeting ${params.id}:`, error);
    });
    
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error finishing meeting:', error);
    return NextResponse.json({ error: 'Fout bij afronden meeting' }, { status: 500 });
  }
}