import { Spotify } from "./client.js";
import { Endpoints } from "./const.js";
import { parsePlaylist, parsePlaylistTrack } from "./parser.js";
import { Episode, Playlist, PlaylistTrack, Track } from "./types.js";
import { getIdFromQuery } from "./url.js";

export class PlaylistClient {
    readonly client: Spotify;

    constructor(client: Spotify) {
        this.client = client;
    }

    /**
     * Gets a playlist metadata.
     * @param query Playlist URL or ID
     * @returns Playlist metadata
     */
    public async get(query: string): Promise<Playlist> {
        const id = getIdFromQuery(query);
        const playlist = await this.client.request(`${Endpoints.PLAYLISTS}${id}`);
        return parsePlaylist(playlist);
    }

    /**
     * Gets a playlist's tracks.
     * @param query Playlist URL or ID
     * @returns Playlist tracks
     */
    public async getTracks(query: string): Promise<PlaylistTrack[]> {
        const id = getIdFromQuery(query);
        const podcast: any[] = await this.client.request(`${Endpoints.EPISODES}${id}`);
        return podcast.map(parsePlaylistTrack);
    }
}