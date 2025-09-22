import { NextRequest } from 'next/server';
import { storage } from '../server/storage';
import { requireAuth } from './authMiddleware';

export async function requireMeetingOwnership(req: NextRequest, meetingId: string) {
  // First ensure user is authenticated
  const user = await requireAuth(req);
  
  // Get meeting and check ownership
  const meeting = await storage.getMeeting(meetingId);
  
  if (!meeting) {
    const error = new Error('Meeting not found');
    error.name = 'NotFound';
    throw error;
  }
  
  if (meeting.userId !== user.id) {
    const error = new Error('Access denied - not meeting owner');
    error.name = 'Forbidden';
    throw error;
  }
  
  return { user, meeting };
}