import { request } from "undici";

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

        const tokenRequest = await request(
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
}

export const getAuth = (param: SpdlAuthLike): SpdlAuth => {
    if (param instanceof SpdlAuth) {
        return param;
    } else {
        if (param.accessToken) {
            return new SpdlAuth({ accessToken: param.accessToken });
        } else {
            if (param.cookie) {
                return new SpdlAuth({ cookie: param.cookie });
            } else {
                throw new SpotifyAuthError(`A valid "sp_dc" cookie, non-anonymous access token or SpdlAuth must be provided.`);
            }
        }
    }
}