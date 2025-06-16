import { createDecipheriv } from "node:crypto";
import { Transform, TransformCallback } from "node:stream";

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

                callback()
            } catch (error: any) {
                callback(error);
            }
        },
        flush(callback: TransformCallback) {
            try {
                let final = decipher.final();
                this.push(final);

                callback(null);
            } catch (error: any) {
                callback(error);
            }
        }
    });
}