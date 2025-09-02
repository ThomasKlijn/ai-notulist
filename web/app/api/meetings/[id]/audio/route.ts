import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../server/storage';

export const runtime = 'nodejs'; // nodig voor FormData parsing

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meeting = await storage.getMeeting(id);
  if (!meeting) {
    return NextResponse.json({ error: 'meeting niet gevonden' }, { status: 404 });
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

  try {
    // Read the audio data
    const buf = Buffer.from(await file.arrayBuffer());
    
    // Upload to object storage
    const { ObjectStorageService } = await import('../../../../../server/objectStorage');
    const objectStorageService = new ObjectStorageService();
    const objectPath = await objectStorageService.uploadAudioChunk(
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
      objectPath: objectPath
    });

    return NextResponse.json({ 
      ok: true, 
      receivedBytes: buf.length, 
      chunkIndex: parseInt(chunkIndex) 
    });
  } catch (error: any) {
    console.error('Error saving audio chunk:', error);
    return NextResponse.json({ error: 'Fout bij opslaan audio chunk' }, { status: 500 });
  }
}