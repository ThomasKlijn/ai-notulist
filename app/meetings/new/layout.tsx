import { Metadata } from 'next';

// Prevent all caching for new meeting page
export const metadata: Metadata = {
  title: 'Nieuwe Meeting - AI Notulist',
  description: 'Create a new meeting for recording and AI processing',
  robots: 'noindex, nofollow',
};

// Force no caching for new meeting page
export const dynamic = 'force-dynamic';

export default function NewMeetingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Don't define custom header, let the page handle its own layout
  return <>{children}</>;
}