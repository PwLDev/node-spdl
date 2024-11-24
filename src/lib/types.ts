import fs from "node:fs";
import { SpdlAuth } from "./auth.js";

declare type SpdlAudioFormat = "vorbis_low" | "vorbis_medium" | "vorbis_high" | "mp3_low" | "mp4_low" | "mp4_high" | "mp4_high_dual";
declare type SpdlAudioContainer = "ogg" | "mp3" | "webm" | "mp4";

declare interface SpdlOptions {
    auth?: SpdlAuth;
    cookie?: string;
    accessToken?: string;
    format?: SpdlAudioFormat;
    container?: SpdlAudioContainer;
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