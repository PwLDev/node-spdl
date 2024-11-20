import {
    PassThrough,
    Readable
} from "node:stream";

import { getAuth, SpdlAuth } from "./auth.js";
import { Endpoints } from "./const.js";
import { base62 } from "./crypto.js";
import { SpotifyApiError, SpotifyAuthError, SpotifyError } from "./errors.js";
import { invoke } from "./request.js";
import { SpdlAuthLike, SpdlOptions, Track } from "./types.js";
import { getIdFromURL, validateURL } from "./url.js";

export const getTrackInfo = async (
    trackId: string,
    options: SpdlAuthLike
): Promise<Track> => {
    const auth = getAuth(options);
    const track = await invoke(`${Endpoints.TRACKS_URL}${trackId}`, auth);

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

/**
 * Downloads a track from Spotify by it's URL.
 * @param {String} url URL of the track
 * @param {SpdlOptions} options Options and auth for downloading the track.
 */
export const spdl = (
    url: string,
    options: SpdlOptions
) => {
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

        });
    } else {
        throw new SpotifyAuthError("An invalid Spotify URL was provided.");
    }
}

export const downloadTrackFromInfo = (
    track: Track,
    options: SpdlOptions = {}
) => {
    let auth: SpdlAuth
    let contentId = Buffer.from(base62.decode(track.trackId)).toString("hex");
}