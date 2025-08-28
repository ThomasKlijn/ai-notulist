'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

export default function MeetingRecordPage() {
  const { id } = useParams<{ id: string }>();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [chunksSent, setChunksSent] = useState(0);
  const chunkIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); recorder?.stop(); stream?.getTracks().forEach(t => t.stop()); };
  }, [recorder, stream]);

  const start = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(userStream);
      const mime = 'audio/webm'; // brede support (Chrome/Edge/Firefox). Safari: fallback mogelijk (m4a) in latere stap.
      const rec = new MediaRecorder(userStream, { mimeType: mime });

      rec.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          const idx = chunkIndexRef.current++;
          const fd = new FormData();
          fd.append('chunk', e.data, `chunk-${idx}.webm`);
          fd.append('chunkIndex', String(idx));
          try {
            const res = await fetch(`/api/meetings/${id}/audio`, { method: 'POST', body: fd });
            if (res.ok) setChunksSent(prev => prev + 1);
            else console.error('upload fout', await res.text());
          } catch (err) { console.error('upload error', err); }
        }
      };

      rec.start(15000); // elke 15s een chunk
      setRecorder(rec); setRecording(true); setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } catch (err: any) {
      alert('Microfoon-toegang geweigerd of niet beschikbaar.');
      console.error(err);
    }
  };

  const stop = async () => {
    if (!recorder) return;
    recorder.stop(); setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    stream?.getTracks().forEach(t => t.stop());
    setStream(null); setRecorder(null);
    try { await fetch(`/api/meetings/${id}/finish`, { method: 'POST' }); } catch {}
  };

  const fmt = (s: number) => new Date(s * 1000).toISOString().substring(11, 19);

  return (
    <main>
      <h2>Opname bezig — Meeting {id}</h2>
      <p>Tijd: <strong>{fmt(seconds)}</strong> · Verzonden chunks: <strong>{chunksSent}</strong></p>
      <div style={{ display: 'flex', gap: 12 }}>
        {!recording ? (
          <button onClick={start}>Start opname</button>
        ) : (
          <button onClick={stop}>Stop & afronden</button>
        )}
      </div>
      <p style={{ marginTop: 12, color: '#555' }}>Laat de laptop/telefoon op tafel liggen. Sluit dit tabblad niet tijdens de opname.</p>
    </main>
  );
}