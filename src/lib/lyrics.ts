import { getAuth, SpdlAuth } from "./auth.js";
import { Endpoints } from "./const.js";
import { SpotifyError, SpotifyAuthError } from "./errors.js";
import { Lyrics } from "./metadata.js";
import { invoke } from "./request.js";
import { getTrackInfo } from "./track.js";
import { SpdlAuthLike } from "./types.js";
import { validateURL, getIdFromURL } from "./url.js";

/**
 * Extract synced lyrics from a song.
 * 
 * @param {string} url URL of the song.
 * @param {SpdlAuthLike} options Authenticate with the Spotify API
 */
export const lyrics = (
    url: string,
    options: SpdlAuthLike
): Lyrics | null => {
    let auth: SpdlAuth = getAuth(options);

    if (validateURL(url)) {
        const trackId = getIdFromURL(url);
        if (!trackId) {
            throw new SpotifyError("The Spotify URL is malformed.");
        }

        let lyrics: Lyrics | null = null;

        getTrackInfo(trackId, auth)
        .then(async (track) => {
            try {
                const request = await invoke(
                    `${Endpoints.TRACK_LYRICS_URL}${track.trackId}?format=json&vocalRemoval=false`,
                    auth
                );

                const data = request["lyrics"];
                lyrics = {
                    track,
                    lines: data["lines"],
                    language: data["language"],
                    provider: data["provider"] || "Spotify"
                }
            } catch (error) {
                lyrics = null;
            }
        });

        return lyrics;
    } else {
        throw new SpotifyAuthError("An invalid Spotify URL was provided.");
    }
}