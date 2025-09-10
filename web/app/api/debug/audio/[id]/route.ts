import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../../server/storage';
import { AudioStorageService } from '../../../../../../server/audioStorage';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log(`🔍 Debugging audio chunks for meeting: ${id}`);
    
    // Get chunks from database
    const dbChunks = await storage.getAudioChunks(id);
    console.log(`📊 Database chunks: ${dbChunks.length}`);
    
    // Test AudioStorageService
    const audioService = new AudioStorageService();
    const results = [];
    
    for (let i = 0; i < Math.min(dbChunks.length, 5); i++) {
      const chunk = dbChunks[i];
      try {
        console.log(`🔍 Testing chunk ${i}: ${chunk.objectPath}`);
        const buffer = await audioService.downloadAudioChunk(chunk.objectPath!);
        results.push({
          chunkIndex: chunk.chunkIndex,
          objectPath: chunk.objectPath,
          sizeInDb: chunk.sizeBytes,
          sizeFromFile: buffer.length,
          status: 'success'
        });
      } catch (error) {
        results.push({
          chunkIndex: chunk.chunkIndex,
          objectPath: chunk.objectPath,
          sizeInDb: chunk.sizeBytes,
          error: error.message,
          status: 'failed'
        });
      }
    }
    
    return NextResponse.json({
      meetingId: id,
      totalChunksInDb: dbChunks.length,
      testedChunks: results.length,
      results
    });
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error.message 
    }, { status: 500 });
  }
}