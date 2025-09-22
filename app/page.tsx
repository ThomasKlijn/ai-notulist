import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getSession } from '../lib/simple-auth';

export default async function Home() {
  // Check authentication server-side
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session-token')?.value;
  
  if (!sessionToken) {
    redirect('/login');
  }
  
  const session = await getSession(sessionToken);
  if (!session) {
    redirect('/login');
  }
  
  // If authenticated, redirect to the actual app
  redirect('/dashboard');
}