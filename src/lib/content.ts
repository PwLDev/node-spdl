
import { PassThrough } from "node:stream";

import { SpdlAuth } from "./auth.js";
import { Endpoints } from "./const.js";
import { PlayableEntity, TrackEntity } from "./entity.js";
import { SpotifyResolveError, SpotifyStreamError } from "./errors";
import { TrackFile, TrackMetadata } from "./metadata.js";
import { getTrackMetadata } from "./track.js";
import { SpdlAudioQuality } from "./types.js";
import { Packet } from "./crypto.js";
import { getProto, StorageResolveResponse } from "./proto.js";
import { call, callRaw } from "./request.js";
import { base62 } from "./util.js";

export class AudioKeyManager {
    auth: SpdlAuth;
    timeout: number = 20;
    zero = Buffer.from([0x00, 0x00]);

    constructor(auth: SpdlAuth) {
        this.auth = auth;
    }

    getAudioKey(
        gid: string,
        fileId: string
    ) {
        let seq: number;
        let out = Buffer.alloc(0);
        out.write(fileId);
        out.write(gid);
        out.writeInt16BE(1);
        out.write(this.zero.toString("hex"));
    }
}

export class CDNFeeder {
    auth: SpdlAuth;

    constructor(auth: SpdlAuth) {
        this.auth = auth;
    }

    private getUrl(response: StorageResolveResponse): string {
        let selectedUrl = response.cdnurl[Math.floor(Math.random() * response.cdnurl.length)];
        do {
            selectedUrl = response.cdnurl[Math.floor(Math.random() * response.cdnurl.length)]
        } while (selectedUrl.includes("audio4-gm-fb") || selectedUrl.includes("audio-gm-fb"));
        return selectedUrl;
    }

    loadTrack(
        stream: PassThrough,
        track: TrackMetadata,
        file: TrackFile,
        response: StorageResolveResponse | string,
        preload: boolean
    ) {
        let url: string;
        if (typeof response !== "string") {
            url = this.getUrl(response);
        } else {
            url = response;
        }


    }
}

export class PlayableContentFeeder {
    auth: SpdlAuth;
    cdn: CDNFeeder

    constructor(auth: SpdlAuth) {
        this.auth = auth;
        this.cdn = new CDNFeeder(auth);
    }

    async load(
        entity: PlayableEntity,
        quality: SpdlAudioQuality,
        preload: boolean,
        auth: SpdlAuth,
        stream: PassThrough
    ) {
        if (!(entity instanceof PlayableEntity)) {
            throw new SpotifyResolveError("entity", "Entity is not instance of PlayableEntity");
        }

        if (entity instanceof TrackEntity) {

        }
    }

    async loadStream(
        file: TrackFile,
        content: TrackMetadata,
        preload: boolean,
        auth: SpdlAuth
    ) {
        if (!content) {
            throw new SpotifyStreamError("Content is unknown.");
        }

        const response = await this.resolveStorage(file.id, preload, auth);
        switch (response.result) {
            case "CDN":

        }
    }

    async loadTrack(
        trackLike: TrackEntity | TrackMetadata,
        quality: SpdlAudioQuality,
        preload: boolean,
        auth: SpdlAuth
    ) {
        let track: TrackMetadata;
        if (trackLike instanceof TrackEntity) {
            const original = await getTrackMetadata(trackLike.toBase62(), auth);
            track = original;
        } else {
            track = trackLike;
        }

        const file = track.files.find((f) => f.format == quality);
        if (!file) {
            throw new SpotifyStreamError("The track is not available in the selected quality.");
        }

        return this.loadStream(file, track, preload, auth);
    }

    private async resolveStorage(fileId: string, preload: boolean, auth: SpdlAuth) {
        const endpoint = preload ? Endpoints.STORAGE_RESOLVE_INTERACTIVE_PREFETCH : Endpoints.STORAGE_RESOLVE_INTERACTIVE;
        const contentId = Buffer.from(base62.decode(fileId)).toString("hex");
        const response = await callRaw(`${endpoint}${contentId}`, auth);
        if (!response) {
            throw new SpotifyStreamError("The file could not be fetched from the storage.");
        }

        const storageResolve: StorageResolveResponse = await getProto(
            Buffer.from(response), 
            "storage-resolve", 
            "StorageResolveResponse"
        );
        return storageResolve;
    }
}