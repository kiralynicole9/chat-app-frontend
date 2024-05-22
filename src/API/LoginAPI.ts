import { BaseAPI } from "./BaseAPI";


export class LoginAPI extends BaseAPI{

    public async login(email: object){
        return this.post(email);
    }

     protected getEndpoint(): string {
        return "login"
    }

}