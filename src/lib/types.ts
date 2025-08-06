import fs from "node:fs";
import { Spotify } from "./client.js";

// spdl Types
export type SpdlFormat = "OGG_VORBIS_96" | "OGG_VORBIS_160" | "OGG_VORBIS_320" | "MP3_96" | "MP4_128" | "MP4_128_DUAL" | "MP4_256" | "MP4_256_DUAL";
export type SpdlContent = "artist" | "playlist" | "track" | "show" | "episode";

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
    client: Spotify | SpdlClientOptions;
}

export type SpdlClientLike = SpdlClientOptions | Spotify;

export interface SpdlClientOptions {
    cookie?: string;
    accessToken?: string;
	clientToken?: string;
    forcePremium?: boolean;
	unplayplay?: UnPlayPlay;
	device?: Buffer | WidevineDevice;
}

export interface SpdlFFmpegOptions {
    path?: string;
    verbose?: boolean;
}

export interface SpdlSearchOptions {
    type?: SpdlContent[];
	market?: string,
    limit?: number;
    offset?: number;
}

export interface UnPlayPlay {
	token: Uint8Array | Buffer;
	deobfuscateKey: (fileId: Buffer, dest: Buffer) => any;
}

export interface WidevineDevice {
    type: string;
    level: number;
    clientId: Buffer;
    privateKey: Buffer;
}

// Spotify API types
export interface SpotifyObject {
	id: string;
	uri: string;
	externalUrl: string;
}

export interface MetadataReference {
	gid: string;
	name?: string;
}

export interface Thumbnail {
	height: number | null;
	width: number | null;
	url: string;
}

export interface Copyright {
	text: string;
	type: string;
}

export interface DateObject {
	year: number;
	month: number;
	day: number;
}

export interface Restriction {
	countriesForbidden?: string;
	catalogue?: string[];
}

export interface Album extends SpotifyObject {
	name: string;
    releaseDate: Date;
	images: Thumbnail[];
	availableMarkets: string[];
	artists: Artist[];
	tracks: Track[];
	label: string;
	genres: string[];
	copyright: string[];
	popularity: number;
}

export interface AlbumMetadata {
	gid: string;
	name: string;
    artist: MetadataReference[];
    type: string,
    label: string,
	date: DateObject;
    popularity: number;
    disc: {
		number: number;
		track: MetadataReference[]
	}[];
	copyright: Copyright[];
}

export interface Artist extends SpotifyObject {
	name: string;
	images: Thumbnail[];
	popularity: number;
	followers: number;
	genres: string[];
}

export interface ColorLyrics {
	lyrics: {
		syncType: string;
		lines: Lyrics[];
	};
	colors: {
		background: number;
		text: string;
		highlightText: number;
	}
}

export interface Episode extends SpotifyObject {
	name: string;
	description: string;
	previewUrl: string;
	durationMs: number;
	images: Thumbnail[];
	isPlayable: boolean;
	languages: string[];
	releaseDate: Date;
	explicit: boolean;
	restrictions: Record<string, string>;
	podcast: Podcast;
}

export interface EpisodeMetadata {
	gid: string;
	name: string;
    files: TrackFile[];
    preview: TrackFile[];
	description: string;
	explicit: boolean;
	language: string;
	externalUrl?: string;
    restriction?: Restriction[];
}

export interface Lyrics {
	startTimeMs: string;
	endTimeMs: string;
	words: string;
	syllables: string[];
}

export interface Playlist extends SpotifyObject {
	name: string;
	description: string;
	tracks: Track[];
	collaborative: boolean;
	followers: number;
	images: Thumbnail[];
	owner: User;
	public: boolean;
	snapshotId?: string;
}

export interface PlaylistTrack extends Track {
	addedAt: Date;
	addedBy: User;
}

export interface Podcast extends SpotifyObject {
	episodes: Episode[];
	name: string;
	publisher: string;
	description: string;
	copyrights: Copyright[];
	availableMarkets: string[];
	languages: string[];
	explicit: boolean;
}

export interface StorageResolveResponse {
    cdnurl: string[];
    result: "CDN" | "STORAGE" | "RESTRICTED" | "UNRECOGNIZED";
    fileid: string;
}

export interface Track extends SpotifyObject {
	name: string;
	availableMarkets: string[];
	artists: Artist[];
	album: Album;
	popularity: number;
	previewUrl: string;
	trackNumber: string;
	discNumber: string;
	durationMs: number;
	isLocal: boolean;
	explicit: boolean;
}

export interface TrackFile {
    fileId: string;
    format: string;
}

export interface TrackMetadata {
	gid: string;
	name: string;
	album: Album;
    files: TrackFile[];
    preview: TrackFile[];
	hasLyrics: boolean;
	languages: string[];
    restriction?: Restriction[];
}

export interface User extends SpotifyObject {
	displayName: string;
}

export interface SelfUser extends User {
    country: string;
    email: string;
    product: "free" | "premium" | "open";
    followers: number;
    images: Thumbnail[];
}