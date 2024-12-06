
import { PassThrough, pipeline } from "node:stream";
import undici from "undici";

import { SpdlAuth } from "./auth.js";
import { Endpoints } from "./const.js";
import { createStreamDecryptor } from "./crypto.js";
import { getTrackMetadata } from "./download.js";
import { PlayableEntity, TrackEntity } from "./entity.js";
import { SpotifyResolveError, SpotifyStreamError } from "./errors.js";
import { StorageResolveResponse, TrackFile, TrackMetadata } from "./metadata.js";
import { call } from "./request.js";
import { SpdlAudioQuality } from "./types.js";
import { base62 } from "./util.js";

export class CDNFeeder {
    auth: SpdlAuth;
    stream: PassThrough;

    constructor(
        auth: SpdlAuth,
        stream: PassThrough
    ) {
        this.auth = auth;
        this.stream = stream;
    }

    async loadTrack(
        track: TrackMetadata,
        file: TrackFile,
        response: StorageResolveResponse | string,
    ) {
        let url: string;
        if (typeof response !== "string") {
            url = response.cdnurl[0];
        } else {
            url = response;
        }

        if (file.format.startsWith("vorbis")) {
            const aesKey: Buffer = await this.auth.getPlayPlayKey(file.id);

            try {
                const { body } = await undici.request(url, { method: "GET" });

                const decryptStream = createStreamDecryptor(aesKey, file.format);

                return pipeline(
                    body,
                    decryptStream,
                    this.stream,
                    (error) => {
                        if (error) {
                            throw new SpotifyStreamError("Failed to decrypt raw file");
                        }
                    }
                );
            } catch (error) {
                this.stream.destroy(error as any);
            }
        }
    }
}

export class PlayableContentFeeder {
    auth: SpdlAuth;
    cdn: CDNFeeder;
    preload: boolean;
    stream: PassThrough;

    constructor(
        auth: SpdlAuth, 
        stream: PassThrough,
        preload: boolean = false
    ) {
        this.auth = auth;
        this.cdn = new CDNFeeder(auth, stream);
        this.preload = preload;
        this.stream = stream;
    }

    async load(
        entity: PlayableEntity,
        quality: SpdlAudioQuality
    ) {
        if (!(entity instanceof PlayableEntity)) {
            throw new SpotifyResolveError("entity", "Entity is not instance of PlayableEntity");
        }

        if (entity instanceof TrackEntity) {
            await this.loadTrack(entity, quality);
        }
    }

    async loadStream(
        file: TrackFile,
        content: TrackMetadata
    ) {
        if (!content) {
            throw new SpotifyStreamError("Content is unknown.");
        }

        const response = await this.resolveStorage(file.id);
        switch (response.result) {
            case "CDN":
                return await this.cdn.loadTrack(content, file, response);
        }
    }

    async loadTrack(
        trackLike: TrackEntity | TrackMetadata,
        quality: SpdlAudioQuality
    ) {
        let track: TrackMetadata;
        if (trackLike instanceof TrackEntity) {
            const original = await getTrackMetadata(trackLike.toBase62(), this.auth);
            track = original;
        } else {
            track = trackLike;
        }

        const file = track.files.find((f) => f.format.startsWith(quality));
        if (!file) {
            throw new SpotifyStreamError("The track is not available in the selected quality.");
        }

        return this.loadStream(file, track);
    }

    private async resolveStorage(fileId: string) {
        const endpoint = this.preload ? Endpoints.STORAGE_RESOLVE_INTERACTIVE_PREFETCH : Endpoints.STORAGE_RESOLVE_INTERACTIVE;
        const response: StorageResolveResponse = await call(`${endpoint}${fileId}?version=10000000&product=9&platform=39&alt=json`, this.auth);
        if (!response) {
            throw new SpotifyStreamError("The file could not be fetched from the storage.");
        }

        return response;
    }
}