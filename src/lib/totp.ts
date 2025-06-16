import { base32 } from "rfc4648";
import undici from "undici";
import { TOTP } from "totp-generator";

import { Endpoints } from "./const.js";

export const getSpotifyTotp = async () => {
    const secretSauce = [
        12, 56, 76, 33, 88, 44, 88, 33,
        78, 78, 11, 66, 22, 22, 55, 69, 54,
    ]
        .map((n, i) => n ^ ((i % 33) + 9))
        .map((n) => n.toString())
        .join("");

    const secretBytes: string[] = [];
    Buffer.from(secretSauce, "utf8")
        .forEach((n) => secretBytes.push(n.toString(16)));

    const secret = base32.stringify(
        Buffer.from(secretBytes.join(""), "hex")
    ).replace(/=+$/, "");
    const period = 30;
    const digits = 6;

    const request = await undici.request(
        Endpoints.SERVER_TIME,
        {
            headers: {
                "Content-Type": "application/json"
            },
            method: "GET"
        }
    );

    const payload: any = await request.body.json();
    const timestamp = payload["serverTime"];

    const { otp } = TOTP.generate(secret, {
        algorithm: "SHA-1",
        digits,
        period,
        timestamp: timestamp * 1000
    });

    return [otp, timestamp];
} 