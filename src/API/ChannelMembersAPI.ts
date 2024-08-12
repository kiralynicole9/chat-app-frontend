import { BaseAPI } from "./BaseAPI";

export class ChannelMembersAPI extends BaseAPI{

    public async addMember(channelMember:object){
        return this.post(channelMember);
    }

    public async getChannelByMemberId(id:string){
        return this.getByQueryParams(`user_id=${id}`);
    }

    public async getMembersByChannelId(id:string){
        return this.getByQueryParams(`channel_id=${id}`);
    }

    protected getEndpoint(): string {
        return "channel-members"
    }

}