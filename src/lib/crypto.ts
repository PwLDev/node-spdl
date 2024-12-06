import { createDecipheriv } from "node:crypto";
import { Transform, TransformCallback } from "node:stream";

const NONCE = "72e067fbddcbcf77";
const INITIAL_VALUE = "ebe8bc643f630d93";
const COMBINED = Buffer.from(NONCE + INITIAL_VALUE, 'hex');

const OggS = Buffer.from("OggS", "utf-8");
const OggStart = Buffer.from([0x00, 0x02]);
const Zeroes = Buffer.alloc(10, 0x00);

/**
 * Decrypts content from Spotify's CDN using it's decryption algorithm.
 * @param {Buffer} data Content buffer to decrypt
 * @param {Buffer} key AES decryption key
 * @returns Decrypted content
 */
export const decryptContent = (
    data: Buffer,
    key: Buffer
) => {
    const decipher = createDecipheriv("aes-128-ctr", key, COMBINED);
    return decipher.update(data);
}

export const rebuildOgg = (buffer: Buffer) => {
    OggS.copy(buffer, 0, 0, OggS.length); // Copy "OggS" header
    OggStart.copy(buffer, 4, 0, OggStart.length); // Set starting values
    Zeroes.copy(buffer, 6, 0, Zeroes.length); // Fill with zeroes
}

/**
 * Decrypts content from Spotify's CDN as a stream using it's decryption algorithm.
 * @param {Buffer} key AES decryption key
 * @returns Transform decrypted stream
 */
export const createStreamDecryptor = (key: Buffer, format: string) => {
    const decipher = createDecipheriv("aes-128-ctr", key, COMBINED);

    let correctedChunk = true;

    return new Transform({
        transform(
            chunk: Buffer, 
            encoding: BufferEncoding, 
            callback: TransformCallback
        ) {
            try {
                let decrypted = decipher.update(chunk);

                if (format.includes("vorbis") && !correctedChunk) {
                    if (decrypted.length > 5) {
                        rebuildOgg(decrypted);
                        correctedChunk = true;
                    }
                }

                callback(null, decrypted);
            } catch (error: any) {
                callback(error);
            }
        },
        flush(callback: TransformCallback) {
            try {
                const final = decipher.final();
                callback(null, final);
            } catch (error: any) {
                callback(error);
            }
        }
    });
}