import base32 from "hi-base32";
import { TOTP } from "totp-generator";
import undici from "undici";
import unplayplay from "unplayplay";

import { Endpoints } from "./const.js";
import { SpotifyApiError, SpotifyAuthError } from "./errors.js";
import { SpotifyUser } from "./metadata.js";
import { PlayPlayLicenseRequest, PlayPlayLicenseResponse } from "./proto.js";
import { call } from "./request.js";
import { SpdlAuthOptions } from "./types.js";

/**
 * The `Spotify` initializes a Spotify API client.
 * A valid sp_dc cookie or non-anonymous (logged in) access token must be provided.
 * 
 * Refer to [here](https://github.com/PwLDev/node-spdl?tab=readme-ov-file#how-to-get-a-cookie-])
 * to see how to extract a sp_dc cookie.
 * 
 * @param {SpdlAuthOptions} options Authenticate with your Spotify account.
 */
export class Spotify {
    accessToken: string = "";
    expirationTime: string = "";
    cookie: string = "";
    expiration: number = 0;

    constructor(options: SpdlAuthOptions) {
        if (options.accessToken) {
            this.accessToken = options.accessToken;
        } else {
            if (options.cookie) {
                this.cookie = options.cookie;
                this.refresh();
            } else {
                throw new SpotifyAuthError(`A valid "sp_dc" cookie or access token must be provided.`);
            }
        }
    }

    /**
     * Refresh the token if expiration time expired.
     */
    async refresh(): Promise<void> {
        if (
            !this.expiration ||
            !this.cookie.length ||
            this.expiration > Date.now()
        ) return;

        const [otpValue, serverTime] = await this.generateTotp();
        const clientTime = Date.now();

        const tokenRequest = await undici.request(
            "https://open.spotify.com/get_access_token",
            {
                method: "GET",
                headers: {
                    "Cookie": `sp_dc=${this.cookie}`,
                    ...this.getHeaders()
                },
                query: {
                    reason: "transport",
                    productType: "web-player",
                    totp: otpValue.toString(),
                    totpServer: otpValue.toString(),
                    totpVer: "5",
                    sTime: serverTime.toString(),
                    cTime: clientTime.toString()
                }
            }
        );

        const response: any = await tokenRequest.body.json();
        const isAnonymous = response["isAnonymous"];

        if (isAnonymous) {
            throw new SpotifyAuthError("You must provide a valid sp_dc cookie from a Spotify logged in browser.\nRefer to https://github.com/PwLDev/node-spdl#readme to see how to extract a cookie.");
        }

        this.accessToken = response["accessToken"];

        const expirationTime = response["accessTokenExpirationTimestampMs"];
        if (expirationTime) {
            this.expiration = expirationTime;
        }
    }

    getHeaders(): Record<string, string> {
        return {
            "Authorization": `Bearer ${this.accessToken}`,
            "Accept": "application/json",
            "Accept-Language": "*",
            "Connection": "keep-alive",
            "Content-Type": "application/json",
            "Origin": "open.spotify.com",
            "Referer": "open.spotify.com",
            "app-platform": "WebPlayer"
        }
    }

    getProtoHeaders(): Record<string, string> {
        return {
            "Authorization": `Bearer ${this.accessToken}`,
            "Accept": "*",
            "Accept-Language": "*",
            "Connection": "keep-alive",
            "Content-Type": "application/json"
        }
    }

    /**
     * Gets info about yourself in Spotify.
     * @returns Your user
     */
    async me(): Promise<SpotifyUser> {
        const response = await call(Endpoints.ME, this);
        return response;
    }

    /**
     * Is the Spotify account premium?
     */
    async isPremium(user?: SpotifyUser): Promise<boolean> {
        if (!user) user = await this.me();
        return user.product == "premium";
    }

    async getPlayPlayKey(fileId: string) {
        const licensePayload = PlayPlayLicenseRequest.encode({
            version: 2,
            token: unplayplay.token,
            interactivity: 1,
            contentType: 1,
            timestamp: Math.floor(Date.now() / 1000)
        }).finish();

        console.log("Payload: ",PlayPlayLicenseRequest.decode(licensePayload).toJSON())

        const request = await this.getPlayPlayLicense(
            licensePayload,
            fileId
        );

        const content: any = PlayPlayLicenseResponse.decode(request);
        console.log("Response: ", content)
        if (!content["obfuscatedKey"]) {
            throw new SpotifyAuthError("No PlayPlay license was provided by the response.");
        }

        const obfuscatedKey: Buffer = content["obfuscatedKey"];
        const key = unplayplay.deobfuscateKey(
            Buffer.from(fileId, "hex"),
            obfuscatedKey
        );

        return key;
    }

    private async getPlayPlayLicense(
        challenge: Uint8Array,
        fileId: string
    ): Promise<Buffer> {
        const request = await undici.request(
            `${Endpoints.PLAYPLAY}${fileId}`,
            {
                method: "POST",
                body: challenge,
                headers: this.getProtoHeaders()
            }
        )

        if (request.statusCode != 200) {
            throw new SpotifyApiError(request.statusCode, await request.body.text());
        }

        console.log("Status: ", request.statusCode)

        const content = await request.body.arrayBuffer();
        return Buffer.from(content);
    }
 
    private async generateTotp() {    
        // Code translated from:
        // https://github.com/misiektoja/spotify_monitor/blob/dev/spotify_monitor.py#L759
        // https://github.com/KRTirtho/spotube/blob/ba27dc70e4fae63a1fd1089e50487ecee1c871ca/lib/provider/authentication/authentication.dart#L209
        
        // generate totp with bitwise operations
        const transformed = [
            12, 56, 76, 33, 88, 44, 88, 33,
            78, 78, 11, 66, 22, 22, 55, 69, 54,
        ].map((n, i) => n ^ ((i % 33) + 9));

        const joined = transformed.map((n) => n.toString()).join("");
        const utf8Bytes = Buffer.from(joined, "utf8");
        const hexBytes: string[] = [];

        for (let n of utf8Bytes) hexBytes.push(n.toString(16));

        const secretKey = Buffer.from(hexBytes.join(""), "hex");
        const secret = base32.encode(secretKey).replace(/=+$/, "");

        const req = await undici.request(
            "https://open.spotify.com/server-time",
            {
                headers: {
                    "Host": "open.spotify.com",
                    "Accept": "*/*",
                }
            }
        );

        const json: any = await req.body.json()
        const serverTime: number = json["serverTime"];

        const { otp } = TOTP.generate(secret, {
            algorithm: "SHA-1",
            digits: 6,
            period: 30,
            timestamp: serverTime * 1000
        });

        return [otp, serverTime];
    }
}