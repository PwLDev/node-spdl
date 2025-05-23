import { Spotify } from "./client.js";
import { Endpoints } from "./const.js";
import { SpotifyError, SpotifyAuthError } from "./errors.js";
import { Lyrics, LyricsLine } from "./metadata.js";
import { call } from "./request.js";
import { getTrackInfo } from "./download.js";
import { SpdlAuthLike } from "./types.js";
import { validateURL, getIdFromURL } from "./url.js";

/**
 * Extract synced lyrics from a song.
 * 
 * @param {string} url URL of the song.
 * @param {SpdlAuthLike} options Authenticate with the Spotify API
 */
export const lyrics = async (
    url: string,
    auth: Spotify
): Promise<Lyrics | null> => {
    if (validateURL(url)) {
        const trackId = getIdFromURL(url);
        if (!trackId) {
            throw new SpotifyError("The Spotify URL is malformed.");
        }

        const track = await getTrackInfo(trackId, auth);

        try {
            const request = await call(
                `${Endpoints.TRACK_LYRICS_URL}${track.trackId}?format=json&vocalRemoval=false`,
                auth
            );

            const data = request["lyrics"];
            let lines: LyricsLine[] = [];

            for (let line of data["lines"]) {
                lines.push({
                    startTimeMs: parseInt(line["startTimeMs"]),
                    words: line["words"],
                    syllables: line["syllables"],
                    endTimeMs: parseInt(line["endTimeMs"])
                });
            }

            return {
                track,
                lines,
                language: data["language"],
                provider: data["provider"] || "Spotify"
            }
        } catch (error) {
            throw new Error(error as string)
        }
    } else {
        throw new SpotifyAuthError("An invalid Spotify URL was provided.");
    }
}