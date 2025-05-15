import { createDecipheriv } from "node:crypto";
import { Transform, TransformCallback } from "node:stream";

import { SpotifyStreamError } from "./errors.js";

const NONCE = Buffer.from("72e067fbddcbcf77", "hex");
const COUNTER = Buffer.from("ebe8bc643f630d93", "hex");
const INITIAL_VALUE = Buffer.concat([NONCE, COUNTER]);

/**
 * Decrypts content from Spotify's CDN as a stream using its decryption algorithm.
 * @param {Buffer} key AES decryption key
 * @returns Transform decrypted stream
 */
export const createPPStreamDecryptor = (key: Buffer) => {
    let toSkip = 0xa7;
    let headerFound = false;
    const decipher = createDecipheriv(
        "aes-128-ctr", key, INITIAL_VALUE
    );

    return new Transform({
        transform(
            chunk: Buffer, 
            encoding: BufferEncoding,
            callback: TransformCallback
        ) {
            try {
                let decrypted = decipher.update(chunk);

                if (toSkip > decrypted.length) {
                    toSkip -= decrypted.length;
                } else {
                    if (toSkip != decrypted.length) this.push(decrypted.subarray(toSkip));
                    toSkip = 0;
                }

                if (decrypted.indexOf("OggS") >= 0) {
                    headerFound = true;
                }

                callback();
            } catch (error: any) {
                callback(error);
            }
        },
        flush(callback) {
            try {
                let final = decipher.final();
                this.push(final);

                if (final.indexOf("OggS") >= 0) {
                    headerFound = true;
                }

                if (!headerFound) {
                    throw new SpotifyStreamError("Failed to decrypt a valid OGG file!");
                }

                callback(null);
            } catch (error: any) {
                callback(error);
            }
        }
    });
}