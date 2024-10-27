import SpotifyWebApi from "spotify-web-api-node";
import { SpdlClientOptions } from "./types";

/**
 * Creates a `SpdlClient`.
 * 
 * This can shortcut authentication while downloading a file or making other operations with Spotify's API.
 * Extends `SpotifyWebApi` class from [spotify-web-api-node](https://www.npmjs.com/package/spotify-web-api-node) package.
 * 
 * @param {SpdlCredentials} options Credentials to authenticate API calls and client options.
 */
export class SpdlClient extends SpotifyWebApi {
    constructor(options?: SpdlClientOptions) {
        super(options);
    }


}
