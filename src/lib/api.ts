import { request } from "undici";

import { SpdlClientOptions } from "../types/types";
import { SpdlAuth } from "./auth";

/**
 * Creates a `SpdlClient`.
 * 
 * This can shortcut authentication while downloading a file or making other operations with Spotify's API.
 * 
 * @param {SpdlCredentials} options Credentials to authenticate calls and client options.
 */
export class SpdlClient {
    auth: SpdlAuth;

    constructor(options: SpdlClientOptions) {
        if (!options.accessToken) {
            this.auth = new SpdlAuth(options.cookie || "");
        } else {
            this.auth = new SpdlAuth();
            this.auth.accessToken = options.accessToken
        }
    }

    getAuthHeaders() {
        return {
            "Authorization": `Bearer ${this.auth.accessToken}`,
            "Accept-Language": "*",
            "Content-Type": "application/json",
            "App-Platform": "Web-Player"
        }
    }

    async invoke(
        url: string, 
        tryCount: number = 0
    ): Promise<any> {
        const headers = this.getAuthHeaders();
        const response = await request(url, {
            headers: headers
        });
    }
}