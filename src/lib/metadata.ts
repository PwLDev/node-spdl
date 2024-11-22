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

export {
    Lyrics,
    Track
}