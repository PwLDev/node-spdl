declare interface SpdlClientOptions {
    accessToken?: string | undefined;
    clientId?: string | undefined;
    clientSecret?: string | undefined;
    redirectUri?: string | undefined;
    refreshToken?: string | undefined;
    autoRefresh?: boolean | undefined;
}

export {
    SpdlClientOptions
}