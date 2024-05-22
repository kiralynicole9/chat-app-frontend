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
        if(data.status >= 400){
            throw new Error(data.statusText);
        }
        return data;
    }

    protected get(){

    }

    protected put(){

    }



}