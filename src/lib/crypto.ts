import { createDecipheriv } from "node:crypto";
import { Transform, TransformCallback } from "node:stream";

const NONCE = Buffer.from("72E067FBDDCBCF77", "hex");
const INITIAL_VALUE = Buffer.from("EBE8BC643F630D93", "hex");
const COMBINED = Buffer.concat([NONCE, INITIAL_VALUE]);

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
    const decipher = createDecipheriv(
        "aes-128-ctr",
        key,
        INITIAL_VALUE
    );
    return decipher.update(data);
}

/**
 * Decrypts content from Spotify's CDN as a stream using it's decryption algorithm.
 * @param {Buffer} key AES decryption key
 * @returns Transform decrypted stream
 */
export const createStreamDecryptor = (key: Buffer) => {
    const decipher = createDecipheriv(
        "aes-128-ctr",
        key,
        INITIAL_VALUE
    );

    return new Transform({
        transform(
            chunk: Buffer, 
            encoding: BufferEncoding, 
            callback: TransformCallback
        ) {
            try {
                const decrypted = decipher.update(chunk);
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