import { request } from "undici";

import { SpdlClientOptions } from "../types/types";
import { SpdlAuth } from "./auth";
import { SpotifyApiError, SpotifyAuthError } from "./errors";

/**
 * Creates a `SpdlClient`.
 * This can shortcut authentication while downloading a file or making other operations with Spotify's API.
 * 
 * @param {SpdlCredentials} options Credentials to authenticate calls and client options.
 */
export class SpdlClient {
    auth: SpdlAuth;
    options: SpdlClientOptions;

    constructor(options: SpdlClientOptions) {
        if (options.auth) {
            this.auth = options.auth;
        } else {
            if (options.accessToken) {
                this.auth = new SpdlAuth({ accessToken: options.accessToken });
            } else {
                if (options.cookie) {
                    this.auth = new SpdlAuth({ cookie: options.cookie });
                } else {
                    throw new SpotifyAuthError("A cookie, non-anonymous access token or SpdlAuth must be provided in the options.");
                }
            }
        }

        this.options = options;
    }

    getAuthHeaders() {
        return {
            "Authorization": `Bearer ${this.auth.accessToken}`,
            "Accept-Language": "*",
            "Content-Type": "application/json",
            "app-platform": "Web-Player"
        }
    }

    async invoke(
        url: string, 
    ): Promise<any> {
        const headers = this.getAuthHeaders();
        const response = await request(url, {
            headers: headers
        });

        const json: any = await response.body.json();
        if (!json || json["error"]) {
            const status = json["error"]["status"];
            const message = json["error"]["message"];

            throw new SpotifyApiError(status, message);
        }

        return json;
    }
}