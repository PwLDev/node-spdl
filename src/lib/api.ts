import SpotifyWebApi from "spotify-web-api-node";
import { SpdlClientOptions } from "../types/types";

import { SpdlAuth } from "./token";

/**
 * Creates a `SpdlApi`.
 * 
 * This can shortcut authentication while downloading a file or making other operations with Spotify's API.
 * Extends `SpotifyWebApi` class from [spotify-web-api-node](https://www.npmjs.com/package/spotify-web-api-node) package.
 * 
 * @param {SpdlCredentials} options Credentials to authenticate API calls and client options.
 */
export class SpdlApi extends SpotifyWebApi {
    token: SpdlAuth;

    constructor(options: SpdlClientOptions) {
        super(options);
        this.token = new SpdlAuth(options.cookie || "");
    }

    
}