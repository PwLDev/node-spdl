import { request } from "undici";

import { SpdlAuthLike } from "../types/types";
import { SpdlAuth, SpdlSession } from "./auth";

export const getRequestHeader = (auth: SpdlAuthLike) => {
    return {
        "Authorization": `Bearer ${auth.accessToken}`,
        "Accept-Language": "*",
        "Content-Type": "application/json",
        "App-Platform": "Web-Player"
    }
}

export const invoke = (url: string) => {
    
}