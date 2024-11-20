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
        this.message = `Spotify Auth failed: ${message}`;
    }
}

export class SpotifyStreamError extends Error { 
    constructor(
        reason: string
    ) {
        super();
        this.message = `Spotify stream failed: ${reason}.`;
    }
}