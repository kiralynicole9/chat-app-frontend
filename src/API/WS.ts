let ws: any;

export const getWsConnection = () => {
    if(!ws){
        ws = new WebSocket("ws://localhost:3000");
    }
    return ws;
}