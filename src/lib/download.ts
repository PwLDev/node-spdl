import {
    PassThrough,
    Readable
} from "node:stream";

import { Spotify } from "./client.js";
import { Endpoints, Formats, AudioType, premiumFormats } from "./const.js";
import { createSpotifyEntity, EpisodeEntity, PlayableEntity, TrackEntity } from "./entity.js";
import { SpotifyAuthError, SpotifyError, SpotifyStreamError } from "./errors.js";
import { SpdlOptions, SpdlOptionsWithClient, TrackMetadata } from "./types.js";
import { validateURL } from "./url.js";
import { PlayableContentStreamer } from "./content.js";

/**
 * Downloads a track from Spotify by its URL.
 * 
 * @param {String} url URL of the track
 * @param {SpdlOptionsWithClient} options Options and client for downloading the track.
 */
export const spdl = (
    url: string,
    options: SpdlOptionsWithClient
): Readable => {
    const stream = new PassThrough({
        highWaterMark: options.highWaterMark || 1024 * 512
    });

    if (!options.client) {
        throw new SpotifyError("A Spotify client instance must be provided.");
    }

    if (validateURL(url)) {
        const content = createSpotifyEntity(url);
        if (!(content instanceof PlayableEntity)) {
            throw new SpotifyError("An unplayable Spotify entity was provided.");
        }

        downloadContentFromInfo(stream, content, options.client, options);
    } else {
        stream.destroy();
        throw new SpotifyAuthError("An invalid Spotify URL was provided.");
    }

    return stream;
}

export const downloadContentFromInfo = async (
    stream: PassThrough,
    content: PlayableEntity,
    client: Spotify,
    options: SpdlOptions
) => {
    if (!options.format) {
        // Default to a reasonable quality
        options.format = "OGG_VORBIS_160";
    }

    if (!options.encrypt) {
        options.encrypt = false;
    }

    if (!options.preload) {
        options.preload = false;
    }

    const feeder = new PlayableContentStreamer(client, stream, options.preload);
    const isPremium = await client.user.isPremium();

    if (content instanceof TrackEntity) {
        const metadata = await client.tracks.getMetadata(content.toHex());
        const formats = metadata.files.map((k) => k.format);

        if (!formats.includes(options.format)) {
            throw new SpotifyStreamError("Format provided is not supported by this content.");
        }

        if (
            premiumFormats.includes(options.format) 
            && !isPremium
        ) {
            throw new SpotifyAuthError("Selected format is only available for Spotify premium accounts.");
        }

        await feeder.loadContent(metadata, options, AudioType.AUDIO_TRACK);
    } else if (content instanceof EpisodeEntity) {
        const metadata = await client.podcasts.getMetadata(content.toHex());
        const formats = metadata.files.map((k) => k.format);
        console.log(metadata)

        if (!formats.includes(options.format)) {
            throw new SpotifyStreamError("Format provided is not supported by this content.");
        }

        if (
            premiumFormats.includes(options.format) 
            && !isPremium
        ) {
            throw new SpotifyAuthError("Selected format is only available for Spotify premium accounts.");
        }

        await feeder.loadContent(metadata, options, AudioType.AUDIO_EPISODE);
    }
}