'use client';
import { useState } from 'react';

type Attendee = { name?: string; email: string };
export default function AttendeesInput({ onChange }: { onChange: (list: Attendee[]) => void }) {
  const [value, setValue] = useState('');
  const [list, setList] = useState<Attendee[]>([]);

  const add = () => {
    const parts = value.split(',').map(v => v.trim()).filter(Boolean);
    const newOnes = parts.map(p => {
      if (p.includes('<') && p.includes('>')) {
        const name = p.split('<')[0].trim();
        const email = p.split('<')[1].replace('>', '').trim();
        return { name, email } as Attendee;
      }
      return { email: p } as Attendee;
    });
    const merged = [...list, ...newOnes];
    setList(merged); setValue(''); onChange(merged);
  };

  const remove = (idx: number) => {
    const copy = [...list]; copy.splice(idx, 1); setList(copy); onChange(copy);
  };

  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600 }}>Aanwezigen & belanghebbenden (e-mails)</label>
      <p style={{ marginTop: 4, color: '#444' }}>Gebruik komma’s of het formaat: Naam &lt;email@adres&gt;</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={value} onChange={e => setValue(e.target.value)} placeholder="bijv. Sanne <sanne@bedrijf.nl>, daan@x.nl" style={{ flex: 1, padding: 8 }} />
        <button type="button" onClick={add}>Toevoegen</button>
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {list.map((a, i) => (
          <span key={i} style={{ border: '1px solid #ddd', padding: '4px 8px', borderRadius: 12 }}>
            {(a.name ? `${a.name} ` : '') + `<${a.email}>`}
            <button type="button" onClick={() => remove(i)} aria-label="verwijder" style={{ marginLeft: 6 }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}