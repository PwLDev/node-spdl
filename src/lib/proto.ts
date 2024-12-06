import path from "node:path";
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

const playplay = proto.loadSync(path.resolve(`./src/proto/playplay.proto`));

export const PlayPlayLicenseRequest = playplay.lookupType("PlayPlayLicenseRequest");
export const Interactivity = playplay.lookupEnum("Interactivity");
export const ContentType = playplay.lookupEnum("ContentType");
export const PlayPlayLicenseResponse = playplay.lookupType("PlayPlayLicenseResponse");