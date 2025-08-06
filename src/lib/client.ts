import os from "node:os";
import { PassThrough, Readable } from "node:stream";
import undici from "undici";
import unplayplay from "@spdl/unplayplay";

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
import { SpdlClientOptions, SpdlOptions, SpdlSearchOptions } from "./types.js";
import { validateURL } from "./url.js";
import { UserClient } from "./user.js";
import { WidevineClient } from "./widevine.js";

/**
 * The `Spotify` class initializes a Spotify API client.
 * 
 * @param {SpdlClientOptions} options Authenticate with your Spotify account.
 * @see [How to extract an sp_dc cookie](https://github.com/PwLDev/node-spdl?tab=readme-ov-file#how-to-get-a-cookie-)
 */
export class Spotify {
    accessToken: string = "";
    clientId: string = "";
    clientToken: string = "";
    cookie: string = "";
    accessExpiration: number = 0;
    clientExpiration: number = 0;
    readonly options: SpdlClientOptions;

    public artists: ArtistClient;
    public playlists: PlaylistClient;
    public playplay: PlayPlayClient;
    public podcasts: PodcastClient;
    public tracks: TrackClient;
    public user: UserClient;
    public widevine: WidevineClient;

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

        if (options.clientToken) {
            this.clientToken = options.clientToken;
        }

        if (!options.forcePremium) {
            options.forcePremium = false;
        }

        if (!options.unplayplay) {
            options.unplayplay = unplayplay;
        }

        this.options = options;

        this.artists = new ArtistClient(this);
        this.playlists = new PlaylistClient(this);
        this.playplay = new PlayPlayClient(this);
        this.podcasts = new PodcastClient(this);
        this.tracks = new TrackClient(this);
        this.user = new UserClient(this);
        this.widevine = new WidevineClient(this);
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
        const instance = new Spotify(options);

        if (options.accessToken) {
            instance.accessToken = options.accessToken;
        }
        if (options.cookie) {
            instance.cookie = options.cookie;
            await instance.refresh();
        }
        if (!options.cookie && !options.accessToken) {
            throw new SpotifyAuthError(`A valid "sp_dc" cookie or access token must be provided.`);
        }

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

    getRawHeaders(): Record<string, string> {
        return {
            "Authorization": `Bearer ${this.accessToken}`,
            "Accept": "*",
            "Accept-Language": "*",
            "Connection": "keep-alive"
        }
    }

    /**
     * Refreshes and ensures the authentication tokens are valid.
     */
    public async refresh(): Promise<void> {
        const now = Date.now();
        if (now > this.accessExpiration) {
            await this.refreshToken();
        }
        if (now > this.clientExpiration) {
            //await this.refreshClient();
        }
    }

    /**
     * Refresh the access token if expiration time expired.
     */
    public async refreshToken(): Promise<void> {
        const now = Date.now();
        if (now < this.clientExpiration) return;

        const { otp, version } = await getSpotifyTotp();
        const headers = {
            "Referer": "https://open.spotify.com"
        };
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
                    totp: otp,
                    totpServer: otp,
                    totpVer: version.toString(),
                }
            }
        );

        const response: any = await tokenRequest.body.json();
        const isAnonymous = response["isAnonymous"];

        if (isAnonymous) {
            throw new SpotifyAuthError("You must provide a valid sp_dc cookie from a Spotify logged in browser.\nRefer to https://github.com/PwLDev/node-spdl#readme to see how to extract a cookie.");
        }

        this.accessToken = response["accessToken"];
        this.clientId = response["clientId"];

        const expirationTime = response["accessTokenExpirationTimestampMs"];
        if (expirationTime) {
            this.accessExpiration = expirationTime;
        }
    }

    public async refreshClient(): Promise<void> {
        const now = Date.now();
        if (now < this.clientExpiration) return; // calling too many times auth might block the sender IP

        const clientPayload = await this.getClientPayload();
        const clientToken = await undici.request(
            Endpoints.CLIENT_TOKEN,
            {
                method: "POST",
                body: JSON.stringify(clientPayload),
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                }
            }
        );

        const clientResponse: any = await clientToken.body.json();

        this.clientToken = clientResponse["granted_token"]["token"];
        this.clientExpiration = now + (clientResponse["granted_token"]["refresh_after_seconds"] * 1000);
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

    private async getClientPayload() {
        // https://github.com/brahmkshatriya/echo-spotify-extension/blob/main/ext/src/main/java/dev/brahmkshatriya/echo/extension/spotify/Authentication.kt
        const playerJsRegex = new RegExp("https://open\\.spotifycdn\\.com/cdn/build/mobile-web-player/mobile-web-player\\..{8}\\.js");
        const clientVersionRegex = new RegExp("clientID:\"(.{32})\",clientVersion:\"(.{10,24})\"");

        const webPlayer = await undici.fetch(Endpoints.HOME_PAGE)
            .then((r) => r.text());

        const playerJsMatch = webPlayer.match(playerJsRegex);
        if (!playerJsMatch || !playerJsMatch.length) {
            throw new SpotifyAuthError("Failed to get the player JS.");
        }

        const headers = {
            "Referer": "https://open.spotify.com"
        };
        if (this.cookie.length) {
            Object.assign(headers, { "Cookie": this.cookie });
        }
        // had to use fetch because gzip was giving trouble
        const playerJs = await undici.fetch(playerJsMatch[0], {
            method: "GET",
            headers
        })
            .then((r) => r.text());

        const clientVersionMatch = playerJs.match(clientVersionRegex);
        if (!clientVersionMatch || !clientVersionMatch.length) {
            throw new SpotifyAuthError("Failed to get the client version.");
        }

        const clientId = clientVersionMatch[1] || this.clientId;
        const clientVersion = clientVersionMatch[2];

        this.clientId = clientId;

        return {
            client_data: {
                client_id: clientId,
                client_version: clientVersion,
                js_sdk_data: {
                    device_brand: "unknown",
                    device_model: "unknown",
                    os: os.platform(),
                    os_version: os.version(),
                    device_id: clientId,
                    device_type: "computer"
                }
            },
        }
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
            const formats = [
                ...metadata.files.map((k) => k.format),
                ...metadata.preview.map((k) => k.format)
            ];

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

    public async search(query: string, options: SpdlSearchOptions = {}) {
        const request = await undici.request(Endpoints.SEARCH, {
            headers: this.getHeaders(),
            method: "GET",
            query: {
                ...options,
                q: query,
                type: options.type?.length ? options.type.join(",") : undefined
            }
        });
    }
}