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

    protected async get(section?: string){
        let url = this.createUrl();
        if(section){
            url+=section
        }
        const data = await fetch(url, {
            method: 'GET'
        })
        return data;
    }

    protected async getById(id:string){
        const url = this.createUrl() + "/" + id;
        const res = await fetch (url, {
            method: 'GET'
        })
        return await res.json();
    }

    protected async getByQueryParams(queryParams: string){
        const url = this.createUrl() + "?" + queryParams;
        const res = await fetch (url, {
            method: 'GET'
        })
        return await res.json();
    }

    protected put(){

    }

    protected async patch<T>(id: number, data: Partial<T>){
        const url = this.createUrl() + "/" + id;
        const res = await fetch(url, {
            method: 'PATCH',
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return await res.json();
    }

}