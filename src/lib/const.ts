export const Endpoints = {
    "HOME_PAGE_URL": "https://open.spotify.com/",
    "FOLLOWED_ARTISTS_URL": "https://api.spotify.com/v1/me/following?type=artist",
    "SAVED_TRACKS_URL": "https://api.spotify.com/v1/me/tracks/",
    "STORAGE_RESOLVE_INTERACTIVE": "https://spclient.wg.spotify.com/storage-resolve/files/audio/interactive/",
    "STORAGE_RESOLVE_INTERACTIVE_PREFETCH": "https://spclient.wg.spotify.com/storage-resolve/files/audio/interactive_prefetch/",
    "TRACKS_URL": "https://api.spotify.com/v1/tracks/",
    "TRACK_STATS_URL": "https://api.spotify.com/v1/audio-features/",
    "TRACK_LYRICS_URL": "https://spclient.wg.spotify.com/color-lyrics/v2/track/",
    "TRACK_METADATA_URL": "https://spclient.wg.spotify.com/metadata/4/track/"
}

export const Codecs: Record<string, string> = {
    "aac": "aac",
    "fdk_aac": "libfdk_aac",
    "m4a": "aac",
    "mp3": "libmp3lame",
    "ogg": "copy",
    "opus": "libopus",
    "vorbis": "copy",
}

export const Formats: Record<string, string> = {
    "OGG_VORBIS_96": "vorbis_low",
    "OGG_VORBIS_160": "vorbis_medium",
    "OGG_VORBIS_320": "vorbis_high",
    "AAC_24": "aac_medium",
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