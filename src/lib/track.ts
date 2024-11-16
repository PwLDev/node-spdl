import stream from "node:stream";

import * as encryption from "./encryption";
import { SpdlOptions } from "../types/types";
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
    if (!options.auth) {
        if (!options.accessToken) {
            if (!options.cookie) {
                throw new SpotifyAuthError("A cookie, non-anonymous access token or SpdlAuth must be provided in the options.");
            }

            auth = new SpdlAuth({ cookie: options.cookie });
        }
    } else {
        auth = options.auth;
    }
}

export const addTags = (file: Buffer) => {

}