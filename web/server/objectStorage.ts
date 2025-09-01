import { Storage, File } from "@google-cloud/storage";
import { Response } from "express";
import { randomUUID } from "crypto";

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

// The object storage client is used to interact with the object storage service.
export const objectStorageClient = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

// The object storage service is used to interact with the object storage service.
export class ObjectStorageService {
  constructor() {}

  // Gets the private object directory.
  getPrivateObjectDir(): string {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Create a bucket in 'Object Storage' " +
          "tool and set PRIVATE_OBJECT_DIR env var."
      );
    }
    return dir;
  }

  // Uploads an audio chunk to object storage
  async uploadAudioChunk(meetingId: string, chunkIndex: number, audioBuffer: Buffer): Promise<string> {
    const privateObjectDir = this.getPrivateObjectDir();
    const filename = `${meetingId}/chunk-${chunkIndex}.webm`;
    const fullPath = `${privateObjectDir}/audio/${filename}`;

    const { bucketName, objectName } = parseObjectPath(fullPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);

    // Upload the audio buffer to object storage
    await file.save(audioBuffer, {
      metadata: {
        contentType: 'audio/webm',
      },
    });

    return fullPath;
  }

  // Downloads an audio file from object storage
  async downloadAudioChunk(objectPath: string): Promise<Buffer> {
    const { bucketName, objectName } = parseObjectPath(objectPath);
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);

    const [exists] = await file.exists();
    if (!exists) {
      throw new ObjectNotFoundError();
    }

    const [buffer] = await file.download();
    return buffer;
  }

  // Gets all audio chunks for a meeting from object storage
  async getAllAudioChunksForMeeting(meetingId: string): Promise<Buffer[]> {
    const privateObjectDir = this.getPrivateObjectDir();
    const prefix = `${privateObjectDir}/audio/${meetingId}/`;
    
    const { bucketName } = parseObjectPath(prefix);
    const bucket = objectStorageClient.bucket(bucketName);
    
    // List all files with the meeting prefix
    const [files] = await bucket.getFiles({ prefix: prefix.split('/').slice(1).join('/') });
    
    // Sort files by chunk index
    files.sort((a, b) => {
      const aIndex = parseInt(a.name.match(/chunk-(\d+)\.webm$/)?.[1] || '0');
      const bIndex = parseInt(b.name.match(/chunk-(\d+)\.webm$/)?.[1] || '0');
      return aIndex - bIndex;
    });

    // Download all chunks
    const chunks: Buffer[] = [];
    for (const file of files) {
      const [buffer] = await file.download();
      chunks.push(buffer);
    }

    return chunks;
  }

  // Combines audio chunks into a single buffer for transcription
  async combineAudioChunks(meetingId: string): Promise<Buffer> {
    const chunks = await this.getAllAudioChunksForMeeting(meetingId);
    return Buffer.concat(chunks);
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}