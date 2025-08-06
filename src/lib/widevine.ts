import { Session } from "@spdl/widevine";
import undici from "undici";

import { Spotify } from "./client";
import { Endpoints } from "./const";
import { WidevineDevice } from "./types";
import { SpotifyError, SpotifyResolveError, SpotifyStreamError } from "./errors";

export class WidevineClient {
	readonly client: Spotify;
	readonly device: WidevineDevice;

	constructor(client: Spotify) {
		this.client = client;

		if (client.options.device) {
			if (Buffer.isBuffer(client.options.device)) {
				this.device = this.loadDevice(client.options.device);
			} else {
				this.device = client.options.device;
			}
		} else {
			this.device = defaultDevice;
		}
	}

	public async getKey(pssh: Buffer) {
		if (!this.device) {
			throw new SpotifyError("A device was not provided in the client.");
		}

		const session = new Session(
			{
				identifierBlob: this.device.clientId,
				privateKey: this.device.privateKey
			},
			pssh
		);

		const challenge = await session.createLicenseRequest();
		const request = await this.getWidevineLicense("audio", challenge);
		const license = session.parseLicense(request);

		if (!license[0]) {
			throw new SpotifyStreamError("Widevine license request returned an invalid key");
		}

		return license[0].key;
	}

	/**
	 * Load a Widevine device
	 * @link https://github.com/lil1337/sextify/blob/main/src/lib/widevine/parseWidevineDevice.ts
	 */
	protected loadDevice(device: Buffer): WidevineDevice {
		if (device.subarray(0, 3).toString() != "WVD") {
			throw new SpotifyResolveError("device", "Invalid WVD magic numbers");
		}

		const version = device[3];
		if (version != 2) {
			throw new SpotifyResolveError(
				"device",
				`Unsupported WVD version: ${version}`
			);
		}

		const type = ["Chrome", "Android"][device[4] - 1];
		const level = device[5];
		const pad = device[6] ? 8 : 0;

		const privateKeyLength = device.subarray(pad + 7, pad + 9).readUInt16BE();
		const privateKeyStart = pad + 9;
		const privateKeyEnd = privateKeyStart + privateKeyLength;
		const privateKey = device.subarray(privateKeyStart, privateKeyEnd);

		const clientIdLength = device
			.subarray(privateKeyEnd, privateKeyEnd + 2)
			.readUInt16BE();
		const clientIdStart = privateKeyEnd + 2;
		const clientIdEnd = clientIdStart + clientIdLength;
		const clientId = device.subarray(clientIdStart, clientIdEnd);

		return { type, level, privateKey, clientId };
	}

	public async getSeektable(fileId: string): Promise<Record<string, any>> {
		const request = await undici.request(`${Endpoints.SEEKTABLE}${fileId}.json`);

		const response: any = await request.body.json();
		return response;
	}

	protected async getWidevineLicense(mediaType: string, challenge: Buffer) {
		const request = await undici.request(
			`${Endpoints.WIDEVINE}${mediaType}/license`,
			{
				body: challenge,
				headers: this.client.getRawHeaders(),
				method: "POST"
			}
		);
		const response = await request.body.bytes();

		return Buffer.from(response);
	}
}

export const defaultDevice: WidevineDevice = {
	type: "Android",
	level: 3,
	privateKey: Buffer.from("MIIEowIBAAKCAQEAorWxDuAqYz7X9nn5mggjmcm9+xGWvBgmdNuSfOU/mRJjyqpoBy89PqgS5c65d8VmEWWCzBsPurpYfXe4SNqhHb97/L2fB8TzgZlgFYBPIAiBTXqQDWILeUZUG2up+jxrky5Aq72HbzdtJ7yR6xAuUu+AeP6yzcffMJYCej1f9TQgXWuSfJ9PqZI7buRqiKkkIKIjjfmTUS36Fz/L9hKlIhPy7ToiukFJseZvX/di/DRpdnTNyJCsNkSX3TtM+V4CzhWcF5rTBXTJ6lEFHfmruzn/piz2HdoM+fq8GGg54by6a/TWa0BMul67bAraIrE+Tmi46PfoT1Dfu9O0u+qsrQIDAQABAoIBAB2LqaGeYgQQis3Ge2UVekV4RUe8e2cfaYhJwNFuHXzRwo4wIGDBmrjwczIItlQB49Vf3f7rIRGSufPak/uiu6P3u+96jVCvWlpbu/9bg8K42KX1jgfoGFZGx4oNJFn8s7oPqY2mBlxTL76J9uM81nSX6ffOpDBKzYP4kW2aDH0tVewqOvSrYfRBbG1LjgyTg++d399+GtwliUuRmh2+d2bX/GB/Pwc0Kq/U+IDs7vI3ZlUnzsRJN4bgjg9JKRaLZ/uRtbq4xFVwv+/P7pxyejHcteqTxu+DTBWHYxSFZU/KlXn0P8eUg2YScfUUBRBCroAN4am/yA1Sg1ggJTyZ518CgYEA47nSvWO5qkSc8JPvVR2ql6KrK43AdpmwiWe2HmrbHF/qe3DSiHutzjkzfXyhnQY/8ELahqbOKKtnqw/O6kLVD/ErCqAosoSdy9jqqeapcfAMLMyrrsMhfLPWjm3UQ71EqWdRsz7bDqeZsjuWDx1ImM5yC5KSZbjEYnuX55+y/iMCgYEAtulbLWIom/2j3d9QWbQ6woFNmLp4zP0t7GWwunnE5+4n5EKfImoiEzGLsIbmj4ArxKnWtLXhBX4a04eUtkVUaqE/2w9BA7oXZrBUwupzPmaPX4psf4akkPzUfyeVPrrLhq+xhhD+eITOepk1O9KMwk9I/2meUOeSOrOUXitIju8CgYEAvUuBBxc3hXalckG2Z21SmduJJ5ocSzn0CjPgqiYu3sZINrYQ+4y7bDoWOBB6kvlX+tLHrbhIlHvun75zRD2ruCXDnoCFc+dS99jnL7XiUii1JiQ37fycAHnJNvnKwUg6JAsTWck89FCTLRnk4cl4yDSLjl0XPmE5NZgBLHOOqTsCgYB1z/BuVt8ZOlGlwwSaAsAmL+qvCMxuHFTMAuPF+FCfooIHP/IH1JyGCE+VMA6pN0D5tvsYAl4hj4vv21Ap5pXs6Fec3UJfCCmydrjhouj/tEd8nkgsC6lLyc2E6RX0BZS598g8Ng3xynjD9pKXKZKIRVEbUggqzD0fmjNiRDbD+QKBgHl9oQhljvZQmPBfmuBQD6vVilNlV8TTH8xzbyQMSmqm7lAtxDdteU+fZBJkYYCBs5sIPObJEGv1B0959sFAFySGehIUz9BOgpZIcX3wC337Kf8wxR4CFma91v2okQ7GduT3exLZz/s5/AXgdOH9rcsJW0oD8f5dSSUeU3ssYLRs", "base64"),
	clientId: Buffer.from("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", "base64")
}