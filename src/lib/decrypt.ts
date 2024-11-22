import crypto from "node:crypto";

export class AudioDecryptor {
    algorithm = "aes-256-cbc";
    audioIv = Buffer.from([
        0x72, 0xe0, 0x67, 0xfb, 0xdd, 0xcb, 0xcf, 0x77,
        0xeb, 0xe8, 0xbc, 0x64, 0x3f, 0x63, 0x0d, 0x93
    ]);
    ivInt = BigInt("0x" + this.audioIv.toString("hex"));
    ivDiff = 0x100;
    cipher: crypto.Cipher | null = null;
    key: Buffer;

    constructor(key: Buffer) {
        this.key = key;
    }

    decryptChunk(i: number, buffer: Buffer) {
        const newBuffer = Buffer.alloc(0);
        const chunkSize = 128 * 1024;
    }
}