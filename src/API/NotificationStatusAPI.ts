import { BaseAPI } from "./BaseAPI";

export class NotificationStatusAPI extends BaseAPI{

    public async createNotificationStatus(status: object){
        return this.post(status);
    }

    public async updateNotificationStatus(notif_id: number, user_id: number, status: Partial<object>){
        return this.patchMultipleParams(notif_id, user_id, status);
    }

    protected getEndpoint(): string {
        return "notification-status"
    }
    
}