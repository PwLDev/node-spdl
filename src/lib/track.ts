import stream from "node:stream";

import * as encryption from "./encryption";

import { getAuth, SpdlAuth } from "./auth";
import { Endpoints } from "./const";
import { SpotifyApiError, SpotifyAuthError, SpotifyError } from "./errors";
import { invoke } from "./request";
import { SpdlAuthLike, SpdlOptions, Track } from "./types";
import { getIdFromURL, validateURL } from "./url";

export const getTrackInfo = async (
    trackId: string,
    options: SpdlAuthLike
): Promise<Track> => {
    const auth = getAuth(options);
    const info = await invoke(`${Endpoints.TRACKS_URL}${trackId}`, auth);

    if (!info["tracks"]) {
        throw new SpotifyApiError(404, "Track ID not found.");
    }

    try {
        let track = info["tracks"][0];

        let artists: string[] = [];
        for (let artist of track["artists"]) {
            artists.push(artist);
        }

        let albumName = track["album"]["name"];
        let name = track["name"];
        let year = track["album"]["release_year"].split("-")[0];
        let trackNumber: number = track["track_number"];
        let trackId: string = track["id"];
        let isPlayable: boolean = track["is_playable"];
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
        throw new SpotifyError(error as string);
    }
}

export const getTrackDuration = async (
    trackId: string,
    options: SpdlAuthLike
) => {
    const auth = getAuth(options);
}

export const downloadTrack = (
    trackId: string,
    options: SpdlOptions = {}
) => {
    let auth: SpdlAuth;
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

    const contentId = encryption.fromBase62(trackId);
}

/**
 * Downloads a track from Spotify by it's URL.
 * @param {String} url URL of the track
 * @param {SpdlOptions} options Options and auth for downloading the track.
 */
export const downloadTrackFromUrl = (
    url: string,
    options: SpdlOptions
) => {
    if (validateURL(url)) {
        const trackId = getIdFromURL(url);
        if (!trackId) {
            throw new SpotifyError("The Spotify URL is malformed.");
        }

        return downloadTrack(trackId, options);
    } else {
        throw new SpotifyAuthError("An invalid Spotify URL was provided.");
    }
}