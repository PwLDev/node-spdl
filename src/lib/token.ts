import { request } from "undici";

export class Token {
    accessToken?: string;
    cookie?: string;

    constructor(cookie?: string) {
        this.cookie = cookie;
    }

    async refresh(): Promise<string> {
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
                    "Cookie": `sp_dc=${this.cookie || ""}`,
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

        return response;
    }
}