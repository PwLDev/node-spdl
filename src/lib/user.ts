import { Endpoints } from "./const.js";
import { Spotify } from "./client.js";
import { SelfUser } from "./types.js";
import { parseSelfUser } from "./parser.js";

export class UserClient {
    readonly client: Spotify;

    constructor(client: Spotify) {
        this.client = client;
    }

    public async me(): Promise<SelfUser> {
        const user = await this.client.request(Endpoints.ME);
        return parseSelfUser(user);
    }

    public async isPremium(): Promise<boolean> {
        if (this.client.options.forcePremium) return true;
        const me = await this.me();
        return me.product == "premium";
    } 
}