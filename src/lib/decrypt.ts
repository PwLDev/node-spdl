import { createDecipheriv } from "node:crypto";
import { Transform, TransformCallback } from "node:stream";

const NONCE = Buffer.from("72e067fbddcbcf77", "hex");
const COUNTER = Buffer.from("ebe8bc643f630d93", "hex");
const INITIAL_VALUE = Buffer.concat([NONCE, COUNTER]);

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
    const decipher = createDecipheriv("aes-128-ctr", key, INITIAL_VALUE);
    const decrypted = decipher.update(data);
    return decrypted.slice(decrypted.indexOf("OggS"));
}

/**
 * Decrypts content from Spotify's CDN as a stream using it's decryption algorithm.
 * @param {Buffer} key AES decryption key
 * @returns Transform decrypted stream
 */
export const createPPStreamDecryptor = (key: Buffer) => {
    const decipher = createDecipheriv(
        "aes-128-ctr", key, INITIAL_VALUE
    );

    let foundOggS = false;
    let bufferedData = Buffer.alloc(0);

    return new Transform({
        transform(
            chunk: Buffer, 
            encoding: BufferEncoding, 
            callback: TransformCallback
        ) {
            try {
                let decrypted = decipher.update(chunk);

                if (!foundOggS) {
                    bufferedData = Buffer.concat([bufferedData, decrypted]);

                    const headerIndex = bufferedData.indexOf(Buffer.from("OggS"));
                    if (headerIndex !== -1) {
                        bufferedData = bufferedData.slice(headerIndex); 
                        foundOggS = true;
                        this.push(bufferedData); 
                        bufferedData = Buffer.alloc(0); // Reset the buffer to prevent memory leaks
                    }
                } else {
                    this.push(decrypted); // Push remaining decrypted data
                }

                callback(null);
            } catch (error: any) {
                callback(error);
            }
        },
        flush(callback: TransformCallback) {
            try {
                let final = decipher.final();

                if (foundOggS) {
                    this.push(final);
                }

                callback(null);
            } catch (error: any) {
                callback(error);
            }
        }
    });
}