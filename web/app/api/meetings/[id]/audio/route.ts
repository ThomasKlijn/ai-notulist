import { NextRequest, NextResponse } from 'next/server';
import { Store } from '@/lib/store';

export const runtime = 'nodejs'; // nodig voor FormData parsing

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const meeting = Store.getMeeting(params.id);
  if (!meeting) return NextResponse.json({ error: 'meeting niet gevonden' }, { status: 404 });

  const form = await req.formData();
  const file = form.get('chunk') as File | null;
  const chunkIndex = form.get('chunkIndex') as string | null;
  if (!file) return NextResponse.json({ error: 'geen audio chunk' }, { status: 400 });

  // MVP: we slaan niet op, maar lezen de bytes zodat de stream geconsumeerd wordt
  const buf = Buffer.from(await file.arrayBuffer());
  // Hier later: upload naar S3 / opslagservice met pad `${meeting.id}/${chunkIndex}.webm`

  Store.incrementChunks(meeting.id);
  return NextResponse.json({ ok: true, receivedBytes: buf.length, chunkIndex });
}