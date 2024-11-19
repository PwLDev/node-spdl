import stream from "node:stream";
import { SpdlAuth, SpdlSession } from "../lib/auth";

declare type SpdlAuthLike = SpdlAuth | SpdlSession;

declare interface SpdlClientOptions {
    auth?: SpdlAuthLike;
    cookie?: string;
    accessToken?: string;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    refreshToken?: string;
    autoRefresh?: boolean;
    ffmpegPath?: boolean;
}

declare type SpdlAudioQuality = "vorbis_low" | "vorbis_medium" | "vorbis_high" | "aac_low" | "aac_high" | number;
declare type SpdlAudioContainer = "m4a" | "ogg" | "mp3" | "webm";

declare interface SpdlOptions {
    auth?: SpdlAuthLike;
    cookie?: string;
    accessToken?: string;
    quality?: SpdlAudioQuality;
    format?: SpdlAudioContainer;
    ffmpegPath?: boolean;
    discrete?: boolean;
    tags?: boolean;
    lyrics?: boolean;
}

declare interface SpdlAuthOptions {
    cookie?: string;
    accessToken?: string;
}

declare interface SpdlSessionOptions {
    username: string;
    password: string;
}

declare interface Track {
    albumName: string;
    name: string;
    year: string;
    trackNumber: number;
    trackId: string;
    isPlayable: boolean;
}

export {
    SpdlOptions,
    SpdlClientOptions,
    SpdlAuthLike,
    SpdlAuthOptions,
    Track,
};