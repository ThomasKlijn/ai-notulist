import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../server/storage';
import { requireMeetingOwnership } from '../../../../../lib/ownershipMiddleware';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Require authentication and meeting ownership
    const { meeting } = await requireMeetingOwnership(req, id);

    // Get full meeting data with attendees and audio chunks count
    const fullMeeting = await storage.getMeetingWithAttendees(id);
    const audioChunks = await storage.getAudioChunks(id);

    return NextResponse.json({
      meeting: {
        id: fullMeeting!.id,
        title: fullMeeting!.title,
        status: fullMeeting!.status,
        createdAt: fullMeeting!.createdAt,
        finishedAt: fullMeeting!.finishedAt,
        language: fullMeeting!.language,
        attendees: fullMeeting!.attendees,
        chunksCount: audioChunks.length,
        transcription: fullMeeting!.transcription,
        summary: fullMeeting!.summary
      }
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
    console.error('Error fetching meeting status:', error);
    return NextResponse.json({ error: 'Fout bij ophalen meeting status' }, { status: 500 });
  }
}