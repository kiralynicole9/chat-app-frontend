import { BaseAPI } from "./BaseAPI";

export class MessagesStatusAPI extends BaseAPI{

    public async createMessageStatus(status:object){
        return this.post(status);
    }

    protected getEndpoint(): string {
        return "messages-status";
    }

}