import fs from "node:fs";
import { SpdlAuth } from "./auth.js";

declare type SpdlAudioQuality = "vorbis_low" | "vorbis_medium" | "vorbis_high" | "aac_low" | "aac_high" | number;
declare type SpdlAudioContainer = "m4a" | "ogg" | "mp3" | "webm";

declare interface SpdlOptions {
    auth?: SpdlAuth;
    cookie?: string;
    accessToken?: string;
    quality?: SpdlAudioQuality;
    format?: SpdlAudioContainer;
    discrete?: boolean;
    metadata?: boolean;
    lyrics?: boolean;
    highWaterMark?: number;
    ffmpegPath?: fs.PathLike;
}

declare type SpdlAuthLike = SpdlAuthOptions | SpdlAuth;

declare interface SpdlAuthOptions {
    cookie?: string;
    accessToken?: string;
}

export {
    SpdlOptions,
    SpdlAuthLike,
    SpdlAuthOptions
}