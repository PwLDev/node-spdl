export class SpotifyApiError extends Error { 
    constructor(
        statusCode: number,
        message: string
    ) {
        super();
        this.message = `Request failed with code ${statusCode || "unknown"} (${message}).`;
    }
}

export class SpotifyAuthError extends Error { 
    constructor(
        message: string
    ) {
        super();
        this.message = `Could not authenticate: ${message}`;
    }
}

export class SpotifyStreamError extends Error { 
    constructor(
        reason: string
    ) {
        super();
        this.message = `Could not get a stream: ${reason}.`;
    }
}