import { request } from "undici";

import { SpdlAuth } from "./auth";

const getRequestHeader = (auth: SpdlAuth) => {
    return {
        "Authorization": `Bearer ${auth.accessToken}`,
        "Accept-Language": "*",
        "Content-Type": "application/json",
        "App-Platform": "Web-Player"
    }
}