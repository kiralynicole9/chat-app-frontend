import { MessageAPI } from "../../API/MessageAPI";
import { useContext, useState } from "react";
import { useEffect } from "react";
import "./Message.css"
import { useParams } from "react-router-dom";
import { UserAPI } from "../../API/UserAPI";
import { User } from "../../API/UserAPI";
import { AuthContext } from "../../App";

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
    
    useEffect(() => {
        const api = new UserAPI();
        if(!userId){
            return;
        }
        api.getUser(userId).then((user) => {
            setUser(user);
        });

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
        
        const intervalId = setInterval(() => {
            console.log("interval");
            const messageapi = new MessageAPI();
            messageapi.getMessages(userId, loggedInUser?.id).then((_messages) => {
                
                setMessages((currentMessages) => {
                    const lastMessage = _messages[_messages.length - 1];
                    if(lastMessage?.from !== loggedInUser?.id && _messages.length > currentMessages.length ){
                        newMessageNotif.play();
                    }
                    return _messages;
                });

            })
        }, 1000)

        return () => {clearInterval(intervalId)}

    }, [userId, loggedInUser?.id])

    function handleSend(){
        //newMessageNotif.play();
        const message = {
            "from_users" : loggedInUser?.id,
            "to_users" : userId,
            "text" : data,
        }
        const messageapi = new MessageAPI();
        messageapi.sendMessages(message);
        console.log(data);
    }


    return (
        <div className="container">   
            <h3>{user?.firstname}</h3>
            {messages.map((message) => (
                <div >
                    <span className="message">
                        {message.from_users == userId && <span>{user?.firstname}: {message["message"]}</span>}
                        {message.from_users != userId && <span>me: {message["message"]}</span>}
                    </span>
                </div>    
            ))}

            <span className="send-group">
                <input type="text" className="send-input" onChange={(e) => {setData(e.target.value)}} />
                <button onClick={handleSend} >Send</button>
            </span>
        </div>
    );
} 