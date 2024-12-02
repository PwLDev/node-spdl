import undici from "undici";

import { SpdlAuth } from "./auth.js";
import { SpotifyApiError } from "./errors.js";

export const getRequestHeader = (auth: SpdlAuth) => {
    return {
        "Authorization": `Bearer ${auth.accessToken}`,
        "Accept": "application/json",
        "Accept-Language": "*",
        "Content-Type": "application/json",
        "app-platform": "WebPlayer"
    }
}

export const call = async (
    url: string,
    auth: SpdlAuth,
    refresh: boolean = true
) => {
    if (refresh) auth.refresh();
    const headers = getRequestHeader(auth);
    const req = await undici.request(url, { headers: headers });

    const json: any = await req.body.json();
    if (!json || json["error"]) {
        const status = json["error"]["status"];
        const message = json["error"]["message"];

        throw new SpotifyApiError(status, message);
    }

    return json;
};

export const callRaw = async (
    url: string,
    auth: SpdlAuth,
    refresh: boolean = true
) => {
    if (refresh) auth.refresh();
    const headers = getRequestHeader(auth);
    const req = await undici.request(url, { headers: headers });

    const buffer = await req.body.arrayBuffer();
    return buffer
};