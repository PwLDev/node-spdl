import { PassThrough, pipeline } from "node:stream";
import undici from "undici";

import { Spotify } from "./client.js";
import { Endpoints, AudioType } from "./const.js";
import { createPPStreamDecryptor } from "./decrypt.js";
import { SpotifyStreamError } from "./errors.js";
import { EpisodeMetadata, SpdlOptions, StorageResolveResponse, TrackFile, TrackMetadata } from "./types.js";

type PlayableMetadata = EpisodeMetadata | TrackMetadata;

export class CDNStreamer {
    client: Spotify;
    stream: PassThrough;

    constructor(
        client: Spotify,
        stream: PassThrough
    ) {
        this.client = client;
        this.stream = stream;
    }

    async loadContent(
        file: TrackFile,
        response: StorageResolveResponse | string,
        type: AudioType
    ) {
        let url: string;
        if (typeof response !== "string") {
            let filteredUrls = response.cdnurl.filter((url) => {
                const urlObj = new URL(url)
                return (
                    !urlObj.hostname.includes("audio4-gm-fb") &&
                    !urlObj.hostname.includes("audio-gm-fb")
                )
            });
            url = filteredUrls[Math.floor(Math.random() * (filteredUrls.length - 1))];
        } else {
            url = response;
        }

        if (file.format.startsWith("OGG")) {
            const key = await this.client.playplay.getKey(file.id, type);

            try {
                const { body } = await undici.request(url, { method: "GET" });

                if (!body) {
                    throw new SpotifyStreamError("Could not get stream from CDN.");
                }

                const decryptStream = createPPStreamDecryptor(key);
                return pipeline(
                    body,
                    decryptStream,
                    this.stream,
                    (error) => {
                        if (error) {
                            throw new SpotifyStreamError(error.message);
                        }
                    }
                );
            } catch (error) {
                this.stream.destroy(error as any);
            }
        } else if (file.format.startsWith("MP3")) {
            // file is unencrypted, download and pipe
            let request = await undici.request(url, { method: "GET" });
            if (request.statusCode != 200) {
                // fallback to static URL
                url = Endpoints.PREVIEW + file.id;
                request = await undici.request(url, { method: "GET" });
            }

            request.body.pipe(this.stream);
        } else {
            throw new SpotifyStreamError("Sorry, this format is not supported yet.");
        }
    }
}

export class PlayableContentStreamer {
    client: Spotify;
    cdn: CDNStreamer;
    preload: boolean;
    stream: PassThrough;

    constructor(
        client: Spotify, 
        stream: PassThrough,
        preload: boolean = false
    ) {
        this.client = client;
        this.cdn = new CDNStreamer(client, stream);
        this.preload = preload;
        this.stream = stream;
    }

    async loadStream(
        content: PlayableMetadata,
        file: TrackFile,
        type: AudioType
    ) {
        if (!content) {
            throw new SpotifyStreamError("Content is unknown.");
        }

        const response = await this.resolveStorage(file.id);
        switch (response.result) {
            case "CDN":
                return await this.cdn.loadContent(file, response, type);
        }
    }

    async loadContent(
        content: PlayableMetadata,
        options: SpdlOptions,
        type: AudioType
    ) {
        const file = content.files.find((f) => f.format.startsWith(options.format!));
        if (!file) {
            throw new SpotifyStreamError("The track is not available in the selected quality.");
        }

        return this.loadStream(content, file, type);
    }

    private async resolveStorage(fileId: string) {
        const endpoint = this.preload ? Endpoints.STORAGE_RESOLVE_INTERACTIVE_PREFETCH : Endpoints.STORAGE_RESOLVE_INTERACTIVE;
        const response: StorageResolveResponse = await this.client.request(
            `${endpoint}${fileId}?version=10000000&product=9&platform=39&alt=json`
        );
        if (!response) {
            throw new SpotifyStreamError("The file could not be fetched from the storage.");
        }

        return response;
    }
}