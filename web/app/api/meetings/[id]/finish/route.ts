import { NextRequest, NextResponse } from 'next/server';
import { Store } from '@/lib/store';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const meeting = Store.getMeeting(params.id);
  if (!meeting) return NextResponse.json({ error: 'meeting niet gevonden' }, { status: 404 });
  // Markeer als finished; volgende stap triggert hier een queue/job voor STT → summary → mail
  Store.updateMeeting(meeting.id, { status: 'finished' });
  return NextResponse.json({ ok: true });
}