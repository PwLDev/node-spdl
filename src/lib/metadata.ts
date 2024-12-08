declare interface LyricsLine {
    startTimeMs: number,
    words: string,
    syllables: string[],
    endTimeMs: number
}

declare interface Lyrics {
    track: Track;
    lines: LyricsLine[];
    provider?: string;
    language?: string;
}

declare interface SpotifyUser {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        filter_enabled: boolean,
        filter_locked: boolean
    },
    external_urls: Record<string, string>,
    followers: {
        href: any,
        total: number
    },
    href: string,
    id: string,
    images: {
        height: number,
        url: string,
        width: number
    }[],
    policies: Record<string, any>,
    product: string,
    type: string,
    uri: string
}

declare interface StorageResolveResponse {
    cdnurl: string[];
    result: "CDN" | "STORAGE" | "RESTRICTED" | "UNRECOGNIZED";
    fileid: string;
}


declare interface Track {
    artists: string[];
    albumName: string;
    name: string;
    year: string;
    trackNumber: number;
    trackId: string;
    isPlayable: boolean;
    durationMs: number;
    imageUrl: string;
}

declare interface TrackFile {
    id: string;
    format: string;
}

declare interface TrackMetadata {
    contentId: string;
    name: string;
    files: TrackFile[];
    formats: string[];
    number: number;
    discNumber: number;
    explicit: boolean;
    hasLyrics: boolean;
    restriction?: [{ countriesAllowed: string }, ...any];
}


export {
    LyricsLine,
    Lyrics,
    SpotifyUser,
    StorageResolveResponse,
    Track,
    TrackFile,
    TrackMetadata
}