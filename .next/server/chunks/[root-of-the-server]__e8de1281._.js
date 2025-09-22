module.exports = [
"[externals]/punycode [external] (punycode, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("punycode", () => require("punycode"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/node:stream/web [external] (node:stream/web, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:stream/web", () => require("node:stream/web"));

module.exports = mod;
}),
"[project]/server/elevenlabs.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// ElevenLabs Scribe Speech-to-Text Integration
// More accurate than OpenAI Whisper (96.7% vs ~90-95%)
__turbopack_context__.s([
    "transcribeAudioWithElevenLabs",
    ()=>transcribeAudioWithElevenLabs,
    "transcribeWithSpeakerAnalysis",
    ()=>transcribeWithSpeakerAnalysis
]);
async function transcribeAudioWithElevenLabs(audioBuffer, language = 'nl') {
    try {
        console.log(`🎙️ [ElevenLabs] Transcribing audio: ${audioBuffer.length} bytes, language: ${language}`);
        if (!process.env.ELEVENLABS_API_KEY) {
            throw new Error('ElevenLabs API key not found in environment variables');
        }
        // Convert language code for ElevenLabs (they use ISO codes)
        const languageCode = language === 'nl' ? 'nl' : 'en';
        // Create FormData for the API request
        const formData = new FormData();
        // Create a blob from the audio buffer (convert Buffer to Uint8Array for Node.js compatibility)
        const audioBlob = new Blob([
            new Uint8Array(audioBuffer)
        ], {
            type: 'audio/webm'
        });
        const audioFile = new File([
            audioBlob
        ], 'recording.webm', {
            type: 'audio/webm'
        });
        formData.append('file', audioFile);
        formData.append('model_id', 'scribe_v1'); // Back to standard model
        formData.append('language_code', languageCode);
        formData.append('diarize', 'true'); // Enable speaker identification
        formData.append('tag_audio_events', 'true'); // Detect laughter, applause, etc. (correct parameter name)
        formData.append('timestamps_granularity', 'word'); // Word-level timestamps
        console.log(`🚀 [ElevenLabs] Sending request to Scribe API...`);
        console.log(`🔑 [ElevenLabs] API Key configured: ${!!process.env.ELEVENLABS_API_KEY}`);
        console.log(`📊 [ElevenLabs] File size: ${audioBuffer.length} bytes`);
        console.log(`📊 [ElevenLabs] Language: ${languageCode}`);
        console.log(`📊 [ElevenLabs] Model: scribe_v1`);
        const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY
            },
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [ElevenLabs] API Error (${response.status}):`, errorText);
            throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        }
        const result = await response.json();
        console.log(`✅ [ElevenLabs] Transcription complete:`);
        console.log(`   - Language: ${result.language_code} (${Math.round(result.language_probability * 100)}% confidence)`);
        console.log(`   - Characters: ${result.text.length}`);
        console.log(`   - Speakers detected: ${result.speakers?.length || 0}`);
        console.log(`   - Words with timestamps: ${result.words?.length || 0}`);
        // Enhanced logging with speaker information
        if (result.speakers && result.speakers.length > 0) {
            console.log(`👥 [ElevenLabs] Speakers identified:`);
            result.speakers.forEach((speaker, index)=>{
                const duration = Math.round(speaker.end - speaker.start);
                console.log(`   - ${speaker.speaker_id}: ${duration}s (${speaker.start}s - ${speaker.end}s)`);
            });
        }
        const cleanText = result.text.trim();
        console.log(`📝 [ElevenLabs] Sample: "${cleanText.substring(0, 100)}..."`);
        return cleanText;
    } catch (error) {
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
async function transcribeWithSpeakerAnalysis(audioBuffer, language = 'nl') {
    try {
        console.log(`🎙️ [ElevenLabs] Starting enhanced transcription with speaker analysis...`);
        if (!process.env.ELEVENLABS_API_KEY) {
            throw new Error('ElevenLabs API key not found');
        }
        const languageCode = language === 'nl' ? 'nl' : 'en';
        const formData = new FormData();
        const audioBlob = new Blob([
            new Uint8Array(audioBuffer)
        ], {
            type: 'audio/webm'
        });
        const audioFile = new File([
            audioBlob
        ], 'recording.webm', {
            type: 'audio/webm'
        });
        formData.append('file', audioFile);
        formData.append('model_id', 'scribe_v1'); // Back to standard model
        formData.append('language_code', languageCode);
        formData.append('diarize', 'true');
        formData.append('tag_audio_events', 'true');
        formData.append('timestamps_granularity', 'word');
        const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
            method: 'POST',
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }
        const result = await response.json();
        // Calculate speaker statistics
        const speakers = result.speakers?.map((speaker)=>{
            const duration = speaker.end - speaker.start;
            return {
                id: speaker.speaker_id,
                duration: Math.round(duration * 10) / 10,
                start: speaker.start,
                end: speaker.end
            };
        }) || [];
        const totalDuration = speakers.length > 0 ? Math.max(...speakers.map((s)=>s.end)) : 0;
        const speakersWithPercentage = speakers.map((speaker)=>({
                id: speaker.id,
                duration: speaker.duration,
                percentage: totalDuration > 0 ? Math.round(speaker.duration / totalDuration * 100) : 0
            }));
        console.log(`✅ [ElevenLabs] Enhanced transcription complete with ${speakers.length} speakers`);
        return {
            text: result.text.trim(),
            speakers: speakersWithPercentage,
            totalDuration: Math.round(totalDuration * 10) / 10
        };
    } catch (error) {
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
}),
"[project]/server/openai.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateMeetingSummary",
    ()=>generateMeetingSummary,
    "transcribeAudio",
    ()=>transcribeAudio,
    "transcribeAudioWithWhisper",
    ()=>transcribeAudioWithWhisper
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/openai/index.mjs [app-route] (ecmascript) <locals>");
// Import ElevenLabs Scribe for superior transcription accuracy
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$elevenlabs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/elevenlabs.ts [app-route] (ecmascript)");
;
// Using GPT-4o which is the most capable model currently available
const openai = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$openai$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]({
    apiKey: process.env.OPENAI_API_KEY
});
;
async function transcribeAudio(audioBuffer, language = 'nl') {
    try {
        console.log('🎯 Attempting ElevenLabs Scribe transcription first...');
        return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$elevenlabs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transcribeAudioWithElevenLabs"])(audioBuffer, language);
    } catch (elevenlabsError) {
        console.warn('⚠️ ElevenLabs failed, falling back to OpenAI Whisper:', elevenlabsError.message);
        console.log('🔄 Using OpenAI Whisper as fallback...');
        return await transcribeAudioWithWhisper(audioBuffer, language);
    }
}
async function transcribeAudioWithWhisper(audioBuffer, language = 'nl') {
    try {
        console.log(`🎙️ [Whisper Fallback] Transcribing audio: ${audioBuffer.length} bytes, language: ${language}`);
        // Create a File-like object from the buffer
        const audioBlob = new Blob([
            new Uint8Array(audioBuffer)
        ], {
            type: 'audio/webm'
        });
        const audioFile = new File([
            audioBlob
        ], 'recording.webm', {
            type: 'audio/webm'
        });
        const isEnglish = language === 'en';
        const promptText = isEnglish ? "This is a business meeting recording. Please transcribe clearly with proper punctuation and capitalization." : "Dit is een zakelijke meeting opname. Transcribeer duidelijk met juiste interpunctie en hoofdletters.";
        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: language === 'nl' ? 'nl' : 'en',
            response_format: "verbose_json",
            temperature: 0,
            prompt: promptText
        });
        // Extract text from verbose response
        let fullText = '';
        if (transcription.segments && Array.isArray(transcription.segments)) {
            // Use segments for better text quality
            fullText = transcription.segments.map((segment)=>segment.text?.trim()).filter(Boolean).join(' ');
        } else {
            // Fallback to main text
            fullText = transcription.text || '';
        }
        const cleanText = fullText.trim();
        console.log(`✅ [Whisper] Transcribed ${cleanText.length} characters: "${cleanText.substring(0, 100)}..."`);
        return cleanText;
    } catch (error) {
        console.error('❌ [Whisper] Error transcribing audio:', error);
        throw new Error('Failed to transcribe audio with Whisper: ' + (error?.message || error));
    }
}
async function generateMeetingSummary(transcription, meetingTitle, language = 'nl') {
    try {
        const isEnglish = language === 'en';
        const prompt = isEnglish ? `Please analyze this meeting transcription and provide a structured summary in JSON format with the following structure:

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
Transcription: ${transcription}` : `Analyseer deze meeting transcriptie en geef een gestructureerde samenvatting in JSON formaat met de volgende structuur:

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
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: isEnglish ? "You are an expert meeting assistant. Analyze meeting transcriptions and provide structured, accurate summaries. Always respond with valid JSON." : "Je bent een expert meeting assistent. Analyseer meeting transcripties en geef gestructureerde, nauwkeurige samenvattingen. Antwoord altijd met geldige JSON."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: {
                type: "json_object"
            }
        });
        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result;
    } catch (error) {
        console.error('Error generating meeting summary:', error);
        throw new Error('Failed to generate meeting summary: ' + (error?.message || error));
    }
}
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/server/processingService.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MeetingProcessingService",
    ()=>MeetingProcessingService,
    "processingService",
    ()=>processingService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/storage.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$openai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/openai.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$elevenlabs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/server/elevenlabs.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/util [external] (util, cjs)");
