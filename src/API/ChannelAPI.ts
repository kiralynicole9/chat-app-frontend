import { BaseAPI } from "./BaseAPI";

export class ChannelAPI extends BaseAPI{

    public async createChannel(channel:object){
        console.log(channel, "channelAPII")
        return this.post(channel);
    }


    public async getChannelId(name:string){
        return this.getByQueryParams(`name=${name}`);  
    }

    public async getChannelById(id:string){
        return this.getById(id);
    }

    protected getEndpoint(): string {
        return "channels"
    }

}