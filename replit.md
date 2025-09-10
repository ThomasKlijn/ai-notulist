# Overview

AI Notulist is a web application for recording and managing meeting notes. The system allows users to create meetings, record audio in real-time, and manage attendee information. Built as an MVP using Next.js with TypeScript, the application focuses on audio recording capabilities with plans for speech-to-text processing and automated meeting summaries.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 15.5.2 with App Router architecture
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4 for utility-first styling with custom CSS variables
- **State Management**: React hooks (useState, useEffect) for local component state
- **Routing**: File-based routing using Next.js App Router

The application uses a simple multi-page structure:
- Home page with basic navigation
- Meeting creation form with attendee management
- Meeting recording interface with real-time audio capture

## Backend Architecture
- **API Routes**: Next.js API routes handling REST endpoints
- **Data Storage**: In-memory Map-based storage for meetings and attendee data
- **Audio Processing**: Browser MediaRecorder API for chunked audio recording (15-second intervals)
- **File Handling**: FormData processing for audio chunk uploads

Key API endpoints:
- `POST /api/meetings` - Create new meetings
- `POST /api/meetings/[id]/audio` - Upload audio chunks during recording
- `POST /api/meetings/[id]/finish` - Mark meetings as completed

## Data Models
```typescript
type Meeting = {
  id: string;
  title: string;
  language?: string;
  createdAt: string;
  status: 'recording' | 'finished';
  attendees: Attendee[];
  chunksReceived: number;
};

type Attendee = {
  name?: string;
  email: string;
  role?: string;
};
```

## Audio Recording Strategy
- **Format**: WebM audio format for broad browser compatibility
- **Chunking**: 15-second audio segments for real-time processing
- **Upload**: Immediate chunk upload to prevent data loss
- **Fallback**: Designed to accommodate Safari compatibility (future M4A support)

# External Dependencies

## Core Framework Dependencies
- **Next.js 15.5.2**: React framework with App Router and API routes
- **React 19.1.0**: Frontend library for component-based UI
- **TypeScript 5.x**: Static typing and enhanced development experience

## Development Tools
- **Tailwind CSS 4.x**: Utility-first CSS framework with PostCSS integration
- **ESLint**: Code linting with Next.js configuration
- **Turbopack**: Build tool for faster development and production builds

## Browser APIs
- **MediaRecorder API**: Native browser audio recording capabilities
- **getUserMedia API**: Microphone access for audio capture
- **FormData API**: File upload handling for audio chunks

## AI Processing Services
Current integrations:
- **Speech-to-Text**: ElevenLabs Scribe v1 for high-accuracy audio transcription (99 languages, speaker diarization)
- **AI Summaries**: OpenAI GPT-5 for meeting analysis and structured summaries
- **Email Delivery**: SendGrid for automated meeting summary distribution

## Future Integration Points
The architecture is prepared for:
- **Cloud Storage**: S3 or similar for persistent audio chunk storage
- **Database**: Migration from in-memory storage to persistent database (Drizzle ORM ready)
- **Queue System**: Background job processing for audio analysis and summary generation

## Deployment Configuration
- **Vercel**: Optimized for Vercel platform deployment
- **Environment**: Node.js runtime with support for FormData processing
- **Port Configuration**: Dynamic port binding for cloud deployment