import undici from "undici";
import unplayplay from "unplayplay";

import { Endpoints } from "./const.js";
import { SpotifyApiError, SpotifyAuthError } from "./errors.js";
import { SpotifyUser } from "./metadata.js";
import { PlayPlayLicenseRequest, PlayPlayLicenseResponse } from "./proto.js";
import { call } from "./request.js";
import { SpdlAuthOptions } from "./types.js";

/**
 * A `SpdlAuth` shortcuts authentication when making multiple tasks with the API.
 * A valid sp_dc cookie or non-anonymous (logged in) access token must be provided.
 * 
 * Refer to [here](https://github.com/PwLDev/node-spdl?tab=readme-ov-file#how-to-get-a-cookie-])
 * to see how to extract a sp_dc cookie.
 * 
 * @param {SpdlAuthOptions} options Authenticate with your Spotify account.
 */
export class SpdlAuth {
    accessToken: string = "";
    expirationTime: string = "";
    cookie: string = "";
    expiration: number = 0;

    constructor(options: SpdlAuthOptions) {
        if (options.accessToken) {
            this.accessToken = options.accessToken;
        } else {
            if (options.cookie) {
                this.cookie = options.cookie;
                this.refresh();
            } else {
                throw new SpotifyAuthError(`A valid "sp_dc" cookie or access token must be provided.`);
            }
        }
    }

    /**
     * Refresh the token if expiration time expired.
     */
    async refresh(): Promise<void> {
        if (
            !this.expiration ||
            !this.cookie.length ||
            this.expiration > Date.now()
        ) return;

        const tokenRequest = await undici.request(
            "https://open.spotify.com/get_access_token?reason=transport&productType=webplayer",
            {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "App-Platform": "WebPlayer",
                    "Cookie": `sp_dc=${this.cookie}`,
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

    getHeaders(): Record<string, string> {
        return {
            "Authorization": `Bearer ${this.accessToken}`,
            "Accept": "application/json",
            "Accept-Language": "*",
            "Content-Type": "application/json",
            "app-platform": "WebPlayer"
        }
    }

    getProtoHeaders(): Record<string, string> {
        return {
            "Authorization": `Bearer ${this.accessToken}`,
            "Accept": "*"
        }
    }

    /**
     * Gets info about yourself in Spotify.
     * @returns Your user
     */
    async me(): Promise<SpotifyUser> {
        const response = await call(Endpoints.ME, this);
        return response;
    }

    /**
     * Is the Spotify account premium?
     */
    async isPremium(user?: SpotifyUser): Promise<boolean> {
        if (!user) user = await this.me();
        return user.product == "premium";
    }

    async getPlayPlayKey(fileId: string) {
        const licensePayload = PlayPlayLicenseRequest.encode({
            version: 2,
            token: unplayplay.token,
            interactivity: 1,
            contentType: 1,
            timestamp: Math.floor(Date.now() / 1000)
        }).finish();

        const request = await this.getPlayPlayLicense(
            licensePayload,
            fileId
        );

        const content: any = PlayPlayLicenseResponse.decode(request);
        if (!content["obfuscatedKey"]) {
            throw new SpotifyAuthError("No PlayPlay license was provided by the response.");
        }

        const obfuscatedKey: Buffer = content["obfuscatedKey"];
        const key = unplayplay.deobfuscateKey(
            Buffer.from(fileId, "hex"),
            obfuscatedKey
        );

        return key;
    }

    private async getPlayPlayLicense(
        challenge: Uint8Array,
        fileId: string
    ): Promise<Buffer> {
        const request = await undici.request(
            `${Endpoints.PLAYPLAY}${fileId}`,
            {
                method: "POST",
                body: challenge,
                headers: this.getProtoHeaders()
            }
        )

        if (request.statusCode != 200) {
            throw new SpotifyApiError(request.statusCode, await request.body.text());
        }

        const content = await request.body.arrayBuffer();
        return Buffer.from(content);
    }
}