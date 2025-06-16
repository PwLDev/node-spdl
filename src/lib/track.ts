import { PassThrough, Readable } from "node:stream";

import { Spotify } from "./client.js";
import { Endpoints, Formats } from "./const.js";
import { parseTrack, parseTrackMetadata } from "./parser.js";
import { ColorLyrics, Track, TrackMetadata } from "./types.js";
import { getIdFromURL, getIdFromQuery } from "./url.js";

export class TrackClient {
    readonly client: Spotify;

    constructor(client: Spotify) {
        this.client = client;
    }

    public async get(id: string): Promise<Track> {
        const track = await this.client.request(`${Endpoints.TRACKS_URL}${id}`);
        return parseTrack(track);
    } 

    public async getMetadata(gid: string): Promise<TrackMetadata> {
        const meta = await this.client.request(`${Endpoints.TRACK_METADATA}${gid}`); 
        return parseTrackMetadata(meta);
    }

    /**
     * 
     * @param query ID or URL of track 
     * @returns Lyrics of song
     */
    public async lyrics(query: string): Promise<ColorLyrics> {
        const id = getIdFromQuery(query);

        const track = await this.get(id);
        const request = await this.client.request(`${Endpoints.COLOR_LYRICS}${track.id}?format=json&vocalRemoval=false`);

        const lyrics = request["lyrics"];
        return lyrics;
    }
}