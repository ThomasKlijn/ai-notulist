import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface MeetingSummary {
  title: string;
  generalSummary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: Array<{
    task: string;
    assignee?: string;
    dueDate?: string;
  }>;
  participants: string[];
  duration: string;
  nextSteps?: string[];
}

// Transcribe audio buffer using ElevenLabs Scribe
export async function transcribeAudio(audioBuffer: Buffer, language: string = 'nl'): Promise<string> {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }

    // Create FormData for ElevenLabs API
    const formData = new FormData();
    
    // Create a Blob from the buffer and append to FormData
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/webm' });
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model_id', 'scribe_v1');
    formData.append('diarize', 'true'); // Enable speaker identification
    formData.append('tag_audio_events', 'true'); // Tag non-speech sounds
    
    // Set language code if specified (ElevenLabs uses ISO codes)
    if (language) {
      const languageCode = language === 'nl' ? 'nl' : 'en';
      formData.append('language_code', languageCode);
    }

    console.log('Sending audio to ElevenLabs Scribe for transcription...');
    
    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', response.status, errorText);
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('ElevenLabs transcription completed successfully');
    
    // ElevenLabs returns text in the 'text' field
    return result.text || '';
  } catch (error: any) {
    console.error('Error transcribing audio with ElevenLabs:', error);
    throw new Error('Failed to transcribe audio with ElevenLabs: ' + (error?.message || error));
  }
}

// Generate meeting summary using GPT-5
export async function generateMeetingSummary(
  transcription: string, 
  meetingTitle: string,
  language: string = 'nl'
): Promise<MeetingSummary> {
  try {
    const isEnglish = language === 'en';
    
    const prompt = isEnglish 
      ? `Please analyze this meeting transcription and provide a structured summary in JSON format with the following structure:

{
  "title": "Meeting title/subject",
  "generalSummary": "A comprehensive 2-3 sentence overview of what was discussed in the meeting",
  "keyPoints": ["List of key discussion points"],
  "decisions": ["Decisions made during the meeting"],
  "actionItems": [{"task": "Description", "assignee": "Person name if mentioned", "dueDate": "Date if mentioned"}],
  "participants": ["Names of people mentioned in the meeting"],
  "duration": "Estimated meeting duration",
  "nextSteps": ["Next steps or follow-up actions"]
}

Meeting Title: ${meetingTitle}
Transcription: ${transcription}`
      : `Analyseer deze meeting transcriptie en geef een gestructureerde samenvatting in JSON formaat met de volgende structuur:

{
  "title": "Meeting titel/onderwerp",
  "generalSummary": "Een uitgebreide samenvatting van 2-3 zinnen over wat er besproken is in de meeting",
  "keyPoints": ["Lijst van belangrijke discussiepunten"],
  "decisions": ["Beslissingen genomen tijdens de meeting"],
  "actionItems": [{"task": "Beschrijving", "assignee": "Persoon naam indien genoemd", "dueDate": "Datum indien genoemd"}],
  "participants": ["Namen van personen genoemd in de meeting"],
  "duration": "Geschatte meeting duur",
  "nextSteps": ["Volgende stappen of vervolgacties"]
}

Meeting Titel: ${meetingTitle}
Transcriptie: ${transcription}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: isEnglish 
            ? "You are an expert meeting assistant. Analyze meeting transcriptions and provide structured, accurate summaries. Always respond with valid JSON."
            : "Je bent een expert meeting assistent. Analyseer meeting transcripties en geef gestructureerde, nauwkeurige samenvattingen. Antwoord altijd met geldige JSON."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as MeetingSummary;
  } catch (error: any) {
    console.error('Error generating meeting summary:', error);
    throw new Error('Failed to generate meeting summary: ' + (error?.message || error));
  }
}