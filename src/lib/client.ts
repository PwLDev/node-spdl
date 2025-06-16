import { PassThrough, Readable } from "node:stream";
import undici from "undici";

import { ArtistClient } from "./artist.js";
import { Endpoints, AudioType, premiumFormats } from "./const.js";
import { PlayableContentStreamer } from "./content.js";
import { createSpotifyEntity, EpisodeEntity, PlayableEntity, TrackEntity } from "./entity.js";
import { SpotifyAuthError, SpotifyError, SpotifyStreamError } from "./errors.js";
import { PlaylistClient } from "./playlist.js";
import { PlayPlayClient } from "./playplay.js";
import { PodcastClient } from "./podcast.js";
import { getSpotifyTotp } from "./totp.js";
import { TrackClient } from "./track.js";
import { SpdlClientOptions, SpdlOptions } from "./types.js";
import { validateURL } from "./url.js";
import { UserClient } from "./user.js";

/**
 * The `Spotify` class initializes a Spotify API client.
 * 
 * @param {SpdlClientOptions} options Authenticate with your Spotify account.
 * @see https://github.com/PwLDev/node-spdl?tab=readme-ov-file#how-to-get-a-cookie How to extract a sp_dc cookie.
 */
export class Spotify {
    accessToken: string = "";
    expirationTime: string = "";
    cookie: string = "";
    expiration: number = 0;
    readonly options: SpdlClientOptions;

    public playplay = new PlayPlayClient(this);
    public tracks = new TrackClient(this);

    public artists = new ArtistClient(this);
    public playlists = new PlaylistClient(this);
    public podcasts = new PodcastClient(this);
    public user = new UserClient(this);

    constructor(options: SpdlClientOptions) {
        if (options.accessToken) {
            this.accessToken = options.accessToken;
        } else {
            if (options.cookie) {
                this.cookie = options.cookie;
            } else {
                throw new SpotifyAuthError(`A valid "sp_dc" cookie or access token must be provided.`);
            }
        }

        if (!options.forcePremium) {
            options.forcePremium = false;
        }

        this.options = options;
    }

    /**
     * Initialize a `Spotify` instance with logged in credentials.
     * A valid sp_dc cookie or non-anonymous (logged in) access token must be provided.
     * 
     * @param {SpdlClientOptions} options Authenticate with your Spotify account.
     * @see https://github.com/PwLDev/node-spdl?tab=readme-ov-file#how-to-get-a-cookie How to extract a sp_dc cookie.
     * @example
     * ```js
     * const client = await Spotify.create({
     *   cookie: "sp_dc=some-cookie-here"
     * });
     * ```
     */
    static async create(options: SpdlClientOptions) {
        const instance = new this(options);
        await instance.refresh();
        return instance;
    }

    getHeaders(): Record<string, string> {
        return {
            "Authorization": `Bearer ${this.accessToken}`,
            "Accept": "application/json",
            "Accept-Language": "*",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "Origin": "open.spotify.com",
            "Referer": "open.spotify.com",
            "app-platform": "WebPlayer"
        }
    }

    getProtoHeaders(): Record<string, string> {
        return {
            "Authorization": `Bearer ${this.accessToken}`,
            "Accept": "*",
            "Accept-Language": "*",
            "Connection": "keep-alive",
            "Content-Type": "application/json"
        }
    }

    /**
     * Refresh the token if expiration time expired.
     */
    public async refresh(): Promise<void> {
        if (this.expiration > Date.now()) return;

        const [otp, timestamp] = await getSpotifyTotp();
        const clientTime = Date.now();

        const headers = {};
        if (this.cookie.length) {
            Object.assign(headers, { "Cookie": this.cookie });
        }

        const tokenRequest = await undici.request(
            Endpoints.TOKEN,
            {
                headers,
                method: "GET",
                query: {
                    reason: "transport",
                    productType: "web-player",
                    totp: otp.toString(),
                    totpServer: otp.toString(),
                    totpVer: "5",
                    sTime: timestamp.toString(),
                    cTime: clientTime.toString()
                }
            }
        );

        const response: any = await tokenRequest.body.json();
        const isAnonymous = response["isAnonymous"];

        if (isAnonymous) {
            throw new SpotifyAuthError("You must provide a valid sp_dc cookie from a Spotify logged in browser.\nRefer to https://github.com/PwLDev/node-spdl#readme to see how to extract a cookie.");
        }

        this.accessToken = response["accessToken"];

        const expirationTime = response["accessTokenExpirationTimestampMs"];
        if (expirationTime) {
            this.expiration = expirationTime;
        }
    }

    public async request(endpoint: string): Promise<any> {
        if (!this.accessToken.length) {
            throw new SpotifyAuthError("This client is not authenticated yet.");
        }

        const request = await undici.request(endpoint, {
            headers: this.getHeaders(),
            method: "GET"
        });

        return await request.body.json();
    }

    /**
     * Downloads a track from Spotify by its URL.
     * @param {String} url URL of the track
     * @param {SpdlOptions} options Options for downloading the track.
     */
    public download(
        url: string,
        options: SpdlOptions
    ): Readable {
        const stream = new PassThrough({
            highWaterMark: options.highWaterMark || 1024 * 512
        });

        if (validateURL(url)) {
            const content = createSpotifyEntity(url);
            if (!(content instanceof PlayableEntity)) {
                throw new SpotifyError("An unplayable Spotify entity was provided.");
            }

            this.downloadFromEntity(stream, content, options);
        } else {
            stream.destroy();
            throw new SpotifyAuthError("An invalid Spotify URL was provided.");
        }

        return stream;
    }

    protected async downloadFromEntity(
        stream: PassThrough,
        content: PlayableEntity,
        options: SpdlOptions
    ) {
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

        const feeder = new PlayableContentStreamer(this, stream, options.preload);
        const isPremium = await this.user.isPremium();

        if (content instanceof TrackEntity) {
            const metadata = await this.tracks.getMetadata(content.toHex());
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
            const metadata = await this.podcasts.getMetadata(content.toHex());
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
}