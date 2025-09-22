module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/server/audioStorage.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Temporary file-based audio storage for deployment compatibility
// Replaces Replit-specific object storage
__turbopack_context__.s([
    "AudioStorageService",
    ()=>AudioStorageService,
    "audioStorage",
    ()=>audioStorage
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/util [external] (util, cjs)");
;
;
;
const writeFile = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["writeFile"]);
const readFile = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFile"]);
const unlink = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["unlink"]);
const mkdir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["mkdir"]);
const readdir = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$util__$5b$external$5d$__$28$util$2c$__cjs$29$__["promisify"])(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readdir"]);
class TemporaryFileAudioStorage {
    chunks = new Map();
    tempDir;
    constructor(){
        // Use /tmp directory for temporary audio storage
        this.tempDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"]('/tmp', 'audio-chunks');
        this.ensureTempDirectory();
    }
    async ensureTempDirectory() {
        try {
            await mkdir(this.tempDir, {
                recursive: true
            });
        } catch (error) {
        // Directory might already exist, that's ok
        }
    }
    // Generate key for storing chunks
    getChunkKey(meetingId, chunkIndex) {
        return `${meetingId}-chunk-${chunkIndex}`;
    }
    // Generate file path for chunk
    getChunkFilePath(meetingId, chunkIndex) {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](this.tempDir, `${meetingId}-chunk-${chunkIndex}.webm`);
    }
    // Upload an audio chunk to temporary file
    async uploadAudioChunk(meetingId, chunkIndex, audioBuffer) {
        try {
            console.log(`Storing audio chunk ${chunkIndex} for meeting ${meetingId}, size: ${audioBuffer.length} bytes`);
            await this.ensureTempDirectory();
            const chunkKey = this.getChunkKey(meetingId, chunkIndex);
            const filePath = this.getChunkFilePath(meetingId, chunkIndex);
            // Write buffer to temporary file
            await writeFile(filePath, audioBuffer);
            const chunk = {
                meetingId,
                chunkIndex,
                filePath,
                timestamp: new Date()
            };
            this.chunks.set(chunkKey, chunk);
            console.log(`Successfully stored chunk ${chunkIndex} to file: ${filePath}`);
            return chunkKey; // Return key as the "path"
        } catch (error) {
            console.error(`Error storing audio chunk ${chunkIndex}:`, error);
            throw new Error(`Failed to store audio chunk: ${error?.message || error}`);
        }
    }
    // Download an audio chunk from temporary file
    async downloadAudioChunk(chunkKey) {
        console.log(`📥 Downloading audio chunk: ${chunkKey}`);
        // Parse meetingId and chunkIndex from chunkKey
        const parts = chunkKey.split('-chunk-');
        if (parts.length !== 2) {
            throw new Error(`Invalid chunk key format: ${chunkKey}`);
        }
        const meetingId = parts[0];
        const chunkIndex = parseInt(parts[1]);
        const filePath = this.getChunkFilePath(meetingId, chunkIndex);
        console.log(`🔍 Looking for file: ${filePath}`);
        try {
            // Always read directly from file system (ignore in-memory Map which gets reset after restart)
            if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](filePath)) {
                console.log(`✅ Found and reading chunk file: ${filePath}`);
                const buffer = await readFile(filePath);
                console.log(`✅ Successfully read chunk ${chunkIndex}, size: ${buffer.length} bytes`);
                return buffer;
            } else {
                console.error(`❌ Audio chunk file not found at: ${filePath}`);
                // Debug: Check what files exist for this meeting
                try {
                    const files = await readdir(this.tempDir);
                    const meetingFiles = files.filter((f)=>f.includes(meetingId));
                    console.log(`🔍 Available files for meeting ${meetingId}:`, meetingFiles);
                } catch (e) {
                    console.error(`❌ Could not read temp directory ${this.tempDir}`);
                }
                throw new Error(`Audio chunk file not found: ${filePath}`);
            }
        } catch (error) {
            console.error(`❌ Failed to read audio chunk ${chunkKey}:`, error);
            throw new Error(`Failed to read audio chunk: ${error?.message || error}`);
        }
    }
    // Get all audio chunks for a meeting
    async getAllAudioChunksForMeeting(meetingId) {
        console.log(`Getting all audio chunks for meeting: ${meetingId}`);
        // Read directly from file system instead of relying on in-memory Map
        // (which gets reset after server restart)
        const buffers = [];
        try {
            const files = await readdir(this.tempDir);
            const chunkFiles = files.filter((file)=>file.startsWith(`${meetingId}-chunk-`) && file.endsWith('.webm')).map((file)=>{
                const match = file.match(new RegExp(`^${meetingId}-chunk-(\\d+)\\.webm$`));
                return match ? {
                    file,
                    chunkIndex: parseInt(match[1]),
                    filePath: __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"](this.tempDir, file)
                } : null;
            }).filter(Boolean).sort((a, b)=>a.chunkIndex - b.chunkIndex);
            console.log(`Found ${chunkFiles.length} chunk files for meeting ${meetingId}`);
            for (const chunkFile of chunkFiles){
                if (chunkFile && __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](chunkFile.filePath)) {
                    try {
                        const buffer = await readFile(chunkFile.filePath);
                        buffers.push(buffer);
                        console.log(`✅ Read chunk ${chunkFile.chunkIndex}: ${buffer.length} bytes`);
                    } catch (error) {
                        console.error(`Error reading chunk file ${chunkFile.filePath}:`, error);
                    }
                }
            }
        } catch (error) {
            console.error(`Error reading temp directory ${this.tempDir}:`, error);
        }
        console.log(`Total chunks loaded: ${buffers.length}`);
        return buffers;
    }
    // Combine audio chunks into a single buffer for transcription
    async combineAudioChunks(meetingId) {
        const chunks = await this.getAllAudioChunksForMeeting(meetingId);
        return Buffer.concat(chunks);
    }
    // Get first audio chunk for transcription (since WebM chunks can't be concatenated)
    async getFirstAudioChunk(meetingId) {
        const firstChunkKey = this.getChunkKey(meetingId, 0);
        console.log(`Looking for first audio chunk: ${firstChunkKey}`);
        try {
            const buffer = await this.downloadAudioChunk(firstChunkKey);
            console.log(`Successfully found first audio chunk, size: ${buffer.length} bytes`);
            return buffer;
        } catch (error) {
            console.log(`First audio chunk not found for meeting ${meetingId}:`, error);
            return null;
        }
    }
    // Clean up chunks for a meeting (optional - for memory management)
    async cleanupMeetingChunks(meetingId) {
        const keysToDelete = [];
        const filesToDelete = [];
        for (const [key, chunk] of this.chunks.entries()){
            if (chunk.meetingId === meetingId) {
                keysToDelete.push(key);
                filesToDelete.push(chunk.filePath);
            }
        }
        // Delete files
        for (const filePath of filesToDelete){
            try {
                if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](filePath)) {
                    await unlink(filePath);
                }
            } catch (error) {
                console.error(`Error deleting file ${filePath}:`, error);
            }
        }
        // Remove from memory map
        keysToDelete.forEach((key)=>this.chunks.delete(key));
        console.log(`Cleaned up ${keysToDelete.length} chunks for meeting ${meetingId}`);
    }
    // Get storage stats
    getStorageStats() {
        let totalBytes = 0;
        let validChunks = 0;
        for (const chunk of this.chunks.values()){
            try {
                if (__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"](chunk.filePath)) {
                    const stats = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["statSync"](chunk.filePath);
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
const audioStorage = new TemporaryFileAudioStorage();
class AudioStorageService {
    async uploadAudioChunk(meetingId, chunkIndex, audioBuffer) {
        return audioStorage.uploadAudioChunk(meetingId, chunkIndex, audioBuffer);
    }
    async downloadAudioChunk(chunkKey) {
        return audioStorage.downloadAudioChunk(chunkKey);
    }
    async getAllAudioChunksForMeeting(meetingId) {
        return audioStorage.getAllAudioChunksForMeeting(meetingId);
    }
    async combineAudioChunks(meetingId) {
        return audioStorage.combineAudioChunks(meetingId);
    }
    async getFirstAudioChunk(meetingId) {
        return audioStorage.getFirstAudioChunk(meetingId);
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3a43479b._.js.map