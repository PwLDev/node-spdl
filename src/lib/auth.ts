import undici from "undici";
import unplayplay from "unplayplay";

import { SpotifyAuthError } from "./errors.js";
import { SpdlAuthLike, SpdlAuthOptions } from "./types.js";

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
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "en",
                    "App-Platform": "WebPlayer",
                    "Connection": "keep-alive",
                    "Cookie": `sp_dc=${this.cookie}`,
                    "Host": "open.spotify.com",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "Spotify-App-Version": "1.2.33.0-unknown",
                    "TE": "trailers",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
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

    async getPlayPlayKey(fileId: string) {
        const licensePayload = {
            "version": 2,
            "token": this.accessToken,
            "interactivity": 1,
            "content_type": 1
        }

        const content = await this.getPlayPlayLicense(licensePayload, fileId);

        if (!content["obfuscated_key"]) {
            throw new SpotifyAuthError("No PlayPlay license was provided by the response.");
        }

        const key = unplayplay.deobfuscateKey(Buffer.from(fileId, "hex"), content["obfuscated_key"]);
        return key;
    }

    private async getPlayPlayLicense(
        challenge: any,
        fileId: string
    ): Promise<any> {
        const request = await undici.request(
            `https://gue1-spclient.spotify.com/playplay/v1/key/${fileId}`,
            {
                method: "POST",
                body: challenge,
                headers: this.getHeaders()
            }
        )

        if (request.statusCode != 200) {
            throw new SpotifyAuthError("Could not get AES decryption key.");
        }

        const content = await request.body.json();
        return content;
    }
}