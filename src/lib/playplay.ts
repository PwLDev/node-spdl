import unplayplay from "@spdl/unplayplay";
import undici from "undici";

import { Spotify } from "./client.js";
import { Endpoints, AudioType } from "./const.js";
import { SpotifyApiError, SpotifyAuthError, SpotifyStreamError } from "./errors.js";
import { PlayPlayLicenseRequest, PlayPlayLicenseResponse } from "./proto.js";

export class PlayPlayClient {
    readonly client: Spotify;

    constructor(client: Spotify) {
        this.client = client;
    }

    public async getKey(fileId: string, licenseType: AudioType) {
        const licensePayload = PlayPlayLicenseRequest.encode({
            version: 2,
            token: unplayplay.token,
            interactivity: 1,
            contentType: licenseType,
            timestamp: Math.floor(Date.now() / 1000)
        });

        const license = await this.getLicense(licensePayload.finish(), fileId);
        const challenge = PlayPlayLicenseResponse.decode(license).toJSON();
        const obfuscatedKey = Buffer.from(challenge.obfuscatedKey, "base64");
        console.log(obfuscatedKey.toString("hex"), fileId)
        
        if (!obfuscatedKey) {
            throw new SpotifyAuthError("No PlayPlay key was provided by the response.");
        }

        const key = unplayplay.deobfuscateKey(
            Buffer.from(fileId, "hex"),
            obfuscatedKey
        );

        return key;
    }

    private async getLicense(
        challenge: Uint8Array,
        fileId: string,
    ): Promise<Buffer> {
        const request = await undici.request(
            `${Endpoints.PLAYPLAY}${fileId}`,
            {
                method: "POST",
                body: challenge,
                headers: this.client.getRawHeaders()
            }
        );

        if (request.statusCode == 403) {
            const isPremium = await this.client.user.isPremium();

            if (!isPremium) {
                throw new SpotifyStreamError("Playplay token invalid! Update @spdl/unplayplay if there is an update available and pass it to the client.");
            }
        }

        if (request.statusCode != 200) {
            throw new SpotifyApiError(request.statusCode, await request.body.text());
        }

        const content = await request.body.arrayBuffer();
        return Buffer.from(content);
    }
}