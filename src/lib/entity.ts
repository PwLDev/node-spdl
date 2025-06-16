import { SpotifyResolveError } from "./errors.js";
import { base62 } from "./util.js";

export abstract class SpotifyEntity {
    public id: string;
    public type: string;

    constructor(url: string) {
        const parsed = SpotifyEntity.parseUrl(url);
        if (!parsed) {
            throw new SpotifyResolveError("URL", `Could not resolve ${url}`);
        }

        this.id = parsed.id;
        this.type = parsed.type;
    }

    static parseUrl(url: string): { id: string, type: string } | null
    {
        const regex = /(?:spotify:(?<type1>[a-z]+):(?<id1>[a-zA-Z0-9]+)|open.spotify.com\/(?<type2>[a-z]+)\/(?<id2>[a-zA-Z0-9]+))/;

        const match1 = url.match(regex);
        const match2 = url.match(regex);
        
        if (match1) {
            const type = match1?.groups?.type1 || match1?.groups?.type2;
            const id = match1?.groups?.id1 || match1?.groups?.id2;
            return { id: id!, type: type! };
        }
        
        if (match2) {
            const type = match2?.groups?.type1 || match2?.groups?.type2;
            const id = match2?.groups?.id1 || match2?.groups?.id2;
            return { id: id!, type: type! };
        }

        return null
    }

    abstract isPlayable(): boolean;
}

export abstract class PlayableEntity extends SpotifyEntity {
    type: "track" | "episode" | "unknown";

    constructor(url: string) {
        super(url);
        this.type = this.detectType(url);
    }

    private detectType(url: string): "track" | "episode" | "unknown" {
        if (url.includes(("track"))) {
            return "track";
        } else if (url.includes(("episode"))) {
            return "episode";
        }
        return "unknown";
    }

    isPlayable(): boolean {
        return this.type !== "unknown";
    }
}

export class EpisodeEntity extends PlayableEntity {
    constructor(url: string) {
        super(url);
        if (this.type !== "episode") {
            throw new SpotifyResolveError("URL", `Invalid track URL: ${url}`);
        }
    }

    toHex(): string {
        const buffer = Buffer.from(base62.decode(this.id));
        return buffer.toString("hex");
    }

    isPlayable(): boolean {
        return true;
    }
}

export class PlaylistEntity extends SpotifyEntity {
    constructor(url: string) {
        super(url);
        if (this.type !== "playlist") {
            throw new SpotifyResolveError("URL", `Invalid playlist URL: ${url}`);
        }
    }

    isPlayable(): boolean {
        return false;
    }
}

export class TrackEntity extends PlayableEntity {
    constructor(url: string) {
        super(url);
        if (this.type !== "track") {
            throw new SpotifyResolveError("URL", `Invalid track URL: ${url}`);
        }
    }

    toHex(): string {
        const buffer = Buffer.from(base62.decode(this.id));
        return buffer.toString("hex");
    }

    isPlayable(): boolean {
        return true;
    }
}

export const createSpotifyEntity = (url: string): SpotifyEntity => {
    const parsed = SpotifyEntity.parseUrl(url);
    if (!parsed) {
        throw new SpotifyResolveError("URL", `Could not resolve: ${url}`);
    }

    switch (parsed.type) {
        case "episode":
            return new EpisodeEntity(url);
        case "playlist":
            return new PlaylistEntity(url);
        case "track":
            return new TrackEntity(url);
        default:
            throw new SpotifyResolveError("entity", `Unsupported entity type: ${parsed.type}`);
    }
}