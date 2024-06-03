import { MessageAPI } from "../../API/MessageAPI";
import { useContext, useState } from "react";
import { useEffect } from "react";
import "./Message.css"
import { useParams } from "react-router-dom";
import { UserAPI } from "../../API/UserAPI";
import { User } from "../../API/UserAPI";
import { AuthContext } from "../../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faPlane } from "@fortawesome/free-solid-svg-icons";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";

type MessageList = {
    fieldName: string,
    secondFieldName: string
 }

const newMessageNotif = new Audio("new-message.mp3");
export const Message = () => {

    const [messages, setMessages] = useState([]);
    const [data, setData] = useState("");
    const {userId} = useParams();
    const [user, setUser] = useState<User>();
    const {user: loggedInUser} = useContext(AuthContext);
    const [wsClient, setWs] = useState({});
    
    useEffect(() => {
        const api = new UserAPI();
        if(!userId){
            return;
        }
        api.getUser(userId).then((user) => {
            setUser(user);
        });

        if(userId){
            const ws = new WebSocket("ws://localhost:3000"); 
            setWs(ws);
           
        }
        //return () => {ws.close()}

    }, [userId])

    useEffect(()=> {
        if(!userId){
            return;
        }
        console.log("run");
        const messageapi = new MessageAPI();
        messageapi.getMessages(userId, loggedInUser?.id).then((message) => {
            setMessages(message);
        })
        
        // const intervalId = setInterval(() => {
        //     console.log("interval");
        //     const messageapi = new MessageAPI();
        //     messageapi.getMessages(userId, loggedInUser?.id).then((_messages) => {
                
        //         setMessages((currentMessages) => {
        //             const lastMessage = _messages[_messages.length - 1];
        //             if(lastMessage?.from !== loggedInUser?.id && _messages.length > currentMessages.length ){
        //                 newMessageNotif.play();
        //             }
        //             return _messages;
        //         });

        //     })
        // }, 1000)

        // return () => {clearInterval(intervalId)}

    }, [userId, loggedInUser?.id])

    useEffect(() => {
        if(!wsClient.addEventListener) return;
        const messageCallback = (e) => {
            console.log(e);
            newMessageNotif.play();
            setMessages([
                ...messages,
               ...JSON.parse(e.data)
            ])
        }
        wsClient?.addEventListener("message", messageCallback);
        return () => {wsClient?.removeEventListener("message", messageCallback)}
    }, [messages])
    function handleSend(){
        //newMessageNotif.play();
        const message = {
            "to_user" : userId,
            "message" : data,
        }
        setMessages([
            ...messages,
            {
                from_users: user.id,
                to_users: userId,
                message: data
            }
        ])
        wsClient.send(JSON.stringify({
            type: "send_message",
            data: {
                ...message
            }
        }))
        // const messageapi = new MessageAPI();
        // messageapi.sendMessages(message);
        // console.log(data);
    }


    return (
        <div className="container">   
            <h3>{user?.firstname}</h3>
            {messages.map((message) => (
                <div >
                    <span className="message">
                        {message.from_users == userId && <>
                            <span className="message-user">
                                <UserAvatar username={user?.firstname}></UserAvatar>{user?.firstname}
                            </span>
                            <span className="message-text">{message["message"]}</span>
                        </>}
                         {message.from_users != userId && <>
                            <span className="message-user">
                                <UserAvatar username="me"></UserAvatar>me 
                            </span>
                            <span className="message-text">{message["message"]}</span>
                        </>}
                    </span>
                </div>    
            ))}

            <span className="send-group">
                <input type="text" placeholder="Type a message..." className="send-input" onChange={(e) => {setData(e.target.value)}} />
                <button onClick={handleSend} className="send-message">
                    <FontAwesomeIcon icon={faPaperPlane}></FontAwesomeIcon>
                </button>
            </span>
        </div>
    );
} 