'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ConsentData {
  attendee: {
    name?: string;
    email: string;
    consentGiven: boolean;
  };
  meeting: {
    title: string;
    createdAt: string;
    language: string;
  };
  token: string;
}

export default function ConsentPage() {
  const params = useParams();
  const token = params?.token as string;
  const [data, setData] = useState<ConsentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    
    fetch(`/api/consent/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
      })
      .catch(err => setError('Failed to load consent information'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleConsentAction = async (action: 'give' | 'withdraw') => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/consent/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const result = await res.json();
      
      if (result.ok) {
        setData(prev => prev ? {
          ...prev,
          attendee: { ...prev.attendee, consentGiven: action === 'give' }
        } : null);
      } else {
        setError(result.error || 'Failed to update consent');
      }
    } catch (err) {
      setError('Failed to update consent');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px', textAlign: 'center' }}>
        <div>Loading consent information...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px' }}>
        <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>Error</h1>
        <p>{error}</p>
        <p style={{ marginTop: '16px', color: '#666' }}>
          This consent link may be invalid or expired. Please contact the meeting organizer.
        </p>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 16px', lineHeight: '1.6' }}>
      <h1 style={{ marginBottom: '24px', fontSize: '28px', fontWeight: 'bold' }}>
        Meeting Recording Consent
      </h1>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '24px', 
        borderRadius: '8px', 
        marginBottom: '32px' 
      }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Meeting Details</h2>
        <p><strong>Title:</strong> {data.meeting.title}</p>
        <p><strong>Organizer invited:</strong> {data.attendee.name || 'You'} ({data.attendee.email})</p>
        <p><strong>Created:</strong> {new Date(data.meeting.createdAt).toLocaleDateString()}</p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>Privacy Notice</h2>
        <p style={{ marginBottom: '16px' }}>
          You are being asked to consent to audio recording and processing for this meeting. 
          Your audio will be used for:
        </p>
        <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
          <li>Automatic transcription of spoken text via ElevenLabs speech-to-text services</li>
          <li>AI-generated meeting summary creation via OpenAI</li>
          <li>Email delivery of meeting notes to all participants via SendGrid</li>
        </ul>
        <p style={{ marginBottom: '16px' }}>
          <strong>Your rights:</strong> You can withdraw your consent at any time, which will 
          immediately stop further processing and delete your audio data. Audio recordings are 
          automatically deleted after transcription processing.
        </p>
        <p style={{ marginBottom: '16px' }}>
          <a href="/privacy" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
            Read our complete privacy policy
          </a> for more information about data processing and your rights.
        </p>
      </div>

      <div style={{ 
        padding: '24px', 
        border: '2px solid #e5e7eb', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>
          Current Status: {data.attendee.consentGiven ? '✅ Consent Given' : '❌ Consent Not Given'}
        </h3>
        
        {!data.attendee.consentGiven ? (
          <div>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Recording cannot start until you provide consent.
            </p>
            <button
              onClick={() => handleConsentAction('give')}
              disabled={updating}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: updating ? 'not-allowed' : 'pointer',
                opacity: updating ? 0.6 : 1
              }}
              data-testid="button-give-consent"
            >
              {updating ? 'Processing...' : 'Give Consent to Record'}
            </button>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '16px', color: '#10b981', fontWeight: '500' }}>
              Thank you for providing consent. Recording can proceed.
            </p>
            <button
              onClick={() => handleConsentAction('withdraw')}
              disabled={updating}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: updating ? 'not-allowed' : 'pointer',
                opacity: updating ? 0.6 : 1
              }}
              data-testid="button-withdraw-consent"
            >
              {updating ? 'Processing...' : 'Withdraw Consent'}
            </button>
          </div>
        )}
      </div>
      
      {data.attendee.consentGiven && (
        <div style={{ 
          marginTop: '24px', 
          padding: '16px', 
          backgroundColor: '#fef3c7', 
          borderRadius: '6px' 
        }}>
          <p style={{ fontSize: '14px', color: '#92400e' }}>
            <strong>Note:</strong> Withdrawing consent will stop all further audio processing 
            and delete your recorded data. This action cannot be undone.
          </p>
        </div>
      )}
    </main>
  );
}