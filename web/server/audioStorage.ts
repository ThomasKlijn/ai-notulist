// Temporary file-based audio storage for deployment compatibility
// Replaces Replit-specific object storage
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);

interface AudioChunk {
  meetingId: string;
  chunkIndex: number;
  filePath: string;
  timestamp: Date;
}

class TemporaryFileAudioStorage {
  private chunks: Map<string, AudioChunk> = new Map();
  private tempDir: string;

  constructor() {
    // Use /tmp directory for temporary audio storage
    this.tempDir = path.join('/tmp', 'audio-chunks');
    this.ensureTempDirectory();
  }

  private async ensureTempDirectory(): Promise<void> {
    try {
      await mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's ok
    }
  }

  // Generate key for storing chunks
  private getChunkKey(meetingId: string, chunkIndex: number): string {
    return `${meetingId}-chunk-${chunkIndex}`;
  }

  // Generate file path for chunk
  private getChunkFilePath(meetingId: string, chunkIndex: number): string {
    return path.join(this.tempDir, `${meetingId}-chunk-${chunkIndex}.webm`);
  }

  // Upload an audio chunk to temporary file
  async uploadAudioChunk(meetingId: string, chunkIndex: number, audioBuffer: Buffer): Promise<string> {
    try {
      console.log(`Storing audio chunk ${chunkIndex} for meeting ${meetingId}, size: ${audioBuffer.length} bytes`);
      
      await this.ensureTempDirectory();
      
      const chunkKey = this.getChunkKey(meetingId, chunkIndex);
      const filePath = this.getChunkFilePath(meetingId, chunkIndex);
      
      // Write buffer to temporary file
      await writeFile(filePath, audioBuffer);
      
      const chunk: AudioChunk = {
        meetingId,
        chunkIndex,
        filePath,
        timestamp: new Date()
      };

      this.chunks.set(chunkKey, chunk);
      console.log(`Successfully stored chunk ${chunkIndex} to file: ${filePath}`);
      
      return chunkKey; // Return key as the "path"
    } catch (error: any) {
      console.error(`Error storing audio chunk ${chunkIndex}:`, error);
      throw new Error(`Failed to store audio chunk: ${error?.message || error}`);
    }
  }

  // Download an audio chunk from temporary file
  async downloadAudioChunk(chunkKey: string): Promise<Buffer> {
    const chunk = this.chunks.get(chunkKey);
    if (!chunk) {
      throw new Error(`Audio chunk not found: ${chunkKey}`);
    }
    
    try {
      // Check if file exists and read it
      if (fs.existsSync(chunk.filePath)) {
        return await readFile(chunk.filePath);
      } else {
        throw new Error(`Audio chunk file not found: ${chunk.filePath}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to read audio chunk: ${error?.message || error}`);
    }
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

    // Read and return buffers in order
    const buffers: Buffer[] = [];
    for (const chunk of meetingChunks) {
      try {
        if (fs.existsSync(chunk.filePath)) {
          const buffer = await readFile(chunk.filePath);
          buffers.push(buffer);
        }
      } catch (error) {
        console.error(`Error reading chunk file ${chunk.filePath}:`, error);
      }
    }
    
    return buffers;
  }

  // Combine audio chunks into a single buffer for transcription
  async combineAudioChunks(meetingId: string): Promise<Buffer> {
    const chunks = await this.getAllAudioChunksForMeeting(meetingId);
    return Buffer.concat(chunks);
  }

  // Get first audio chunk for transcription (since WebM chunks can't be concatenated)
  async getFirstAudioChunk(meetingId: string): Promise<Buffer | null> {
    const firstChunkKey = this.getChunkKey(meetingId, 0);
    try {
      const buffer = await this.downloadAudioChunk(firstChunkKey);
      return buffer;
    } catch (error) {
      console.log(`First audio chunk not found for meeting ${meetingId}`);
      return null;
    }
  }

  // Clean up chunks for a meeting (optional - for memory management)
  async cleanupMeetingChunks(meetingId: string): Promise<void> {
    const keysToDelete: string[] = [];
    const filesToDelete: string[] = [];
    
    for (const [key, chunk] of this.chunks.entries()) {
      if (chunk.meetingId === meetingId) {
        keysToDelete.push(key);
        filesToDelete.push(chunk.filePath);
      }
    }

    // Delete files
    for (const filePath of filesToDelete) {
      try {
        if (fs.existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    }

    // Remove from memory map
    keysToDelete.forEach(key => this.chunks.delete(key));
    console.log(`Cleaned up ${keysToDelete.length} chunks for meeting ${meetingId}`);
  }

  // Get storage stats
  getStorageStats(): { totalChunks: number; totalFileSizeMB: number } {
    let totalBytes = 0;
    let validChunks = 0;
    
    for (const chunk of this.chunks.values()) {
      try {
        if (fs.existsSync(chunk.filePath)) {
          const stats = fs.statSync(chunk.filePath);
          totalBytes += stats.size;
          validChunks++;
        }
      } catch (error) {
        // File might not exist anymore
      }
    }
    
    return {
      totalChunks: validChunks,
      totalFileSizeMB: Math.round(totalBytes / (1024 * 1024) * 100) / 100
    };
  }
}

// Export singleton instance
export const audioStorage = new TemporaryFileAudioStorage();

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