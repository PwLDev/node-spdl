import path from "node:path";
import { fileURLToPath } from "node:url";

import proto from "protobufjs";

export const resolveProto = async (
    buffer: Buffer, 
    file: string,
    message: string
): Promise<any> => {
    const root: proto.Root = await proto.load(
        path.resolve(`./src/proto/${file}.proto`)
    );

    const messageType = root.lookupType(message);
    const decodedMessage = messageType.decode(buffer);

    return messageType.toObject(decodedMessage, {
        longs: String,
        enums: String,
        bytes: String
    });
}

const resolveProtoPath = (filename: string): string => {
	if (typeof __dirname !== "undefined") {
		return path.join(__dirname, "..", "/proto", filename);
	// @ts-ignore
	} else if (typeof import.meta !== "undefined" && import.meta.url) {
		// @ts-ignore
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		return path.join(__dirname, "..", "/proto", filename);
	} else {
		throw new Error("Unable to resolve proto path. Unsupported module environment.");
	}
}

const playplay = proto.loadSync(resolveProtoPath("playplay.proto"));

export const PlayPlayLicenseRequest = playplay.lookupType("PlayPlayLicenseRequest");
export const Interactivity = playplay.lookupEnum("Interactivity");
export const ContentType = playplay.lookupEnum("ContentType");
export const PlayPlayLicenseResponse = playplay.lookupType("PlayPlayLicenseResponse");