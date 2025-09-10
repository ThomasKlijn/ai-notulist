'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

interface MeetingStatus {
  meeting: {
    id: string;
    title: string;
    status: 'recording' | 'processing' | 'completed' | 'failed';
    createdAt: string;
    finishedAt?: string;
    language?: string;
    attendees: Array<{ name?: string; email: string; role?: string }>;
    chunksCount: number;
    transcription?: string;
    summary?: any;
  };
}

export default function MeetingRecordPage() {
  const { id } = useParams<{ id: string }>();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [chunksSent, setChunksSent] = useState(0);
  const [meetingStatus, setMeetingStatus] = useState<MeetingStatus | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const chunkIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const statusCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer when recording starts
  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  useEffect(() => {
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current); 
      if (statusCheckRef.current) clearInterval(statusCheckRef.current);
      recorder?.stop(); 
      stream?.getTracks().forEach(t => t.stop()); 
    };
  }, [recorder, stream]);

  // Check meeting status periodically after recording stops
  const checkMeetingStatus = async () => {
    try {
      const res = await fetch(`/api/meetings/${id}/status`);
      if (res.ok) {
        const data: MeetingStatus = await res.json();
        setMeetingStatus(data);
        
        // Stop checking if completed or failed
        if (data.meeting.status === 'completed' || data.meeting.status === 'failed') {
          if (statusCheckRef.current) {
            clearInterval(statusCheckRef.current);
            statusCheckRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error('Error checking meeting status:', error);
    }
  };

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
      setRecorder(rec); 
      setSeconds(0);
      setRecording(true); // Timer starts via useEffect
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
    
    try { 
      await fetch(`/api/meetings/${id}/finish`, { method: 'POST' }); 
      
      // Start checking status every 5 seconds
      statusCheckRef.current = setInterval(checkMeetingStatus, 5000);
      checkMeetingStatus(); // Check immediately
    } catch (error) {
      console.error('Error finishing meeting:', error);
    }
  };

  const fmt = (s: number) => new Date(s * 1000).toISOString().substring(11, 19);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording': return '#007bff';
      case 'processing': return '#ffc107';
      case 'completed': return '#28a745';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'recording': return 'Opname bezig';
      case 'processing': return 'Verwerken van audio...';
      case 'completed': return 'Klaar! Samenvatting verzonden';
      case 'failed': return 'Fout bij verwerken';
      default: return status;
    }
  };

  const renderSummary = () => {
    if (!meetingStatus?.meeting.summary) return null;
    
    const summary = meetingStatus.meeting.summary;
    return (
      <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h3>Meeting Samenvatting</h3>
        
        {summary.keyPoints && (
          <div style={{ marginBottom: '15px' }}>
            <h4>Belangrijke Punten:</h4>
            <ul>
              {summary.keyPoints.map((point: string, index: number) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.decisions && summary.decisions.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <h4>Beslissingen:</h4>
            <ul>
              {summary.decisions.map((decision: string, index: number) => (
                <li key={index}>{decision}</li>
              ))}
            </ul>
          </div>
        )}

        {summary.actionItems && summary.actionItems.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <h4>Actiepunten:</h4>
            {summary.actionItems.map((item: any, index: number) => (
              <div key={index} style={{ background: '#fff', padding: '10px', margin: '5px 0', borderLeft: '4px solid #007bff' }}>
                <strong>Taak:</strong> {item.task}<br/>
                {item.assignee && <><strong>Toegewezen aan:</strong> {item.assignee}<br/></>}
                {item.dueDate && <><strong>Deadline:</strong> {item.dueDate}</>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <main style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Meeting {id}</h2>
      
      {meetingStatus && (
        <div style={{ 
          background: '#e9ecef', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          borderLeft: `4px solid ${getStatusColor(meetingStatus.meeting.status)}`
        }}>
          <strong>Status:</strong> <span style={{ color: getStatusColor(meetingStatus.meeting.status) }}>
            {getStatusText(meetingStatus.meeting.status)}
          </span><br/>
          <strong>Titel:</strong> {meetingStatus.meeting.title}<br/>
          <strong>Audio chunks:</strong> {meetingStatus.meeting.chunksCount}<br/>
          {meetingStatus.meeting.attendees.length > 0 && (
            <><strong>Deelnemers:</strong> {meetingStatus.meeting.attendees.map(a => a.email).join(', ')}</>
          )}
        </div>
      )}

      {recording && (
        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
          <p><strong>🔴 Opname actief</strong></p>
          <p>Tijd: <strong>{fmt(seconds)}</strong> · Verzonden chunks: <strong>{chunksSent}</strong></p>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: '20px' }}>
        {!recording ? (
          <button 
            onClick={start}
            style={{ 
              padding: '12px 24px', 
              background: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Start opname
          </button>
        ) : (
          <button 
            onClick={stop}
            style={{ 
              padding: '12px 24px', 
              background: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Stop & afronden
          </button>
        )}

        {meetingStatus?.meeting.summary && (
          <button 
            onClick={() => setShowSummary(!showSummary)}
            style={{ 
              padding: '12px 24px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            {showSummary ? 'Verberg samenvatting' : 'Toon samenvatting'}
          </button>
        )}
      </div>

      <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
        💡 Laat de laptop/telefoon op tafel liggen. Sluit dit tabblad niet tijdens de opname.
      </p>

      {showSummary && renderSummary()}

      {meetingStatus?.meeting.transcription && (
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h3>Volledige Transcriptie</h3>
          <div style={{ 
            background: 'white', 
            padding: '15px', 
            borderRadius: '4px', 
            fontFamily: 'monospace', 
            fontSize: '14px',
            lineHeight: '1.4',
            maxHeight: '300px',
            overflowY: 'auto',
            border: '1px solid #dee2e6'
          }}>
            {meetingStatus.meeting.transcription}
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            📊 Transcriptie lengte: {meetingStatus.meeting.transcription.length} karakters
          </p>
        </div>
      )}

      {meetingStatus?.meeting.status === 'processing' && (
        <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
          <p>⏳ De meeting wordt verwerkt. Dit kan enkele minuten duren afhankelijk van de lengte van de opname.</p>
          <p>De samenvatting wordt automatisch naar alle deelnemers gemaild zodra klaar.</p>
        </div>
      )}

      {meetingStatus?.meeting.status === 'completed' && (
        <div style={{ background: '#d4edda', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
          <p>✅ Meeting succesvol verwerkt! De samenvatting is verzonden naar alle deelnemers.</p>
        </div>
      )}

      {meetingStatus?.meeting.status === 'failed' && (
        <div style={{ background: '#f8d7da', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
          <p>❌ Er is een fout opgetreden bij het verwerken van de meeting. Probeer het opnieuw of neem contact op met ondersteuning.</p>
        </div>
      )}
    </main>
  );
}