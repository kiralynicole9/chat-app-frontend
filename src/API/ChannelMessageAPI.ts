import { BaseAPI } from "./BaseAPI";

export class ChannelMessageAPI extends BaseAPI{

    public async createChannelMessage(channelMessage:object){
        return this.post(channelMessage);
    }

    public async getMessagesIds(channel_id: string){
        return this.getByQueryParams(`channel_id=${channel_id}`)
    }


    protected getEndpoint(): string {
       return "channel-messages";
    }
    
}