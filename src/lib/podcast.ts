import { Spotify } from "./client.js";
import { Endpoints } from "./const.js";
import { parseEpisode, parseEpisodeMetadata, parsePodcast } from "./parser.js";
import { Episode, EpisodeMetadata, Podcast } from "./types.js";
import { getIdFromQuery } from "./url.js";

export class PodcastClient {
    readonly client: Spotify;

    constructor(client: Spotify) {
        this.client = client;
    }

    /**
     * Gets a podcast metadata.
     * @param query Episode URL or ID
     * @returns Podcast metadata
     */
    public async get(query: string): Promise<Podcast> {
        const id = getIdFromQuery(query);
        const podcast = await this.client.request(`${Endpoints.SHOWS}${id}`);
        return parsePodcast(podcast);
    }

    /**
     * Gets an episode basic info.
     * @param query Episode URL or ID
     * @returns Episode info.
     */
    public async getEpisode(query: string): Promise<Episode> {
        const id = getIdFromQuery(query);
        const episode = await this.client.request(`${Endpoints.EPISODES}${id}`);
        return parseEpisode(episode);
    }

    /**
     * Gets an episode's metadata
     * @param query Episode URL or ID
     * @returns Episode metadata
     */
    public async getMetadata(query: string): Promise<EpisodeMetadata> {
        const id = getIdFromQuery(query);
        const episode = await this.client.request(`${Endpoints.EPISODE_METADATA}${id}`);
        return parseEpisodeMetadata(episode);
    }
}