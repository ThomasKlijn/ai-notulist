// In-memory audio storage for deployment compatibility
// Replaces Replit-specific object storage

interface AudioChunk {
  meetingId: string;
  chunkIndex: number;
  buffer: Buffer;
  timestamp: Date;
}

class InMemoryAudioStorage {
  private chunks: Map<string, AudioChunk> = new Map();

  // Generate key for storing chunks
  private getChunkKey(meetingId: string, chunkIndex: number): string {
    return `${meetingId}-chunk-${chunkIndex}`;
  }

  // Upload an audio chunk to memory
  async uploadAudioChunk(meetingId: string, chunkIndex: number, audioBuffer: Buffer): Promise<string> {
    try {
      console.log(`Storing audio chunk ${chunkIndex} for meeting ${meetingId}, size: ${audioBuffer.length} bytes`);
      
      const chunkKey = this.getChunkKey(meetingId, chunkIndex);
      const chunk: AudioChunk = {
        meetingId,
        chunkIndex,
        buffer: audioBuffer,
        timestamp: new Date()
      };

      this.chunks.set(chunkKey, chunk);
      console.log(`Successfully stored chunk ${chunkIndex} in memory`);
      
      return chunkKey; // Return key as the "path"
    } catch (error: any) {
      console.error(`Error storing audio chunk ${chunkIndex}:`, error);
      throw new Error(`Failed to store audio chunk: ${error?.message || error}`);
    }
  }

  // Download an audio chunk from memory
  async downloadAudioChunk(chunkKey: string): Promise<Buffer> {
    const chunk = this.chunks.get(chunkKey);
    if (!chunk) {
      throw new Error(`Audio chunk not found: ${chunkKey}`);
    }
    return chunk.buffer;
  }

  // Get all audio chunks for a meeting
  async getAllAudioChunksForMeeting(meetingId: string): Promise<Buffer[]> {
    const meetingChunks: AudioChunk[] = [];
    
    // Find all chunks for this meeting
    for (const [key, chunk] of this.chunks.entries()) {
      if (chunk.meetingId === meetingId) {
        meetingChunks.push(chunk);
      }
    }

    // Sort by chunk index
    meetingChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

    // Return buffers in order
    return meetingChunks.map(chunk => chunk.buffer);
  }

  // Combine audio chunks into a single buffer for transcription
  async combineAudioChunks(meetingId: string): Promise<Buffer> {
    const chunks = await this.getAllAudioChunksForMeeting(meetingId);
    return Buffer.concat(chunks);
  }

  // Get first audio chunk for transcription (since WebM chunks can't be concatenated)
  async getFirstAudioChunk(meetingId: string): Promise<Buffer | null> {
    const firstChunkKey = this.getChunkKey(meetingId, 0);
    const chunk = this.chunks.get(firstChunkKey);
    return chunk ? chunk.buffer : null;
  }

  // Clean up chunks for a meeting (optional - for memory management)
  async cleanupMeetingChunks(meetingId: string): Promise<void> {
    const keysToDelete: string[] = [];
    
    for (const [key, chunk] of this.chunks.entries()) {
      if (chunk.meetingId === meetingId) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.chunks.delete(key));
    console.log(`Cleaned up ${keysToDelete.length} chunks for meeting ${meetingId}`);
  }

  // Get storage stats
  getStorageStats(): { totalChunks: number; totalMemoryMB: number } {
    let totalBytes = 0;
    for (const chunk of this.chunks.values()) {
      totalBytes += chunk.buffer.length;
    }
    
    return {
      totalChunks: this.chunks.size,
      totalMemoryMB: Math.round(totalBytes / (1024 * 1024) * 100) / 100
    };
  }
}

// Export singleton instance
export const audioStorage = new InMemoryAudioStorage();

// Export class for compatibility with existing ObjectStorageService interface
export class AudioStorageService {
  async uploadAudioChunk(meetingId: string, chunkIndex: number, audioBuffer: Buffer): Promise<string> {
    return audioStorage.uploadAudioChunk(meetingId, chunkIndex, audioBuffer);
  }

  async downloadAudioChunk(chunkKey: string): Promise<Buffer> {
    return audioStorage.downloadAudioChunk(chunkKey);
  }

  async getAllAudioChunksForMeeting(meetingId: string): Promise<Buffer[]> {
    return audioStorage.getAllAudioChunksForMeeting(meetingId);
  }

  async combineAudioChunks(meetingId: string): Promise<Buffer> {
    return audioStorage.combineAudioChunks(meetingId);
  }

  async getFirstAudioChunk(meetingId: string): Promise<Buffer | null> {
    return audioStorage.getFirstAudioChunk(meetingId);
  }
}