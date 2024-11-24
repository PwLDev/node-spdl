export const endpoints = {
    "FOLLOWED_ARTISTS_URL": "https://api.spotify.com/v1/me/following?type=artist",
    "SAVED_TRACKS_URL": "https://api.spotify.com/v1/me/tracks/",
    "TRACKS_URL": "https://api.spotify.com/v1/tracks/",
    "TRACK_STATS_URL": "https://api.spotify.com/v1/audio-features/",
    "TRACK_LYRICS_URL": "https://spclient.wg.spotify.com/color-lyrics/v2/track/",
    "TRACK_METADATA_URL": "https://spclient.wg.spotify.com/metadata/4/track/"
}

export const codecs = {
    "aac": "aac",
    "fdk_aac": "libfdk_aac",
    "m4a": "aac",
    "mp3": "libmp3lame",
    "ogg": "copy",
    "opus": "libopus",
    "vorbis": "copy",
}

export const formats = {
    "vorbis_low": "OGG_VORBIS_96",
    "vorbis_medium": "OGG_VORBIS_160",
    "vorbis_high": "OGG_VORBIS_320",
    "mp3_low": "MP3_96",
    "mp4_low": "MP4_128",
    "mp4_high_dual": "MP4_256_DUAL",
    "mp4_high": "MP4_128"
}

export const extensions = {
    "aac": "m4a",
    "fdk_aac": "m4a",
    "m4a": "m4a",
    "mp3": "mp3",
    "ogg": "ogg",
    "opus": "ogg",
    "vorbis": "ogg",
}