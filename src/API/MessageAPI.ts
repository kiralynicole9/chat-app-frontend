import { BaseAPI } from "./BaseAPI";

export class MessageAPI extends BaseAPI{

    public async getMessages(from: string, to: string){
        return await this.getByQueryParams(`from_users=${from}&to_users=${to}`);
    }

    public async sendMessages(data: object){
        return this.post(data);
    }

    protected getEndpoint(): string {
        return "messages";
        
    }

}