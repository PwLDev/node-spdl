import { Spotify } from "./client.js";
import { Endpoints } from "./const.js";
import { parseAlbum, parseArtist } from "./parser.js";
import { Album, Artist } from "./types.js";
import { getIdFromQuery } from "./url.js";

export class ArtistClient {
    readonly client: Spotify;

    constructor(client: Spotify) {
        this.client = client;
    }

    /**
     * Gets an artist's metadata.
     * @param query Artist URL or ID
     * @returns Artist metadata
     */
    public async get(query: string): Promise<Artist> {
        const id = getIdFromQuery(query);
        const artist = await this.client.request(`${Endpoints.ARTISTS}${id}`);
        return parseArtist(artist);
    }

    /**
     * Gets all albums from an artist.
     * @param query Artist URL or ID
     * @returns Artist albums
     */
    public async getAlbums(query: string): Promise<Album[]> {
        const id = getIdFromQuery(query);
        const albums: any[] = await this.client.request(`${Endpoints.ARTISTS}${id}/albums`);
        return albums.map(parseAlbum);
    }
}