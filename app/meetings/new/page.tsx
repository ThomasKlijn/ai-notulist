'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AttendeesInput from '../../../components/AttendeesInput';

type Attendee = { name?: string; email: string };

// Force no caching for consent form
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function NewMeetingPage() {
  const r = useRouter();
  const [title, setTitle] = useState('');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [language, setLanguage] = useState('nl');
  const [busy, setBusy] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const submit = async () => {
    if (!title || attendees.length === 0) { 
      alert('Titel en minimaal 1 e‑mail nodig'); 
      return; 
    }
    if (!consentGiven) {
      alert('Privacy toestemming is verplicht om een meeting aan te maken');
      return;
    }
    setBusy(true);
    const res = await fetch('/api/meetings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, attendees, language, consentGiven })
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
        <div style={{ padding: '16px', backgroundColor: '#f8f9fa', border: '1px solid #e1e5e9', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600 }}>Privacy & Toestemming</h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
            Door deze meeting aan te maken, ga je akkoord met het opnemen en verwerken van audio voor:
          </p>
          <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px', fontSize: '14px', color: '#666' }}>
            <li>Automatische transcriptie van gesproken tekst</li>
            <li>AI-gegenereerde samenvatting van de meeting</li>
            <li>Versturen van meeting notities naar attendees via e-mail</li>
          </ul>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#666' }}>
            Audio wordt verwerkt via ElevenLabs speech-to-text diensten. Meer informatie in onze{' '}
            <a href="/privacy" style={{ color: '#0066cc', textDecoration: 'underline' }}>privacyverklaring</a>.
          </p>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={consentGiven} 
              onChange={e => setConsentGiven(e.target.checked)}
              style={{ marginTop: '2px' }}
              data-testid="checkbox-consent"
            />
            <span style={{ fontSize: '14px', fontWeight: 500 }}>
              Ik geef toestemming voor het opnemen en verwerken van audio-opnames voor bovenstaande doeleinden
            </span>
          </label>
        </div>
        <div>
          <button 
            type="button" 
            onClick={submit} 
            disabled={busy || !consentGiven}
            style={{ 
              opacity: (!consentGiven || busy) ? 0.6 : 1,
              cursor: (!consentGiven || busy) ? 'not-allowed' : 'pointer'
            }}
            data-testid="button-submit"
          >
            {busy ? 'Aanmaken…' : 'Start opname'}
          </button>
        </div>
      </div>
    </main>
  );
}