import {
    PassThrough,
    Readable
} from "node:stream";

import { getAuth, SpdlAuth } from "./auth.js";
import { Endpoints, Formats } from "./const.js";
import { base62 } from "./util.js";
import { SpotifyAuthError, SpotifyError, SpotifyResolveError } from "./errors.js";
import { Track, TrackFile, TrackMetadata } from "./metadata.js";
import { call } from "./request.js";
import { SpdlAuthLike, SpdlOptions } from "./types.js";
import { getIdFromURL, validateURL } from "./url.js";

export const getTrackInfo = async (
    trackId: string,
    options: SpdlAuthLike
): Promise<Track> => {
    const auth = getAuth(options);
    const track = await call(`${Endpoints.TRACKS_URL}${trackId}`, auth);

    try {
        let artists: string[] = [];
        for (let artist of track["artists"]) {
            artists.push(artist);
        }

        let albumName = track["album"]["name"];
        let name = track["name"];
        let year = track["album"]["release_date"].split("-")[0];
        let trackNumber: number = track["track_number"];
        let trackId: string = track["id"];
        let isPlayable: boolean = track["is_playable"] || true;
        let durationMs: number = track["duration_ms"];

        let image = track["album"]["images"][0];
        // try to find better quality images
        for (let i of track["album"]["images"]) {
            if (i["width"] > image["width"]) {
                image = i;
            }
        }

        const response: Track = {
            artists,
            albumName,
            name,
            year,
            trackNumber,
            trackId,
            isPlayable,
            durationMs,
            imageUrl: image["url"]
        };
        return response;
    } catch (error) {
        throw new Error(error as string);
    }
}

export const getTrackMetadata = async (
    contentId: string,
    auth: SpdlAuth
): Promise<TrackMetadata> => {
    const meta = await call(`${Endpoints.TRACK_METADATA_URL}${contentId}`, auth);

    let files: TrackFile[] = [];
    let rawFormats: string[] = [];

    for (let file of meta["files"]) {
        files.push({
            id: file["file_id"],
            format: Formats[file["format"]]
        });
        rawFormats.push(Formats[file["format"]]);
    }

    return {
        contentId: meta["gid"],
        name: meta["name"],
        files,
        formats: rawFormats,
        number: meta["number"],
        discNumber: meta["disc_number"],
        explicit: meta["explicit"] || false,
        hasLyrics: meta["has_lyrics"] || false,
        restriction: meta["restriction"] || undefined
    }
}

/**
 * Downloads content from Spotify by it's URL.
 * 
 * It can be either a song or video.
 * 
 * @param {String} url URL of the track
 * @param {SpdlOptions} options Options and auth for downloading the track.
 */
export const spdl = (
    url: string,
    options: SpdlOptions
): Readable => {
    let auth: SpdlAuth;
    const stream = new PassThrough({
        highWaterMark: options.highWaterMark || 1024 * 512
    });

    if (options.auth) {
        auth = options.auth;
    } else {
        if (options.accessToken) {
            auth = new SpdlAuth({ accessToken: options.accessToken });
        } else {
            if (options.cookie) {
                auth = new SpdlAuth({ cookie: options.cookie });
            } else {
                throw new SpotifyAuthError(`A valid "sp_dc" cookie, non-anonymous access token or SpdlAuth must be provided.`);
            }
        }
    }

    if (validateURL(url)) {
        const trackId = getIdFromURL(url);
        if (!trackId) {
            throw new SpotifyError("The Spotify URL is malformed.");
        }

        getTrackInfo(trackId, auth).then((track) => {
            downloadTrackFromInfo(stream, track, auth, options);
        }, stream.emit.bind(stream, "error"));
    } else {
        throw new SpotifyAuthError("An invalid Spotify URL was provided.");
    }

    return stream;
}

export const downloadTrackFromInfo = async (
    stream: PassThrough,
    track: Track,
    auth: SpdlAuth,
    options: SpdlOptions = {}
) => {
    if (!options.format) {
        // Default to a reasonable quality
        options.format = "vorbis_medium";
    }

    let contentId = Buffer.from(base62.decode(track.trackId)).toString("hex");
    const info = await getTrackMetadata(contentId, auth);

    const rawFormat = Formats[options.format];
    if (!rawFormat) {
        throw new SpotifyResolveError("format", "Invalid format provided.");
    }

    if (!info.formats.includes(rawFormat)) {
        throw new SpotifyError(`Format not available for track`)
    }
}