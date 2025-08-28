export type Attendee = { name?: string; email: string; role?: string };
export type Meeting = {
  id: string;
  title: string;
  language?: string;
  createdAt: string;
  status: 'recording' | 'finished';
  attendees: Attendee[];
  chunksReceived: number;
};

const meetings = new Map<string, Meeting>();

export const Store = {
  createMeeting(m: Meeting) { meetings.set(m.id, m); },
  getMeeting(id: string) { return meetings.get(id); },
  updateMeeting(id: string, patch: Partial<Meeting>) {
    const cur = meetings.get(id);
    if (!cur) return;
    meetings.set(id, { ...cur, ...patch });
  },
  incrementChunks(id: string) {
    const cur = meetings.get(id); if (!cur) return;
    meetings.set(id, { ...cur, chunksReceived: cur.chunksReceived + 1 });
  }
};