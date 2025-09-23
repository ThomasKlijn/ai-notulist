import OpenAI from "openai";

// Using GPT-4o which is the most capable model currently available
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

// Import ElevenLabs Scribe for superior transcription accuracy
import { transcribeAudioWithElevenLabs } from './elevenlabs';

// Main transcription function - try ElevenLabs first, fallback to Whisper
export async function transcribeAudio(audioBuffer: Buffer, language: string = 'nl'): Promise<string> {
  try {
    console.log('🎯 Attempting ElevenLabs Scribe transcription first...');
    return await transcribeAudioWithElevenLabs(audioBuffer, language);
  } catch (elevenlabsError: any) {
    console.warn('⚠️ ElevenLabs failed, falling back to OpenAI Whisper:', elevenlabsError.message);
    console.log('🔄 Using OpenAI Whisper as fallback...');
    return await transcribeAudioWithWhisper(audioBuffer, language);
  }
}

// Legacy OpenAI Whisper function (kept as fallback)
export async function transcribeAudioWithWhisper(audioBuffer: Buffer, language: string = 'nl'): Promise<string> {
  try {
    console.log(`🎙️ [Whisper Fallback] Transcribing audio: ${audioBuffer.length} bytes, language: ${language}`);
    
    // Create a File-like object from the buffer
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/webm' });
    const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

    const isEnglish = language === 'en';
    const promptText = isEnglish 
      ? "This is a business meeting recording. Please transcribe clearly with proper punctuation and capitalization."
      : "Dit is een zakelijke meeting opname. Transcribeer duidelijk met juiste interpunctie en hoofdletters.";

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: language === 'nl' ? 'nl' : 'en',
      response_format: "verbose_json", // Get detailed response with segments
      temperature: 0, // More deterministic results
      prompt: promptText, // Context for better recognition
    });

    // Extract text from verbose response
    let fullText = '';
    if (transcription.segments && Array.isArray(transcription.segments)) {
      // Use segments for better text quality
      fullText = transcription.segments
        .map((segment: any) => segment.text?.trim())
        .filter(Boolean)
        .join(' ');
    } else {
      // Fallback to main text
      fullText = transcription.text || '';
    }

    const cleanText = fullText.trim();
    console.log(`✅ [Whisper] Transcribed ${cleanText.length} characters: "${cleanText.substring(0, 100)}..."`);
    
    return cleanText;
  } catch (error: any) {
    console.error('❌ [Whisper] Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio with Whisper: ' + (error?.message || error));
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
      ? `Please analyze this meeting transcript and provide a structured summary in JSON format with the following structure:
{
  "title": "Meeting title/subject",
  "generalSummary": "A neutral, objective summary of 5–7 sentences about what was discussed in the meeting",
  "keyPoints": ["List of key discussion points"],
  "decisions": ["Decisions made during the meeting"],
  "actionItems": [
    {
      "task": "Description of the action item",
      "assignee": "Person's name if mentioned, otherwise 'TBD'",
      "dueDate": "Date if mentioned, otherwise 'Not specified'"
    }
  ],
  "participants": ["Names of people mentioned in the meeting"],
  "duration": "Estimated meeting duration (or 'Not specified' if unknown)",
  "nextSteps": ["Next steps or follow-up actions"]
}

Rules:
- If a field would otherwise be empty, fill it with 'TBD' or 'Not specified'.
- Always respond in the same language as the transcript unless instructed otherwise.
- Do NOT include any explanation outside of the JSON. Return JSON only.

Meeting Title: ${meetingTitle}
Transcript: ${transcription}`
      : `Analyseer deze meeting transcriptie en geef een gestructureerde samenvatting in JSON formaat met de volgende structuur:
{
  "title": "Meeting titel/onderwerp",
  "generalSummary": "Een neutrale, objectieve samenvatting van 5–7 zinnen over wat er besproken is",
  "keyPoints": ["Lijst van belangrijke discussiepunten"],
  "decisions": ["Beslissingen genomen tijdens de meeting"],
  "actionItems": [
    {
      "task": "Beschrijving van actiepunt",
      "assignee": "Naam van persoon indien genoemd, anders 'N.t.b.'",
      "dueDate": "Datum indien genoemd, anders 'Niet gespecificeerd'"
    }
  ],
  "participants": ["Namen van personen genoemd in de meeting"],
  "duration": "Geschatte meetingduur (of 'Niet gespecificeerd' als onbekend)",
  "nextSteps": ["Volgende stappen of vervolgacties"]
}

Regels:
- Als een veld leeg zou blijven, vul het in met 'N.t.b.' of 'Niet gespecificeerd'.
- Gebruik altijd dezelfde taal als de transcriptie.
- Geef GEEN uitleg buiten de JSON, alleen de JSON zelf.

Meeting Titel: ${meetingTitle}
Transcriptie: ${transcription}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: isEnglish 
            ? "You are an expert meeting assistant. Analyze meeting transcripts and provide structured, accurate summaries.\nImportant: Always respond ONLY with valid JSON that exactly follows the requested structure."
            : "Je bent een expert meeting assistent. Analyseer meeting transcripties en geef gestructureerde, nauwkeurige samenvattingen.\nBelangrijk: Antwoord ALTIJD uitsluitend met geldige JSON die exact voldoet aan de gevraagde structuur."
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