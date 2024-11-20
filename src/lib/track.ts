import stream from "node:stream";

import * as encryption from "./encryption";
import { SpdlOptions } from "./types";
import { SpdlAuth } from "./auth";
import { SpotifyAuthError } from "./errors";

export const getTrackInfo = (
    trackId: string,
    auth: SpdlOptions | SpdlAuth
) => {

}

export const downloadTrack = (
    trackId: string,
    options: SpdlOptions = {}
) => {
    let auth: SpdlAuth;
    if (options.auth) {
        auth = options.auth;
    } else {
        if (options.accessToken) {
            auth = new SpdlAuth({ accessToken: options.accessToken });
        } else {
            if (options.cookie) {
                auth = new SpdlAuth({ cookie: options.cookie });
            } else {
                throw new SpotifyAuthError(`A valid "sp_dc" cookie, non-anonymous access token or SpdlAuth must be provided.`);
            }
        }
    }

    
}

