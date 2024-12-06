import fs from "node:fs";
import { SpdlAuth } from "./auth.js";

export declare type SpdlAudioQuality = "vorbis_low" | "vorbis_medium" | "vorbis_high" | "mp3_low" | "mp4_low" | "mp4_high" | "mp4_high_dual" | "acc_medium";
export declare type SpdlAudioContainer = "ogg" | "mp3" | "webm" | "mp4";

export declare interface SpdlOptions {
    auth: SpdlAuth;
    format?: SpdlAudioQuality;
    container?: SpdlAudioContainer;
    discrete?: boolean;
    metadata?: boolean;
    lyrics?: boolean;
    preload?: boolean;
    highWaterMark?: number;
    ffmpegPath?: fs.PathLike;
}

export declare type SpdlAuthLike = SpdlAuthOptions | SpdlAuth;

export declare interface SpdlAuthOptions {
    cookie?: string;
    accessToken?: string;
}