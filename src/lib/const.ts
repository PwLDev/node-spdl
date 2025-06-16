import { SpdlFormat } from "./types";

export const Endpoints = {
    ARTISTS: "https://api.spotify.com/v1/artists/",
    COLOR_LYRICS: "https://spclient.wg.spotify.com/color-lyrics/v2/track/",
    HOME_PAGE_URL: "https://open.spotify.com/",
    EPISODES: "https://api.spotify.com/v1/episodes/",
    EPISODE_METADATA: "https://spclient.wg.spotify.com/metadata/4/episode/",
    FOLLOWED_ARTISTS_URL: "https://api.spotify.com/v1/me/following?type=artist",
    ME: "https://api.spotify.com/v1/me",
    PLAYLISTS: "https://api.spotify.com/v1/playlists/",
    PLAYPLAY: "https://spclient.wg.spotify.com/playplay/v1/key/",
    PREVIEW: "https://p.scdn.co/mp3-preview/",
    QUERY: "https://api-partner.spotify.com/pathfinder/v2/query",
    SAVED_TRACKS_URL: "https://api.spotify.com/v1/me/tracks/",
    SERVER_TIME: "https://open.spotify.com/api/server-time/",
    SHOWS: "https://api.spotify.com/v1/shows/",
    STORAGE_RESOLVE_INTERACTIVE: "https://spclient.wg.spotify.com/storage-resolve/files/audio/interactive/",
    STORAGE_RESOLVE_INTERACTIVE_PREFETCH: "https://spclient.wg.spotify.com/storage-resolve/files/audio/interactive_prefetch/",
    TOKEN: "https://open.spotify.com/api/token/",
    TRACKS_URL: "https://api.spotify.com/v1/tracks/",
    TRACK_STATS: "https://api.spotify.com/v1/audio-features/",
    TRACK_METADATA: "https://spclient.wg.spotify.com/metadata/4/track/"
}

export const Codecs = {
    "aac": "aac",
    "fdk_aac": "libfdk_aac",
    "m4a": "aac",
    "mp3": "libmp3lame",
    "ogg": "copy",
    "opus": "libopus",
    "vorbis": "copy",
}

export const Formats = {
    "OGG_VORBIS_96": "vorbis_low",
    "OGG_VORBIS_160": "vorbis_medium",
    "OGG_VORBIS_320": "vorbis_high",
    "AAC_24": "aac_low",
    "MP3_96": "mp3_low",
    "MP4_128": "mp4_low",
    "MP4_128_DUAL": "mp4_low_dual",
    "MP4_256": "mp4_high",
    "MP4_256_DUAL": "mp4_high_dual",
}

export const Extensions: Record<string, string> = {
    "aac": "m4a",
    "fdk_aac": "m4a",
    "m4a": "m4a",
    "mp3": "mp3",
    "ogg": "ogg",
    "opus": "ogg",
    "vorbis": "ogg",
}

export enum AudioType {
    UNKNOWN_CONTENT_TYPE = 0,
	AUDIO_TRACK = 1,
	AUDIO_EPISODE = 2,
	AUDIO_ADD = 3
}

export const premiumFormats: SpdlFormat[] = ["OGG_VORBIS_320", "MP4_256", "MP4_256_DUAL"];
