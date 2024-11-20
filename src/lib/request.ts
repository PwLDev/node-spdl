import { request } from "undici";

import { SpdlAuth } from "./auth";
import { SpotifyApiError } from "./errors";

export const getRequestHeader = (auth: SpdlAuth) => {
    return {
        "Authorization": `Bearer ${auth.accessToken}`,
        "Accept-Language": "*",
        "Content-Type": "application/json",
        "app-platform": "Web-Player"
    }
}

export const invoke = async (
    url: string,
    auth: SpdlAuth,
    refresh: boolean = true
) => {
    if (refresh) auth.refresh();
    const headers = getRequestHeader(auth);
    const req = await request(url, { headers: headers });

    const json: any = await req.body.json();
    if (!json || json["error"]) {
        const status = json["error"]["status"];
        const message = json["error"]["message"];

        throw new SpotifyApiError(status, message);
    }

    return json;
};