import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface MeetingSummary {
  title: string;
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

// Transcribe audio buffer using OpenAI Whisper
export async function transcribeAudio(audioBuffer: Buffer, language: string = 'nl'): Promise<string> {
  try {
    // TEMPORARY: Mock transcription for testing email flow
    console.log('🧪 USING MOCK TRANSCRIPTION FOR EMAIL TESTING');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
    return language === 'nl' 
      ? "Dit is een test transcriptie van de meeting. We hebben verschillende onderwerpen besproken en belangrijke beslissingen genomen."
      : "This is a test transcription of the meeting. We discussed various topics and made important decisions.";

    // Real transcription code (commented for testing):
    /*
    // Create a File-like object from the buffer
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: language === 'nl' ? 'nl' : 'en', // Support Dutch and English
    });

    return transcription.text;
    */
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio: ' + (error?.message || error));
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