import fs from "node:fs";
import { Spotify } from "./client.js";

// base types
export interface SpotifyObject {
	id: string;
	uri: string;
	externalUrl: string;
}

export interface ExternalIds {
	isrc?: string;
	ean?: string;
	upc?: string;
}

export interface Thumbnail {
	height: number | null;
	width: number | null;
	url: string;
}

export interface LyricsLine {
    startTimeMs: number;
    words: string;
    syllables: string[];
    endTimeMs: number;
}

export interface Lyrics {
    track: Track;
    lines: LyricsLine[];
    provider?: string;
    language?: string;
}

export interface ColorLyrics {
	lyrics: Lyrics;
	colors: {
		background: number;
		text: number;
		highlightText: number;
	}
	hasVocalRemoval: boolean;
}

export interface Album extends SpotifyObject {
	albumType: string
	name: string
	artists: Artist[]
	releaseDate: Date
	tracks?: Track[]
	totalTracks: number
	coverArtwork: Thumbnail[]
	label?: string
	externalIds: ExternalIds
	availableMarkets: string[]
}

export interface Artist extends SpotifyObject {
	name: string;
	avatar?: Thumbnail[];
	genres?: string[];
	followerCount?: number;
	albums?: Album[];
}

export interface User extends SpotifyObject {
	name?: string;
	followerCount?: number;
	avatar?: Thumbnail[];
	playlists?: Playlist[];
}

export interface SelfUser extends SpotifyObject {
    name: string | null
	id: string
	followerCount?: number
	country: string
	email: string
	uri: string
	plan: string
	allowExplicit: boolean
}

export interface StorageResolveResponse {
    cdnurl: string[];
    result: "CDN" | "STORAGE" | "RESTRICTED" | "UNRECOGNIZED";
    fileid: string;
}

export interface Podcast extends SpotifyObject {
	name: string;
	description?: string;
	htmlDescription?: string;
	explicit?: boolean;
	languages?: string[];
	mediaType: string;
	coverArtwork: Thumbnail[];
	publisher: string;
	episodes?: Episode[];
	totalEpisodes?: number;
}

export interface Episode extends SpotifyObject {
	podcast?: Podcast;
	description: string;
	htmlDescription?: string;
	durationMs: number;
	explicit?: boolean;
	name: string;
	isPlayable?: boolean;
	isPaywalled?: boolean;
	releaseDate?: Date;
	coverArtwork: Thumbnail[];
	language?: string;
	languages?: string[];
}

export interface EpisodeMetadata {
    files: TrackFile[];
	description: string;
	htmlDescription?: string;
	explicit?: boolean;
	name: string;
	language?: string;
    restriction?: [{ countriesAllowed: string }, ...any];
}

export interface Track extends SpotifyObject {
	album?: Album;
	artists?: Artist[];
	discNumber?: number;
	trackNumber: number;
	durationMs: number;
	explicit: boolean;
	isLocal: boolean;
	name: string;
	externalIds: ExternalIds;
	isrc?: string;
}

export interface TrackCredits {
    trackUri: string;
    trackTitle: string;
    roleCredits: {
        roleTitle: string;
        artists: {
            uri: string;
            name: string;
            imageUri: string;
            subroles: string[];
            weight: number;
        }[];
    }[];
    extendedCredits: any[];
    sourceNames: string[];
}

export interface TrackFile {
    id: string;
    format: string;
}

export interface TrackMetadata {
    files: TrackFile[];
	hasLyrics: boolean;
	languages: string[];
	release: Date;
	externalUrl: string;
    restriction?: [{ countriesAllowed: string }, ...any];
}

export interface PlaylistTrack extends Track {
	addedAt: Date
	addedBy: User
}

export interface Playlist extends SpotifyObject {
	collaborative?: boolean;
	onProfile?: boolean;
	description: string;
	coverArtwork: Thumbnail[];
	name: string;
	owner: User;
	tracks?: PlaylistTrack[]
	totalTracks?: number;
}

export type SpdlFormat = "OGG_VORBIS_92" | "OGG_VORBIS_160" | "OGG_VORBIS_320" | "MP3_96" | "MP4_128" | "MP4_128_DUAL" | "MP4_256" | "MP4_256_DUAL";

export interface SpdlOptions {
    format?: SpdlFormat;
	encrypt?: boolean;
    metadata?: boolean;
    lyrics?: boolean;
    preload?: boolean;
    highWaterMark?: number;
    ffmpegPath?: fs.PathLike;
}

export interface SpdlOptionsWithClient extends SpdlOptions {
    client: Spotify;
}

export type SpdlClientLike = SpdlClientOptions | Spotify;

export interface SpdlClientOptions {
    cookie?: string;
    accessToken?: string;
    forcePremium?: boolean;
}