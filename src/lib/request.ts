import undici from "undici";

import { Spotify } from "./client.js";
import { SpotifyApiError } from "./errors.js";

export const call = async (
    url: string,
    auth: Spotify,
    refresh: boolean = true
) => {
    if (refresh) auth.refresh();
    const headers = auth.getHeaders();
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
    auth: Spotify,
    refresh: boolean = true
) => {
    if (refresh) auth.refresh();
    const headers = auth.getHeaders();
    const req = await undici.request(url, { headers: headers });

    const buffer = await req.body.arrayBuffer();
    return buffer
};