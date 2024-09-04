import { BaseAPI } from "./BaseAPI";

export class ReactionAPI extends BaseAPI{

public async createReaction(reaction:object) {
    return this.post(reaction)
}

public async getReactions(){
    return this.get();
}

protected getEndpoint(): string {
    return "reactions";
}
}