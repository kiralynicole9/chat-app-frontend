import { BaseAPI } from "./BaseAPI";

export class UserAPI extends BaseAPI {

    public async register(user:object){
       return this.post(user);
    }

    protected getEndpoint(): string {
        return "users";
    }

}