;
;
;
;
;
;
const readdir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readdir"]);
const readFile = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFile"]);
const unlink = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["unlink"]);
class MeetingProcessingService {
    processingQueue = new Map();
    processingChain = Promise.resolve();
    cleanupInterval;
    constructor(){
        // No longer using AudioStorageService - we work directly with temp files
        // Schedule periodic cleanup every 6 hours
        this.cleanupInterval = setInterval(()=>{
            // Clean orphaned audio chunks
            this.cleanupOrphanedChunks(24).catch((err)=>console.error('Periodic orphaned chunks cleanup failed:', err));
            // Clean old meetings according to retention policy
            this.runAutoCleanup().catch((err)=>console.error('Periodic meeting cleanup failed:', err));
        }, 6 * 60 * 60 * 1000); // 6 hours
    }
    // Process a finished meeting: transcribe audio and generate summary (strict serialization)
    async processMeeting(meetingId) {
        // Check if already processing this meeting
        if (this.processingQueue.has(meetingId)) {
            console.log(`⚠️ Meeting ${meetingId} is already being processed`);
            return this.processingQueue.get(meetingId);
        }
        // STRICT SERIALIZATION: Chain all processing to guarantee max 1 at a time
        const processingPromise = this.processingChain.then(async ()=>{
            console.log(`🚀 Starting serialized processing for meeting ${meetingId}`);
            return this.doProcessMeeting(meetingId);
        }).finally(()=>{
            // Clean up from queue when done
            this.processingQueue.delete(meetingId);
            console.log(`✅ Serialized processing completed for ${meetingId}`);
        });
        // Add to queue and update chain
        this.processingQueue.set(meetingId, processingPromise);
        this.processingChain = processingPromise.catch(()=>{}); // Continue chain even on errors
        return processingPromise;
    }
    // Internal processing method
    async doProcessMeeting(meetingId) {
        try {
            console.log(`Starting processing for meeting ${meetingId}`);
            // Get meeting details
            const meeting = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].getMeetingWithAttendees(meetingId);
            if (!meeting) {
                throw new Error(`Meeting ${meetingId} not found`);
            }
            // GDPR: Check consent before starting processing
            if (!meeting.organizerConsentGiven || !meeting.allAttendeesConsented || meeting.status === 'cancelled') {
                console.log(`❌ GDPR: Cannot process meeting ${meetingId} - missing consent or cancelled status`);
                await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].updateMeeting(meetingId, {
                    status: 'failed',
                    summary: {
                        error: 'Processing stopped due to missing consent or withdrawal'
                    }
                });
                return;
            }
            // Update status to processing
            await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].updateMeeting(meetingId, {
                status: 'processing'
            });
            // GDPR: Re-check consent before expensive transcription
            const consentCheck1 = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].getMeeting(meetingId);
            if (consentCheck1?.status === 'cancelled' || !consentCheck1?.allAttendeesConsented) {
                console.log(`❌ GDPR: Processing halted during transcription phase - consent withdrawn`);
                return;
            }
            // MEMORY-OPTIMIZED: Transcribe chunks sequentially WITH SPEAKER DIARIZATION
            console.log('🎯 OPTIMIZED: Processing audio chunks sequentially with speaker analysis...');
            const { transcription, speakers } = await this.transcribeChunksWithSpeakers(meetingId, meeting.language || 'nl');
            if (!transcription || transcription.length === 0) {
                throw new Error('No audio data found for transcription');
            }
            console.log(`✅ Sequential transcription completed (${transcription.length} chars): ${transcription.substring(0, 100)}...`);
            console.log(`👥 Speaker analysis: ${speakers.length} speakers detected`);
            // Save speaker data to database
            if (speakers.length > 0) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].addSpeakers(meetingId, speakers.map((speaker)=>({
                        speakerId: speaker.id,
                        duration: Math.round(speaker.duration),
                        percentage: speaker.percentage
                    })));
                // Also store raw speaker data as JSONB
                await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].updateMeeting(meetingId, {
                    speakerData: speakers
                });
                console.log(`👥 Saved ${speakers.length} speakers to database`);
            }
            // GDPR: Re-check consent before AI summary generation
            const consentCheck2 = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].getMeeting(meetingId);
            if (consentCheck2?.status === 'cancelled' || !consentCheck2?.allAttendeesConsented) {
                console.log(`❌ GDPR: Processing halted during AI summary phase - consent withdrawn`);
                return;
            }
            // Generate summary
            console.log('Generating AI summary...');
            const summary = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$openai$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["generateMeetingSummary"])(transcription, meeting.title, meeting.language || 'nl');
            // Update meeting with results
            await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].updateMeeting(meetingId, {
                status: 'completed',
                transcription: transcription,
                summary: summary
            });
            console.log(`Meeting ${meetingId} processing completed successfully`);
            // Final cleanup of any remaining chunk files
            await this.forceCleanupMeetingChunks(meetingId);
            // GDPR: Final consent check before email delivery
            const consentCheck3 = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].getMeeting(meetingId);
            if (consentCheck3?.status === 'cancelled' || !consentCheck3?.allAttendeesConsented) {
                console.log(`❌ GDPR: Email delivery halted - consent withdrawn`);
                return;
            }
            // Send email summary to attendees (refetch meeting with speakers)
            console.log(`Starting email delivery for meeting ${meetingId} to ${meeting.attendees.length} attendees`);
            const meetingWithSpeakers = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].getMeetingWithAttendees(meetingId);
            await this.sendEmailSummary(meetingWithSpeakers || meeting, transcription, summary);
        } catch (error) {
            console.error(`Error processing meeting ${meetingId}:`, error);
            // Mark as failed
            await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].updateMeeting(meetingId, {
                status: 'failed',
                summary: {
                    error: error.message
                }
            });
            throw error;
        }
    }
    // Memory-optimized: Process chunks sequentially WITH SPEAKER DIARIZATION
    async transcribeChunksWithSpeakers(meetingId, language) {
        console.log(`🔄 Starting sequential chunk transcription with speaker analysis for meeting ${meetingId}`);
        const tempDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"]('/tmp', 'audio-chunks');
        let fullTranscription = '';
        let allSpeakers = new Map();
        let totalDuration = 0;
        let processedChunks = 0;
        try {
            // Get all chunk files for this meeting, sorted by index
            const files = await readdir(tempDir);
            const chunkFiles = files.filter((file)=>file.startsWith(`${meetingId}-chunk-`) && file.endsWith('.webm')).map((file)=>{
                const match = file.match(new RegExp(`^${meetingId}-chunk-(\\d+)\\.webm$`));
                return match ? {
                    file,
                    chunkIndex: parseInt(match[1]),
                    filePath: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](tempDir, file)
                } : null;
            }).filter(Boolean).sort((a, b)=>a.chunkIndex - b.chunkIndex);
            console.log(`📋 Found ${chunkFiles.length} chunks to process sequentially`);
            if (chunkFiles.length === 0) {
                throw new Error('No audio chunks found for transcription');
            }
            // Process each chunk individually with per-chunk consent checks
            for (const chunkFile of chunkFiles){
                if (chunkFile && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](chunkFile.filePath)) {
                    try {
                        // GDPR: Check consent before processing each chunk for immediate halt
                        const consentCheck = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].getMeeting(meetingId);
                        if (consentCheck?.status === 'cancelled' || !consentCheck?.allAttendeesConsented) {
                            console.log(`❌ GDPR: Transcription halted at chunk ${chunkFile.chunkIndex} - consent withdrawn`);
                            // Force cleanup of remaining chunks when halted
                            await this.forceCleanupMeetingChunks(meetingId);
                            throw new Error('Processing halted due to consent withdrawal');
                        }
                        console.log(`🎙️ Processing chunk ${chunkFile.chunkIndex} (${processedChunks + 1}/${chunkFiles.length})...`);
                        // Read chunk into memory temporarily
                        const chunkBuffer = await readFile(chunkFile.filePath);
                        console.log(`📥 Chunk ${chunkFile.chunkIndex} size: ${Math.round(chunkBuffer.length / 1024)} KB`);
                        // Transcribe this chunk WITH speaker analysis  
                        const chunkResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$elevenlabs$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["transcribeWithSpeakerAnalysis"])(chunkBuffer, language);
                        // Add to full transcription with space separator
                        if (chunkResult.text.trim()) {
                            fullTranscription += (fullTranscription ? ' ' : '') + chunkResult.text.trim();
                            console.log(`✅ Chunk ${chunkFile.chunkIndex} transcribed: ${chunkResult.text.length} chars, ${chunkResult.speakers.length} speakers`);
                            // Accumulate speaker data
                            totalDuration += chunkResult.totalDuration;
                            for (const speaker of chunkResult.speakers){
                                if (!allSpeakers.has(speaker.id)) {
                                    allSpeakers.set(speaker.id, {
                                        duration: 0,
                                        segments: 0
                                    });
                                }
                                const existing = allSpeakers.get(speaker.id);
                                existing.duration += speaker.duration;
                                existing.segments++;
                            }
                        }
                        processedChunks++;
                        // Clean up chunk file immediately to save disk space
                        await unlink(chunkFile.filePath);
                        console.log(`🗑️ Cleaned up chunk file: ${chunkFile.file}`);
                    } catch (error) {
                        console.error(`❌ Error processing chunk ${chunkFile.chunkIndex}:`, error);
                    // Continue with next chunk instead of failing completely
                    }
                }
            }
            // Calculate final speaker percentages
            const speakers = Array.from(allSpeakers.entries()).map(([id, data])=>({
                    id,
                    duration: Math.round(data.duration * 10) / 10,
                    percentage: totalDuration > 0 ? Math.round(data.duration / totalDuration * 100) : 0
                })).sort((a, b)=>b.percentage - a.percentage); // Sort by speaking time
            console.log(`🎉 Sequential transcription completed: ${processedChunks} chunks processed, ${fullTranscription.length} total characters`);
            console.log(`👥 Final speaker analysis: ${speakers.length} unique speakers over ${Math.round(totalDuration)}s`);
            speakers.forEach((speaker)=>{
                console.log(`   - ${speaker.id}: ${speaker.duration}s (${speaker.percentage}%)`);
            });
            return {
                transcription: fullTranscription,
                speakers
            };
        } catch (error) {
            console.error(`❌ Error in sequential chunk transcription:`, error);
            // Cleanup remaining chunks on error
            await this.forceCleanupMeetingChunks(meetingId);
            throw error;
        }
    }
    // Robust cleanup that doesn't depend on in-memory Map (works after restarts)
    async forceCleanupMeetingChunks(meetingId) {
        const tempDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"]('/tmp', 'audio-chunks');
        try {
            console.log(`🗑️ Force cleanup: scanning ${tempDir} for meeting ${meetingId} files...`);
            // Check if temp directory exists
            if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](tempDir)) {
                console.log(`🗋 Temp directory ${tempDir} doesn't exist, nothing to clean`);
                return;
            }
            const files = await readdir(tempDir);
            const meetingFiles = files.filter((file)=>file.startsWith(`${meetingId}-chunk-`) && file.endsWith('.webm'));
            console.log(`🗋 Found ${meetingFiles.length} files to cleanup for meeting ${meetingId}`);
            for (const file of meetingFiles){
                const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](tempDir, file);
                try {
                    if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](filePath)) {
                        await unlink(filePath);
                        console.log(`✅ Cleaned up: ${file}`);
                    }
                } catch (error) {
                    console.error(`⚠️ Could not delete ${file}:`, error);
                }
            }
            console.log(`🎉 Cleanup completed for meeting ${meetingId}`);
        } catch (error) {
            console.error(`❌ Error during force cleanup for meeting ${meetingId}:`, error);
        }
    }
    // AUTO-CLEANUP POLICY: Remove old meetings according to retention settings
    async runAutoCleanup() {
        try {
            console.log('🔄 Running auto-cleanup policy for old meetings...');
            // Get all meetings that could be candidates for cleanup
            const meetings = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].getMeetingsForCleanup();
            let cleanedCount = 0;
            for (const meeting of meetings){
                if (!meeting.autoCleanupEnabled) {
                    continue;
                }
                const retentionDays = meeting.retentionDays || 30;
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
                // Check if meeting is older than retention period
                if (meeting.createdAt <= cutoffDate) {
                    console.log(`🗑️ Auto-cleanup: Meeting "${meeting.title}" (${meeting.id}) is ${retentionDays}+ days old`);
                    try {
                        // Clean up associated audio files first
                        await this.forceCleanupMeetingChunks(meeting.id);
                        // Delete meeting from database (cascades to attendees, speakers, chunks)
                        await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].cleanupMeeting(meeting.id);
                        cleanedCount++;
                        console.log(`✅ Auto-cleanup: Removed meeting "${meeting.title}" and all associated data`);
                    } catch (error) {
                        console.error(`❌ Auto-cleanup failed for meeting ${meeting.id}:`, error);
                        // Update last cleanup attempt even if failed
                        await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].updateLastCleanup(meeting.id);
                    }
                } else {
                    // Meeting is still within retention period, just update last check
                    await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].updateLastCleanup(meeting.id);
                }
            }
            console.log(`🎉 Auto-cleanup completed: ${cleanedCount} meetings removed`);
        } catch (error) {
            console.error('❌ Error during auto-cleanup policy execution:', error);
        }
    }
    // Manual cleanup for specific meeting (for user-triggered deletion)
    async manualCleanupMeeting(meetingId) {
        try {
            console.log(`🗑️ Manual cleanup requested for meeting ${meetingId}`);
            // Clean audio files
            await this.forceCleanupMeetingChunks(meetingId);
            // Delete from database
            await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].cleanupMeeting(meetingId);
            console.log(`✅ Manual cleanup completed for meeting ${meetingId}`);
        } catch (error) {
            console.error(`❌ Manual cleanup failed for meeting ${meetingId}:`, error);
            throw error;
        }
    }
    // Configure retention policy for a meeting
    async updateRetentionPolicy(meetingId, retentionDays, autoCleanup = true) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].updateMeeting(meetingId, {
            retentionDays: retentionDays,
            autoCleanupEnabled: autoCleanup
        });
        console.log(`📝 Updated retention policy for meeting ${meetingId}: ${retentionDays} days, auto-cleanup: ${autoCleanup}`);
    }
    // Get cleanup statistics
    async getCleanupStats() {
        const meetings = await __TURBOPACK__imported__module__$5b$project$5d2f$server$2f$storage$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["storage"].getMeetingsForCleanup();
        const withAutoCleanup = meetings.filter((m)=>m.autoCleanupEnabled);
        let eligibleCount = 0;
        let totalRetentionDays = 0;
        for (const meeting of meetings){
            const retentionDays = meeting.retentionDays || 30;
            totalRetentionDays += retentionDays;
            if (meeting.autoCleanupEnabled) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
                if (meeting.createdAt <= cutoffDate) {
                    eligibleCount++;
                }
            }
        }
        return {
            totalMeetings: meetings.length,
            meetingsWithAutoCleanup: withAutoCleanup.length,
            meetingsEligibleForCleanup: eligibleCount,
            averageRetentionDays: meetings.length > 0 ? Math.round(totalRetentionDays / meetings.length) : 30
        };
    }
    // Periodic cleanup of orphaned files (called periodically)
    async cleanupOrphanedChunks(maxAgeHours = 24) {
        const tempDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"]('/tmp', 'audio-chunks');
        try {
            console.log(`🔄 Running periodic cleanup of orphaned chunks older than ${maxAgeHours} hours...`);
            if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](tempDir)) {
                console.log(`🗋 No temp directory found at ${tempDir}`);
                return;
            }
            const files = await readdir(tempDir);
            const chunkFiles = files.filter((file)=>file.match(/^[a-f0-9-]+-chunk-\d+\.webm$/));
            let cleanedCount = 0;
            const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
            for (const file of chunkFiles){
                const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](tempDir, file);
                try {
                    const stats = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["statSync"](filePath);
                    const age = Date.now() - stats.mtime.getTime();
                    if (age > maxAge) {
                        await unlink(filePath);
                        console.log(`🗑️ Cleaned up orphaned chunk: ${file} (${Math.round(age / 1000 / 60)} minutes old)`);
                        cleanedCount++;
                    }
                } catch (error) {
                    console.error(`⚠️ Error checking/deleting orphaned file ${file}:`, error);
                }
            }
            console.log(`🎉 Periodic cleanup completed: ${cleanedCount} orphaned files removed`);
        } catch (error) {
            console.error(`❌ Error during periodic cleanup:`, error);
        }
    }
    // Send email summary to attendees (with speaker info if available)
    async sendEmailSummary(meeting, transcription, summary) {
        try {
            console.log(`sendEmailSummary called for meeting ${meeting.id} with ${meeting.attendees.length} attendees`);
            console.log('Attendees:', meeting.attendees.map((a)=>a.email));
            const { emailService } = await __turbopack_context__.A("[project]/server/emailService.ts [app-route] (ecmascript, async loader)");
            console.log('EmailService imported, calling sendMeetingSummary...');
            // Enhance summary with speaker information if available
            const enhancedSummary = {
                ...summary,
                speakers: meeting.speakers || []
            };
            const success = await emailService.sendMeetingSummary(meeting.title, meeting.attendees, transcription, enhancedSummary, meeting.language || 'nl');
            if (success) {
                console.log(`✅ Email summary sent successfully for meeting ${meeting.id}`);
            } else {
                console.error(`❌ Failed to send email summary for meeting ${meeting.id}`);
            }
        } catch (error) {
            console.error(`❌ Error sending email summary for meeting ${meeting.id}:`, error);
            console.error('Error details:', error?.message || error);
        }
    }
}
const processingService = new MeetingProcessingService();
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__e8de1281._.js.map