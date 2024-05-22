export abstract class BaseAPI {

    protected createUrl(){
        const baseUrl = "http://localhost:3000/";
        return baseUrl + this.getEndpoint() ;
    }

    protected abstract getEndpoint():string;

    protected async post( body:{[key:string]:any}){
        const url = this.createUrl();
        const data = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-Type":"application/json"
            },
            body:JSON.stringify(body),
        })
        return data;
    }

    protected get(){

    }

    protected put(){

    }



}