import { request } from "undici";

export class SpdlAuth {
    accessToken: string = "";
    expirationTime: string = "";
    cookie: string = "";

    constructor(cookie?: string) {
        if (!cookie || !cookie.length) {
            return;
        }

        this.cookie = cookie;
        this.refresh();
    }

    async refresh(): Promise<void> {
        const tokenRequest = await request(
            "https://open.spotify.com/get_access_token?reason=transport&productType=webplayer",
            {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "en",
                    "App-Platform": "WebPlayer",
                    "Connection": "keep-alive",
                    "Cookie": `sp_dc=${this.cookie}`,
                    "Host": "open.spotify.com",
                    "Sec-Fetch-Dest": "empty",
                    "Sec-Fetch-Mode": "cors",
                    "Sec-Fetch-Site": "same-origin",
                    "Spotify-App-Version": "1.2.33.0-unknown",
                    "TE": "trailers",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
                }
            }
        );

        const response: any = await tokenRequest.body.json();
        const isAnonymous = response["isAnonymous"];

        if (isAnonymous) {
            throw new Error("You must provide a valid sp_dc cookie from a Spotify logged in browser.\nRefer to https://github.com/PwLDev/node-spdl#readme to see how to extract a cookie.");
            return;
        }

        this.accessToken = response["accessToken"];

    }
}