import { BaseAPI } from "./BaseAPI";


export class LoginAPI extends BaseAPI{

    public async login(data: object){
        return this.post(data);
    }

     protected getEndpoint(): string {
        return "login"
    }

}