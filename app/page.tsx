'use client';

import DownloadAppButton from '../components/DownloadAppButton';

export default function Home() {
  return (
    <main style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
          AI-Powered Meeting Notes
        </h2>
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
          Record meetings, get instant AI transcriptions, and automatically email summaries to all attendees. 
          Now available as a mobile app for easy access anywhere.
        </p>
        
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center', 
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '48px'
        }}>
          <DownloadAppButton />
          
          <a 
            href="/meetings/new" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '16px 24px',
              textDecoration: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              minHeight: '56px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }}
          >
            <span>🎙️</span>
            Start New Meeting
          </a>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '24px',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '24px', 
          borderRadius: '12px',
          textAlign: 'left'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
            🎤 Easy Recording
          </h3>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            One-click recording with real-time chunking and automatic cloud processing.
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '24px', 
          borderRadius: '12px',
          textAlign: 'left'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
            🤖 AI Summaries
          </h3>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            Powered by OpenAI for accurate transcriptions and intelligent meeting summaries.
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '24px', 
          borderRadius: '12px',
          textAlign: 'left'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
            📧 Auto Email
          </h3>
          <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
            Automatic email delivery of meeting notes to all participants via SendGrid.
          </p>
        </div>
      </div>
      
      <footer style={{ 
        marginTop: '64px', 
        padding: '24px', 
        borderTop: '1px solid #e5e7eb',
        fontSize: '14px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '8px' }}>
          Door AI Notulist te gebruiken, gaat u akkoord met het verwerken van audio-opnames voor 
          transcriptie en AI-samenvatting doeleinden.
        </p>
        <p>
          <a href="/privacy" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
            Lees onze privacyverklaring
          </a> voor meer informatie over gegevensbescherming en uw rechten.
        </p>
      </footer>
    </main>
  );
}