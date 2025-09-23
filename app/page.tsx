'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for session token in cookies on client side
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          // User is authenticated, go to dashboard
          router.push('/dashboard');
        } else {
          // User is not authenticated, go to login
          router.push('/login');
        }
      } catch (error) {
        // On error, default to login
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  // Show loading while checking authentication
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          color: '#1f2937',
          marginBottom: '16px' 
        }}>
          AI Notulist
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '16px' 
        }}>
          Loading...
        </p>
      </div>
    </div>
  );
}