import { Metadata } from 'next';

// Prevent all caching for login page
export const metadata: Metadata = {
  title: 'Login - AI Notulist',
  description: 'Login to access your meeting notes',
  robots: 'noindex, nofollow',
};

// Force no caching for login page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Don't wrap in html/head - let root layout handle that
  return <>{children}</>;
}