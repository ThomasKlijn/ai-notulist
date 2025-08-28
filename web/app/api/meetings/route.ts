import { NextRequest, NextResponse } from 'next/server';
import { Store, Meeting, Attendee } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, attendees, language } = body ?? {};
    if (!title || !Array.isArray(attendees)) {
      return NextResponse.json({ error: 'title en attendees[] verplicht' }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const m: Meeting = {
      id,
      title,
      language: language ?? 'nl',
      createdAt: new Date().toISOString(),
      status: 'recording',
      attendees: attendees.filter((a: Attendee) => a?.email),
      chunksReceived: 0,
    };
    Store.createMeeting(m);
    return NextResponse.json({ id });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'onbekende fout' }, { status: 500 });
  }
}