import { request } from "undici";

import { SpdlAuth } from "./auth";

/**
 * Gets a Stream from a Track id
 * @param id Spotify track id
 */
const downloadFromTrack = (id: string) => {

}

const getRequestHeader = (auth: SpdlAuth) => {
    return {
        "Authorization": `Bearer ${auth.accessToken}`,
        "Accept-Language": "*",
        "Content-Type": "application/json",
        "App-Platform": "Web-Player"
    }
}