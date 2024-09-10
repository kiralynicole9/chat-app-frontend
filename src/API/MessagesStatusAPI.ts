import { BaseAPI } from "./BaseAPI";

export class MessagesStatusAPI extends BaseAPI{

    public async createMessageStatus(status:object){
        return this.post(status);
    }

    public async updateMessageStatus(message_id: number, user_id: number, status: Partial<object>){
        return this.patchMultipleParams(message_id, user_id, status);
    }

    public async countMessagesFromChannel(loggedInUserId: number){
        return this.get(`/countFromChannels/${loggedInUserId}`);
    }

    protected getEndpoint(): string {
        return "messages-status";
    }

}