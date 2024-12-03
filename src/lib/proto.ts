import path from "node:path";
import proto from "protobufjs";

export interface StorageResolveResponse {
    cdnurl: string[];
    result: "CDN" | "STORAGE" | "RESTRICTED" | "UNRECOGNIZED";
    fileid: string;
}

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