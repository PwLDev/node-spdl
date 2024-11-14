import { SpdlClientOptions } from "../types/types";
import { SpdlAuth } from "./token";

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
        this.auth = new SpdlAuth(options.cookie || "");
    }

    
}