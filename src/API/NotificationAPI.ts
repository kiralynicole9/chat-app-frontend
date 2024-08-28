import { BaseAPI } from "./BaseAPI";
import { User } from "./UserAPI";
export type Notification = {
    id: number,
    id_message: number,
    from_user: User,
    to_user: number,
    has_been_read: number,
    created_at: string,
    channel_id: number
}  

export class NotificationAPI extends BaseAPI{

    public async getNotifications(userId: string): Promise<Notification>{  
        return this.getByQueryParams(`user=${userId}`);  
    }

    public async getNotificationsChannel(channelId: number): Promise<Notification>{
        return this.getByQueryParams(`channelId=${channelId}`)
    }

    public async sendNotifications(data: object){
        return this.post(data);
    }

    public async makeNotificationRead(id: number, data: Partial<Notification> ){
        return this.patch<Notification>(id, data);
    }
    
    protected getEndpoint(): string {
        return "notifications";
    }
    
}