import { BaseAPI } from "./BaseAPI";
export type User = {
    email: string
    firstname: string
    lastname : string
    id : string
    username : string
    img?: string
    status?: string
    phone?: string
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
    
    public async updateUser(id: string, data: Partial<User>){
        return this.patch<User>(parseFloat(id), data);
    }

    public async updateProfileImg(id:number, data:any){
        return this.updateFile(id, data)
    }

    protected getEndpoint(): string {
        return "users";
    }

    

}