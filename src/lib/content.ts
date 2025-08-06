import { PassThrough, pipeline, Readable, Writable } from "node:stream";
import { decryptStream } from "shifro";
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
        if (file.format.startsWith("OGG")) {
            let url: string;
            if (typeof response !== "string") {
                let filteredUrls = response.cdnurl.filter((url) => {
                    const urlObj = new URL(url)
                    // these hostnames are known to have bad certs
                    return (
                        !urlObj.hostname.includes("audio4-gm-fb") &&
                        !urlObj.hostname.includes("audio-gm-fb")
                    )
                });
                url = filteredUrls[Math.floor(Math.random() * (filteredUrls.length - 1))];
            } else {
                url = response;
            }

            const key = await this.client.playplay.getKey(file.fileId, type);

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
        } else if (file.format.startsWith("MP4")) {
            if (!this.client.widevine.device) {
                throw new SpotifyStreamError("You need to provide a Widevine device in order to decrypt AAC (MP4) files.");
            }

            if (typeof response != "object") {
                throw new SpotifyStreamError("Storage resolve provided an invalid result.");
            }
        
            const seektable = await this.client.widevine.getSeektable(file.fileId);
            const pssh = Buffer.from(seektable.pssh_widevine || seektable.pssh, "base64");

            const key = await this.client.widevine.getKey(pssh);
            const urls = response.cdnurl.filter((k) => k.includes("audio"));

            try {
                const stream = new Readable({ read() {} });

                const offset: number = seektable["offset"];
                const segments: number[][] = seektable["segments"];

                const offsets = [[0, offset - 1]];
                segments.map(([segment]) => {
                    offsets.push([offsets[offsets.length - 1][1] + 1, offsets[offsets.length - 1][1] + segment]);
                });

                const positions = offsets.map((o, i) =>
                    [urls[i % urls.length], ...o] as [string, number, number]) ;

                for (const position of positions) {
                    const [currentUrl, start, end] = position;

                    const chunk = await undici.request(currentUrl, {
                        method: "GET",
                        headers: {
                            range: `bytes=${start}-${end}`
                        }
                    });

                    const content = await chunk.body.bytes();
                    const segment = Buffer.from(new Uint8Array(content));

                    stream.push(segment);
                }

                return decryptStream(
                    Readable.toWeb(stream) as ReadableStream,
                    Writable.toWeb(this.stream),
                    { key }
                );
            } catch (error) {
                this.stream.destroy(error as any);
            }
        } else if (file.format.startsWith("MP3")) {
            let url: string;
            if (typeof response !== "string") {
                url = response.cdnurl[Math.floor(Math.random() * (response.cdnurl.length - 1))];
            } else {
                url = response;
            }

            // file is unencrypted, download and pipe
            let request = await undici.request(url, { method: "GET" });
            if (request.statusCode != 200) {
                // fallback to static URL
                url = Endpoints.PREVIEW + file.fileId;
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

        const response = await this.resolveStorage(file.fileId);
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
        const file = content.files.find((f) => f.format.startsWith(options.format!)) ||
            content.preview?.find((f) => f.format.startsWith(options.format!));
            
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