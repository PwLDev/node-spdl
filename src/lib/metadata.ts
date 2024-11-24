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

declare interface TrackFile {
    id: string;
    rawFormat: string;
}

declare interface TrackMetadata {
    contentId: string;
    name: string;
    files: TrackFile[];
    rawFormats: string[];
}

export {
    LyricsLine,
    Lyrics,
    Track,
    TrackFile,
    TrackMetadata
}