import { createHmac } from "node:crypto";
import undici from "undici";

import { Endpoints } from "./const.js";

export const getSpotifyTotp = async () => {
    const codesUrl = "https://git.gay/thereallo/totp-secrets/raw/branch/main/secrets/secrets.json"; // totp secrets source
    const codes: any = await undici.request(codesUrl)
        .then((r) => r.body.json());

    const sauce: string = codes.secrets[0].secret;
    const version: number = codes.secrets[0].version;

    const validUntil = Date.parse(codes.validUntil);
    const now = Date.now();

    if (validUntil < now) {
        if (!process.env.SPDL_NO_WARNING) {
            console.warn(`[spdl] This totp expired at ${codes.validUntil} (version ${version}). Authentication might stop working soon if not updated.`);
        }
    }

    const secretSauce = Array.from(Buffer.from(sauce, "ascii"))
        .map((n, i) => n ^ ((i % 33) + 9))
        .map((n) => n.toString())
        .join("");

    const secretBytes: string[] = [];
    Buffer.from(secretSauce, "utf8")
        .forEach((n) => secretBytes.push(n.toString(16)));

    const secret = Buffer.from(secretBytes.join(""), "hex")

    const period = 30;
    const digits = 6;

    const response: any = await undici.request(Endpoints.SERVER_TIME)
        .then((r) => r.body.json());
    const timestamp = response["serverTime"];
    const counter = Math.floor(timestamp / period);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter));

    const hmac = createHmac("sha1", secret)
        .update(counterBuffer)
        .digest();
    const offset = hmac[hmac.length - 1] & 0x0f;

    const binary =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    const otp = (binary % 10 ** digits).toString().padStart(digits, "0");
    return { otp, version }
} 
