import { MessageAPI } from "../../API/MessageAPI";
import { useContext, useRef, useState } from "react";
import { useEffect } from "react";
import "./Message.css"
import { useParams } from "react-router-dom";
import { UserAPI } from "../../API/UserAPI";
import { User } from "../../API/UserAPI";
import { AuthContext } from "../../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSmile, faHeadphones, faPaperPlane, faPaperclip, faPhone, faPlane } from "@fortawesome/free-solid-svg-icons";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { getWsConnection } from "../../API/WS";
import { ChannelAPI } from "../../API/ChannelAPI";
import { ChannelMessageAPI } from "../../API/ChannelMessageAPI";
import { ChannelMembersAPI } from "../../API/ChannelMembersAPI";

type MessageList = {
    fieldName: string,
    secondFieldName: string
 }

export const Message = () => {

    const [messages, setMessages] = useState([]);
    const [data, setData] = useState("");
    const {userId, channelId} = useParams();
    const [user, setUser] = useState<User>();
    const {user: loggedInUser} = useContext(AuthContext);
    const [emoji, setEmoji] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [showReaction, setShowReaction] = useState(null);
    const [reaction, setReaction] = useState(null);
    const [channel, setChannel] = useState("");
    const[channelMessages, setChannelMessages] = useState([]);

    const fileInputRef = useRef(null);
    const inputRef = useRef(null);
    
    useEffect(() => {
        const api = new UserAPI();
        if(!userId){
            return;
        }
        api.getUser(userId).then((user) => {
            setUser(user);
        });

        console.log(userId, "9999999999")
       
    }, [userId])

    useEffect(()=> {
        if(!userId){
            return;
        }
        console.log("run");
        const messageapi = new MessageAPI();
        messageapi.getMessages(userId, loggedInUser?.id).then((_messages) => {
            setMessages(_messages);
            for(const mess of _messages){
                if(mess.to_users === loggedInUser.id){
                    messageapi.updateMessage(mess.id, {
                        has_been_read: true
                    })
                }
            }
        })

    }, [userId, loggedInUser?.id])

    useEffect(() => {
        if(!channelId){
            return;
        }
        const fetchMessages = async () => {
            const channelMessageApi = new ChannelMessageAPI();
            const messageapi = new MessageAPI();
            const channelMessagesIds = await channelMessageApi.getMessagesIds(channelId as string);
            console.log(channelMessagesIds.channelMessages, ";;")

            let fetchedMessages = []
            for(const channelMessageId of channelMessagesIds.channelMessages){

                const message = await messageapi.getMessagesById(channelMessageId.message_id as string)
                console.log(message, "fetchMessagesss")

                if(message.in_channel){
                    fetchedMessages.push(message)
                }
            }

            setChannelMessages(fetchedMessages)

            console.log(fetchedMessages, "123")
            console.log(channelMessages, "why")
        }
        
        fetchMessages();

    }, [channelId, loggedInUser?.id])

    useEffect(() => {
        if(!getWsConnection().addEventListener) return;
        const messageCallback = (e) => {
            const dataRes = JSON.parse(e.data);
            if(dataRes.type !== "new_message"){
                return;
            }
            if(dataRes.message[0].from_users !== parseFloat(userId+"")){
                return;
            }
            const messageapi = new MessageAPI();
            messageapi.updateMessage(dataRes.message[0].id, {
                has_been_read: true
            })
            setMessages([
                ...messages,
               ...dataRes.message
            ])
        }
        getWsConnection()?.addEventListener("message", messageCallback);
        return () => {
            getWsConnection()?.removeEventListener("message", messageCallback)
        }
    }, [messages])

    useEffect(() => {
        const fetchChannels =  async () => {
            const channelapi = new ChannelAPI();
            const data = await  channelapi.getChannelById(channelId as string);
            console.log(data[0].name, "channel in mess")
            setChannel(data[0].name);
        }
        fetchChannels();

    }, [channelId])


    function handleSend(){
        console.log(data);
        const message = {
            "to_user" : userId,
            "message" : data,
            "is_in_channel": 0
        }
        setMessages([
            ...messages,
            {
                from_users: loggedInUser?.id,
                to_users: userId,
                message: data,
                in_channel: 0
            }
        ])
        getWsConnection().send(JSON.stringify({
            type: "send_message",
            data: {
                ...message
            }
        }))
        setData("");
        // const messageapi = new MessageAPI();
        // messageapi.sendMessages(message);
        // console.log(data);
    }

    const handleSendInChannel = async () => {
        const channelMessageApi = new ChannelMessageAPI();
        const messageApi = new MessageAPI();
        const message = {
            "from_users": loggedInUser?.id,
            "message" : data,
            "in_channel": 1
        }
        const sentMessage = await messageApi.sendMessages(message);
        const idMessage = await sentMessage.json();

        console.log(idMessage.id, "senddddMessssChh")

        setChannelMessages([
            ...channelMessages,
            {
                from_users: loggedInUser?.id,
                message: data,
                in_channel: 1
            }
        ])

        console.log(channelMessages, "handleeChan")
          
        // getWsConnection().send(JSON.stringify({
        //     type: "send_message",
        //     data: {
        //         ...message
        //     }
        // }))

        setData("");

    
        await channelMessageApi.createChannelMessage({
            channel_id: channelId,
            message_id: idMessage.id
        })
        
    }

    const handleEmoji = () => {    
        setShowPicker(!showPicker);      
    }

    const onEmojiClick = (e) => {
        console.log(e, "eveeent")
        console.log(e.emoji)

        if(!e.emoji){
            return;
        }
        const cursorPos = inputRef.current.selectionStart;
        const textBefore = data.substring(0, cursorPos);
        const textAfter = data.substring(cursorPos);
        const newInput = textBefore + e.emoji + textAfter;
        console.log(newInput)
        
        setData(newInput);

        // setEmoji(emojiObj);
        // console.log(emojiObj);
        setShowPicker(false);
    }

    const handleClickReaction = (messageId) => {
        setShowReaction(messageId);
    }

    const handleReaction = (reaction, messageId) => {
        console.log("reactionn")
        setReaction((prev) => ({...prev, [messageId]: reaction.emoji}));
        setShowReaction(null);

    }

    const addFile = () => {
        fileInputRef.current.click();
    }
    const handleFileChange = (e) => {
        const files = e.target.files;
        console.log(files)
    }

    return (
        <div className="container message-container">   
            {userId && (
                <>        
                <div className="message-inner-container">
                     
                    <div className="message-intro">
                        <span className="message-call">
                            <FontAwesomeIcon icon={faHeadphones}></FontAwesomeIcon>
                        </span>
                        <h3>{user?.firstname} {user?.lastname} {user?.status}</h3>
                        {messages.length < 15 ? <p>This is your very begining chat with {user?.firstname}</p> : ""}
                    </div>
           
                    <div className="message-content">
                        {messages.map((message) => (
                            <div >
                                <span className="message">
                                    {message.from_users == userId && <>
                                        <span className="message-user">
                                            <UserAvatar username={user?.firstname}></UserAvatar>{user?.firstname}
                                        </span>
                                        <span className="message-text" dangerouslySetInnerHTML={{__html: message["message"]}} />
                                    </>}
                                    {message.from_users != userId && <>
                                        <span className="message-user">
                                            <UserAvatar username="me"></UserAvatar>me 
                                        </span>
                                        <span className="message-text" dangerouslySetInnerHTML={{__html: message["message"]}} />
                                    </>}
                                </span>
                            </div>    
                        ))}
                    </div>
                </div>
                    <span className="send-group">
                        <span>
                            <FontAwesomeIcon icon={faFaceSmile} onClick={handleEmoji}>               
                            </FontAwesomeIcon>
                            {showPicker && <EmojiPicker onEmojiClick={onEmojiClick}></EmojiPicker>}
                        </span>
                        <input type="text" placeholder="Type a message..." className="send-input" value={data} ref={inputRef} onChange={(e) => {setData(e.target.value)}} />   
                        <span>
                            <FontAwesomeIcon icon={faPaperclip} onClick={addFile}></FontAwesomeIcon>
                            <input className="input-file" type="file" onChange={handleFileChange} ref={fileInputRef}/>

                        </span>             
                        <button onClick={handleSend} className="send-message">
                            <FontAwesomeIcon icon={faPaperPlane}></FontAwesomeIcon>
                        </button>
                    </span>
                </>
        )}

        {channelId && (
            <>
            
                <div className="message-inner-container">
                    <div className="message-intro">
                        <span className="message-call">
                            <FontAwesomeIcon icon={faHeadphones}></FontAwesomeIcon>
                        </span>
                        <h3>{channel}</h3>
                    </div>

                    <div className="message-content">
                        {channelMessages.map((message) => (
                            <div>
                                <span className="message">
                                    {message.from_users != loggedInUser.id && <>
                                        <span className="message-user">
                                            <UserAvatar username={user?.firstname}></UserAvatar>{user?.firstname}
                                        </span>
                                        <span className="message-text" dangerouslySetInnerHTML={{__html: message["message"]}} />
                                    </>}
                                    {message.from_users == loggedInUser.id && <>
                                        <span className="message-user">
                                            <UserAvatar username="me"></UserAvatar>me 
                                        </span>
                                        <span className="message-text" dangerouslySetInnerHTML={{__html: message["message"]}} />
                                    </>}
                                </span>
                            </div>    
                        ))}
                    </div>
                </div>

                <span className="send-group">
                            <span>
                                <FontAwesomeIcon icon={faFaceSmile} onClick={handleEmoji}>               
                                </FontAwesomeIcon>
                                {showPicker && <EmojiPicker onEmojiClick={onEmojiClick}></EmojiPicker>}
                            </span>
                            <input type="text" placeholder="Type a message..." className="send-input" value={data} ref={inputRef} onChange={(e) => {setData(e.target.value)}} />   
                            <span>
                                <FontAwesomeIcon icon={faPaperclip} onClick={addFile}></FontAwesomeIcon>
                                <input className="input-file" type="file" onChange={handleFileChange} ref={fileInputRef}/>

                            </span>             
                            <button onClick={handleSendInChannel} className="send-message">
                                <FontAwesomeIcon icon={faPaperPlane}></FontAwesomeIcon>
                            </button>
                        </span>
            </>


        )}
        </div>
    );
} 