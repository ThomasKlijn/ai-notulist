import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../server/storage';
import { requireMeetingOwnership } from '../../../../../lib/ownershipMiddleware';

export const runtime = 'nodejs'; // nodig voor FormData parsing

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Require authentication and meeting ownership
    const { meeting } = await requireMeetingOwnership(req, id);
    
    // GDPR: Require full consent before accepting audio
    if (!meeting.organizerConsentGiven || !meeting.allAttendeesConsented) {
      return NextResponse.json({ 
        error: 'Audio recording is not permitted - missing required consent from organizer or attendees',
        consent_status: {
          organizer_consent: meeting.organizerConsentGiven,
          all_attendees_consent: meeting.allAttendeesConsented
        }
      }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get('chunk') as File | null;
    const chunkIndex = form.get('chunkIndex') as string | null;
  
  if (!file) {
    return NextResponse.json({ error: 'geen audio chunk' }, { status: 400 });
  }

  if (chunkIndex === null) {
    return NextResponse.json({ error: 'chunkIndex is verplicht' }, { status: 400 });
  }

    // Read the audio data
    const buf = Buffer.from(await file.arrayBuffer());
    
    // Store audio chunk in memory
    const { AudioStorageService } = await import('../../../../../server/audioStorage');
    const audioStorageService = new AudioStorageService();
    const chunkKey = await audioStorageService.uploadAudioChunk(
      id, 
      parseInt(chunkIndex), 
      buf
    );
    
    // Save audio chunk metadata to database
    const filename = `chunk-${chunkIndex}.webm`;
    
    await storage.addAudioChunk({
      meetingId: id,
      chunkIndex: parseInt(chunkIndex),
      filename,
      sizeBytes: buf.length,
      objectPath: chunkKey
    });

    return NextResponse.json({ 
      ok: true, 
      receivedBytes: buf.length, 
      chunkIndex: parseInt(chunkIndex) 
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
    console.error('Error saving audio chunk:', error);
    return NextResponse.json({ error: 'Fout bij opslaan audio chunk' }, { status: 500 });
  }
}