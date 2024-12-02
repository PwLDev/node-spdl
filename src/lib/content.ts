import { PassThrough } from "node:stream";
import { SpdlAuth } from "./auth.js";
import { Endpoints } from "./const.js";
import { PlayableEntity, TrackEntity } from "./entity.js";
import { SpotifyResolveError, SpotifyStreamError } from "./errors";
import { TrackMetadata } from "./metadata.js";
import { getTrackMetadata } from "./track.js";
import { SpdlAudioQuality } from "./types.js";
import { call } from "./request.js";
import { base62 } from "./util.js";

export class PlayableContentFeeder {
    auth: SpdlAuth;

    constructor(auth: SpdlAuth) {
        this.auth = auth;
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

        // return this.loadStream(file, track, preload);
    }

    private async resolveStorage(fileId: string, preload: boolean, auth: SpdlAuth) {
        const endpoint = preload ? Endpoints.STORAGE_RESOLVE_INTERACTIVE_PREFETCH : Endpoints.STORAGE_RESOLVE_INTERACTIVE;
        const contentId = Buffer.from(base62.decode(fileId)).toString("hex");
        const response = await call(`${endpoint}${contentId}`, auth);
        if (!response) {
            throw new SpotifyStreamError("The file could not be fetched from the storage.");
        }


    }
}