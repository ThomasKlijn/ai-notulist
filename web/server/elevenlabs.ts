// ElevenLabs Scribe Speech-to-Text Integration
// More accurate than OpenAI Whisper (96.7% vs ~90-95%)

export interface ElevenLabsWord {
  text: string;
  start: number;
  end: number;
  speaker?: string;
}

export interface ElevenLabsSpeaker {
  speaker_id: string;
  start: number;
  end: number;
}

export interface ElevenLabsTranscription {
  language_code: string;
  language_probability: number;
  text: string;
  words?: ElevenLabsWord[];
  speakers?: ElevenLabsSpeaker[];
}

// Transcribe audio buffer using ElevenLabs Scribe (world's most accurate STT)
export async function transcribeAudioWithElevenLabs(
  audioBuffer: Buffer, 
  language: string = 'nl'
): Promise<string> {
  try {
    console.log(`🎙️ [ElevenLabs] Transcribing audio: ${audioBuffer.length} bytes, language: ${language}`);
    
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not found in environment variables');
    }

    // Convert language code for ElevenLabs (they use ISO codes)
    const languageCode = language === 'nl' ? 'nl' : 'en';
    
    // Create FormData for the API request
    const formData = new FormData();
    
    // Create a blob from the audio buffer
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
    
    formData.append('file', audioFile);
    formData.append('model_id', 'scribe_v1'); // Back to standard model
    formData.append('language_code', languageCode);
    formData.append('diarize', 'true'); // Enable speaker identification
    formData.append('tag_audio_events', 'true'); // Detect laughter, applause, etc. (correct parameter name)
    formData.append('timestamps_granularity', 'word'); // Word-level timestamps
    
    console.log(`🚀 [ElevenLabs] Sending request to Scribe API...`);
    console.log(`🔑 [ElevenLabs] API Key exists: ${!!process.env.ELEVENLABS_API_KEY}`);
    console.log(`🔑 [ElevenLabs] API Key starts with: ${process.env.ELEVENLABS_API_KEY?.substring(0, 8)}...`);
    console.log(`📊 [ElevenLabs] File size: ${audioBuffer.length} bytes`);
    console.log(`📊 [ElevenLabs] Language: ${languageCode}`);
    console.log(`📊 [ElevenLabs] Model: scribe_v1`);
    
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [ElevenLabs] API Error (${response.status}):`, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const result: ElevenLabsTranscription = await response.json();
    
    console.log(`✅ [ElevenLabs] Transcription complete:`);
    console.log(`   - Language: ${result.language_code} (${Math.round(result.language_probability * 100)}% confidence)`);
    console.log(`   - Characters: ${result.text.length}`);
    console.log(`   - Speakers detected: ${result.speakers?.length || 0}`);
    console.log(`   - Words with timestamps: ${result.words?.length || 0}`);
    
    // Enhanced logging with speaker information
    if (result.speakers && result.speakers.length > 0) {
      console.log(`👥 [ElevenLabs] Speakers identified:`);
      result.speakers.forEach((speaker, index) => {
        const duration = Math.round(speaker.end - speaker.start);
        console.log(`   - ${speaker.speaker_id}: ${duration}s (${speaker.start}s - ${speaker.end}s)`);
      });
    }

    const cleanText = result.text.trim();
    console.log(`📝 [ElevenLabs] Sample: "${cleanText.substring(0, 100)}..."`);
    
    return cleanText;
  } catch (error: any) {
    console.error('❌ [ElevenLabs] Error transcribing audio:', error);
    
    // Enhanced error context
    if (error.message?.includes('API key')) {
      throw new Error('ElevenLabs API key is missing or invalid');
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      throw new Error('ElevenLabs API quota exceeded - check your billing');
    } else if (error.message?.includes('file') || error.message?.includes('format')) {
      throw new Error('Audio file format not supported by ElevenLabs Scribe');
    }
    
    throw new Error('Failed to transcribe audio with ElevenLabs: ' + (error?.message || error));
  }
}

// Enhanced transcription with speaker analysis (for future meeting insights)
export async function transcribeWithSpeakerAnalysis(
  audioBuffer: Buffer, 
  language: string = 'nl'
): Promise<{
  text: string;
  speakers: Array<{
    id: string;
    duration: number;
    percentage: number;
  }>;
  totalDuration: number;
}> {
  try {
    console.log(`🎙️ [ElevenLabs] Starting enhanced transcription with speaker analysis...`);
    
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not found');
    }

    const languageCode = language === 'nl' ? 'nl' : 'en';
    
    const formData = new FormData();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
    
    formData.append('file', audioFile);
    formData.append('model_id', 'scribe_v1'); // Back to standard model
    formData.append('language_code', languageCode);
    formData.append('diarize', 'true');
    formData.append('tag_audio_events', 'true');
    formData.append('timestamps_granularity', 'word');
    
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const result: ElevenLabsTranscription = await response.json();
    
    // Calculate speaker statistics
    const speakers = result.speakers?.map(speaker => {
      const duration = speaker.end - speaker.start;
      return {
        id: speaker.speaker_id,
        duration: Math.round(duration * 10) / 10, // Round to 1 decimal
        start: speaker.start,
        end: speaker.end
      };
    }) || [];
    
    const totalDuration = speakers.length > 0 
      ? Math.max(...speakers.map(s => s.end)) 
      : 0;
    
    const speakersWithPercentage = speakers.map(speaker => ({
      id: speaker.id,
      duration: speaker.duration,
      percentage: totalDuration > 0 ? Math.round((speaker.duration / totalDuration) * 100) : 0
    }));
    
    console.log(`✅ [ElevenLabs] Enhanced transcription complete with ${speakers.length} speakers`);
    
    return {
      text: result.text.trim(),
      speakers: speakersWithPercentage,
      totalDuration: Math.round(totalDuration * 10) / 10
    };
    
  } catch (error: any) {
    console.error('❌ [ElevenLabs] Enhanced transcription failed:', error);
    
    // Fallback to basic transcription
    const basicText = await transcribeAudioWithElevenLabs(audioBuffer, language);
    return {
      text: basicText,
      speakers: [],
      totalDuration: 0
    };
  }
}