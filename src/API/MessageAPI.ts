import { BaseAPI } from "./BaseAPI";

export class MessageAPI extends BaseAPI{

    public async getMessages(from: string, to: string){
        return await this.getByQueryParams(`from_users=${from}&to_users=${to}`);
    }

    public async getMessagesById(id: string){
        return this.getById(id);
    }

    public async sendMessages(data: object){
        return this.post(data);
    }

    public async updateMessage(id: number, data: Partial<object>){
        return this.patch(id, data);
    }

    public async countMessagesFromUser(loggedInUserId: number){
        return this.get(`/count/${loggedInUserId}`);
    }

    protected getEndpoint(): string {
        return "messages";
        
    }

}