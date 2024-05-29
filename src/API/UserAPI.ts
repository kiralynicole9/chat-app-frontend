import { BaseAPI } from "./BaseAPI";
export type User = {
    email: string
    firstname: string
    lastname : string
    id : string
    username : string
}
export class UserAPI extends BaseAPI {

    public async register(user:object){
       return this.post(user);
    }

    public async getUsers(){
        return this.get();
    }

    public async getUser(userId: string): Promise<User>{
        return this.getById(userId);
    }

    protected getEndpoint(): string {
        return "users";
    }

}