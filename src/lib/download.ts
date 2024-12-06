import {
    PassThrough,
    Readable
} from "node:stream";

import { SpdlAuth } from "./auth.js";
import { Endpoints, Formats } from "./const.js";
import { createSpotifyEntity, PlayableEntity, PlaylistEntity, TrackEntity } from "./entity.js";
import { SpotifyAuthError, SpotifyError, SpotifyResolveError, SpotifyStreamError } from "./errors.js";
import { Track, TrackFile, TrackMetadata } from "./metadata.js";
import { call } from "./request.js";
import { SpdlAuthLike, SpdlOptions } from "./types.js";
import { getIdFromURL, validateURL } from "./url.js";
import { PlayableContentFeeder } from "./content.js";

export const getTrackInfo = async (
    trackId: string,
    auth: SpdlAuth
): Promise<Track> => {
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

    for (let file of meta["file"]) {
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
    const stream = new PassThrough({
        highWaterMark: options.highWaterMark || 1024 * 512
    });

    if (validateURL(url)) {
        const content = createSpotifyEntity(url);
        if (!(content instanceof PlayableEntity)) {
            throw new SpotifyError("An unplayable Spotify entity was provided.");
        }

        downloadContentFromInfo(stream, content, options.auth, options);
    } else {
        stream.destroy();
        throw new SpotifyAuthError("An invalid Spotify URL was provided.");
    }

    return stream;
}

export const downloadContentFromInfo = async (
    stream: PassThrough,
    content: PlayableEntity,
    auth: SpdlAuth,
    options: SpdlOptions
) => {
    if (!options.format) {
        // Default to a reasonable quality
        options.format = "vorbis_medium";
    }

    if (!options.preload) {
        options.preload = false;
    }

    let metadata!: TrackMetadata
    if (content instanceof TrackEntity) {
        metadata = await getTrackMetadata(content.toBase62(), auth);
    }

    if (!metadata.formats.includes(options.format)) {
        throw new SpotifyStreamError("Format provided is not supported by this content.");
    }

    const feeder = new PlayableContentFeeder(auth, stream, options.preload);
    await feeder.load(content, options.format);
}