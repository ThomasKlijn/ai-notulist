import { NextResponse } from 'next/server';
import { AudioStorageService } from '../../../server/audioStorage';
import { transcribeAudio } from '../../../server/openai';

export async function GET() {
  try {
    console.log('🔍 Debug: Simulating processing service behavior...');
    
    const audioService = new AudioStorageService();
    const meetingId = '1fa4c8e3-fb7f-4e6b-987d-70cb1fdbd12f'; // Meeting with 11 chunks
    
    // Test what processing service does
    console.log('📊 Step 1: Getting all chunks...');
    const audioChunks = await audioService.getAllAudioChunksForMeeting(meetingId);
    console.log(`Found ${audioChunks.length} chunks`);
    
    // Test processing each chunk
    const results = [];
    for (let i = 0; i < Math.min(3, audioChunks.length); i++) { // Test first 3 chunks
      console.log(`📊 Step 2.${i+1}: Processing chunk ${i+1}...`);
      const audioBuffer = audioChunks[i];
      console.log(`Chunk ${i+1} size: ${audioBuffer.length} bytes`);
      
      try {
        const transcription = await transcribeAudio(audioBuffer, 'nl');
        results.push({
          chunkIndex: i,
          transcription: transcription.substring(0, 100),
          length: transcription.length,
          success: true
        });
        console.log(`✅ Chunk ${i+1} transcribed: ${transcription.substring(0, 50)}...`);
      } catch (error) {
        results.push({
          chunkIndex: i,
          error: error.message,
          success: false
        });
        console.error(`❌ Chunk ${i+1} failed:`, error.message);
      }
    }
    
    return NextResponse.json({ 
      totalChunks: audioChunks.length,
      testedChunks: results.length,
      results,
      diagnosis: results.every(r => r.success) ? 'All chunks process correctly' : 'Some chunks failed'
    });
    
  } catch (error: any) {
    console.error('❌ Debug failed:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error.message
    }, { status: 500 });
  }
}