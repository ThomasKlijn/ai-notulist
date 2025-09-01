'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AttendeesInput from '../../../components/AttendeesInput';

type Attendee = { name?: string; email: string };

export default function NewMeetingPage() {
  const r = useRouter();
  const [title, setTitle] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [language, setLanguage] = useState('nl');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title || attendees.length === 0) { alert('Titel en minimaal 1 e‑mail nodig'); return; }
    setBusy(true);
    const res = await fetch('/api/meetings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, attendees, language })
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { alert(json.error || 'Fout'); return; }
    r.push(`/meetings/${json.id}`);
  };

  return (
    <main>
      <h2>Nieuwe meeting</h2>
      <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600 }}>Titel</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bijv. Weekly stand‑up" style={{ width: '100%', padding: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600 }}>Taal</label>
          <select value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="nl">Nederlands</option>
            <option value="en">Engels</option>
          </select>
        </div>
        <AttendeesInput onChange={setAttendees} />
        <div>
          <button type="button" onClick={submit} disabled={busy}>{busy ? 'Aanmaken…' : 'Start opname'}</button>
        </div>
      </div>
    </main>
  );
}