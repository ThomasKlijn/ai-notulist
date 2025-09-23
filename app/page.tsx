import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Home() {
  // Simple check: redirect to login if no session token
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session-token')?.value;
  
  if (!sessionToken) {
    redirect('/login');
  }
  
  // If session token exists, go to dashboard
  redirect('/dashboard');
}

// Force no caching for this page
export const dynamic = 'force-dynamic';