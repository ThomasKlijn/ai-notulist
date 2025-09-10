import { NextResponse } from 'next/server';
import { AudioStorageService } from '../../../server/audioStorage';

export async function GET() {
  try {
    console.log('🔍 Testing getAllAudioChunksForMeeting...');
    
    const audioService = new AudioStorageService();
    const meetingId = '1fa4c8e3-fb7f-4e6b-987d-70cb1fdbd12f'; // Meeting with 11 chunks
    
    console.log(`📊 Getting all chunks for meeting: ${meetingId}`);
    const allChunks = await audioService.getAllAudioChunksForMeeting(meetingId);
    
    console.log(`📊 Retrieved ${allChunks.length} chunks`);
    
    const chunkSizes = allChunks.map((chunk, index) => ({
      index,
      size: chunk.length,
      sizeKB: Math.round(chunk.length / 1024)
    }));
    
    // Test first few chunks for content
    const firstChunkSample = allChunks[0] ? allChunks[0].length : 0;
    const lastChunkSample = allChunks[allChunks.length - 1] ? allChunks[allChunks.length - 1].length : 0;
    
    return NextResponse.json({ 
      meetingId,
      totalChunks: allChunks.length,
      chunkSizes,
      firstChunkSize: firstChunkSample,
      lastChunkSize: lastChunkSample,
      diagnosis: allChunks.length === 11 ? '✅ All chunks loaded correctly' : '❌ Missing chunks detected'
    });
    
  } catch (error: any) {
    console.error('❌ Debug failed:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error.message
    }, { status: 500 });
  }
}