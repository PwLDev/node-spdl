import crypto from "node:crypto";
// TODO: decrypt aes

export class Packet {
    command: Buffer;
    payload: Buffer;
    secretBlock = Buffer.from([0x02]);
    ping = Buffer.from([0x04]);
    streamChunk = Buffer.from([0x08]);
    streamChunkRes = Buffer.from([0x09]);
    channelError = Buffer.from([0x0a]);
    channelAbort = Buffer.from([0x0b]);
    requestKey = Buffer.from([0x0c]);
    aesKey = Buffer.from([0x0d]);
    aesKeyError = Buffer.from([0x0e]);
    image = Buffer.from([0x19]);
    countryCode = Buffer.from([0x1b]);
    pong = Buffer.from([0x49]);
    pongAck = Buffer.from([0x4a]);
    pause = Buffer.from([0x4b]);
    productInfo = Buffer.from([0x50]);
    legacyWelcome = Buffer.from([0x69]);
    licenseVersion = Buffer.from([0x76]);
    login = Buffer.from([0xab]);
    apWelcome = Buffer.from([0xac]);
    authFailure = Buffer.from([0xad]);
    trackEndedTime = Buffer.from([0x82]);
    unknownDataAllZeros = Buffer.from([0x1f]);
    preferredLocale = Buffer.from([0x74]);
    unknown0x4f = Buffer.from([0x4f]);
    unknown0x0f = Buffer.from([0x0f]);
    unknown0x10 = Buffer.from([0x10]);
    
    constructor(command: Buffer, payload: Buffer) {
        this.command = command;
        this.payload = payload;
    }

    isCommand(command: Buffer): boolean {
        return command === this.command;
    }
}