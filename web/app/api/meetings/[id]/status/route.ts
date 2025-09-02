import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../server/storage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const meeting = await storage.getMeetingWithAttendees(id);
    if (!meeting) {
      return NextResponse.json({ error: 'meeting niet gevonden' }, { status: 404 });
    }

    // Get audio chunks count
    const audioChunks = await storage.getAudioChunks(id);

    return NextResponse.json({
      meeting: {
        id: meeting.id,
        title: meeting.title,
        status: meeting.status,
        createdAt: meeting.createdAt,
        finishedAt: meeting.finishedAt,
        language: meeting.language,
        attendees: meeting.attendees,
        chunksCount: audioChunks.length,
        transcription: meeting.transcription,
        summary: meeting.summary
      }
    });
  } catch (error: any) {
    console.error('Error fetching meeting status:', error);
    return NextResponse.json({ error: 'Fout bij ophalen meeting status' }, { status: 500 });
  }
}