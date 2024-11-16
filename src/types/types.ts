import { SpdlAuth } from "../lib/auth";

declare interface SpdlClientOptions {
    cookie?: string;
    accessToken?: string;
    clientId?: string;
    clientSecret?: string;
    redirectUri?: string;
    refreshToken?: string;
    autoRefresh?: boolean;
    ffmpegPath?: boolean;
}

type SpdlAudioQuality = "vorbis_low" | "vorbis_medium" | "vorbis_high" | "aac_low" | "aac_high" | number;
type SpdlAudioContainer = "m4a" | "ogg" | "mp3" | "webm";

declare interface SpdlOptions {
    auth?: SpdlAuth;
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
    SpdlAuthOptions,
    Track
}