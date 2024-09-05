import { MessageAPI } from "../../API/MessageAPI";
import { useContext, useRef, useState } from "react";
import { useEffect } from "react";
import "./Message.css"
import { json, useParams } from "react-router-dom";
import { UserAPI } from "../../API/UserAPI";
import { User } from "../../API/UserAPI";
import { AuthContext } from "../../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faFaceSmile, faHeadphones, faPaperPlane, faPaperclip, faPhone, faPlane } from "@fortawesome/free-solid-svg-icons";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import EmojiPicker, { Emoji, EmojiClickData } from "emoji-picker-react";
import { getWsConnection } from "../../API/WS";
import { ChannelAPI } from "../../API/ChannelAPI";
import { ChannelMessageAPI } from "../../API/ChannelMessageAPI";
import { VideoCall } from "../Call/VideoCall";
import { IncomingCallPopUp } from "../Call/IncomingCallPopUp";
import { UserSettings } from "../UserSettings/UserSettings";
import { ChannelSettings } from "../ChannelSettings/ChannelSettings";
import { ReactionAPI } from "../../API/ReactionAPI";
import { ChannelMembersAPI } from "../../API/ChannelMembersAPI";
import { MessagesStatusAPI } from "../../API/MessagesStatusAPI";

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
    const [showPicker, setShowPicker] = useState(false);
    const [reaction, setReaction] = useState([]);
    const [channelMembers, setChannelMembers] = useState([]);
    const [channel, setChannel] = useState("");
    const[channelMessages, setChannelMessages] = useState([]);
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null> (null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [showIncomingCall, setShowIncomingCall] = useState(false);
    const [iceCandidateQueue, setIceCandidateQueue] = useState([]);
    const [isCallEnded, setIsCallEnded] = useState(false);
    const [inSettings, setInSettings] = useState(false);
    const [activeEmojiPicker, setActiveEmojiPicker] = useState(null);


    const iceServers = {
        iceServers: [
            {
                urls: "stun:stun.l.google.com:19302"
            }
        ]
    };

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
        let usersMap = new Map(); 
        const userapi = new UserAPI();

        const fetchMessages = async () => {
            const channelMessageApi = new ChannelMessageAPI();
            const messageapi = new MessageAPI();
            const channelMessagesIds = await channelMessageApi.getMessagesIds(channelId as string);
            console.log(channelMessagesIds.channelMessages, ";;")

            let fetchedMessages = []

            for(const channelMessageId of channelMessagesIds.channelMessages){

                const message = await messageapi.getMessagesById(channelMessageId.message_id as string)
                console.log(message, "fetchMessagesss")

                messageapi.updateMessage(message.id, 
                    {has_been_read: true}
                )

                if(message.in_channel){

                    let _user;

                    if(usersMap.has(message.from_users)){
                        _user = usersMap.get(message.from_users);
                        console.log(_user, "user from map")
                    }else{
                        _user = await userapi.getUser(message.from_users)
                        usersMap.set(message.from_users, _user);
                    }

                    fetchedMessages.push({
                        ...message,
                        _user
                    });
                }
            }

            setChannelMessages(fetchedMessages)
        }
        
        fetchMessages();

        const eventCallback = async(e) => {
            const res = JSON.parse(e.data);
            const messageapi = new MessageAPI();
            if(res.type === "new_channel_message" && res.message.in_channel && res.channel_id === channelId){
                let _user;
                if(usersMap.has(res.message.from_users)){
                    _user = usersMap.get(res.message.from_users);
                }else{
                    _user = await userapi.getUser(res.message.from_users);
                    usersMap.set(res.message.from_users, _user);
                }
                
                messageapi.updateMessage(res.message.id, {
                    has_been_read: true
                })
                setChannelMessages((prev) => [...prev, 
                    {...res.message,
                    _user}]);
            }
        }

        getWsConnection().addEventListener("message", eventCallback);

        return () => {getWsConnection().removeEventListener("message", eventCallback)}
 
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
   

    useEffect(() => {
        if(!getWsConnection().addEventListener) return;

        const eventCallback = async (e) => {
            const res = JSON.parse(e.data);
            

            switch(res.type){
                case "offer": 
                
                    if(res.to_user == loggedInUser?.id){
                        setShowIncomingCall(true);

                        console.log(loggedInUser, "verify incoming call");
                        
                        const pc = new RTCPeerConnection(iceServers);
                        console.log("offer", pc)

                        setPeerConnection(pc);

                        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                        setLocalStream(stream);

                        stream.getTracks().forEach(track => {
                            console.log(track, stream, "view tracks")
                            pc.addTrack(track, stream)
                    });

                    console.log("before ice candidates")
                    
                    pc.onicecandidate = e => {
                        if(e.candidate) {
                            getWsConnection().send(JSON.stringify({
                                type: "ice-candidate",
                                candidate: e.candidate,
                                from_user: loggedInUser?.id,
                                to_user: res.from_user

                            }))

                            console.log('Sent ICE candidate:', e.candidate);

                        }
                        
                    }

                    console.log("after ice candidates")

                    pc.ontrack = e => {
                        console.log(e.streams, "eee")
                        const [remoteStream] = e.streams;
                        console.log(remoteStream, "uuuuuuu")
                        setRemoteStream(remoteStream);
                    }
                    console.log("end offer", remoteStream)


                        await pc.setRemoteDescription(new RTCSessionDescription(res.offer))
                        console.log(pc.remoteDescription, "set remote description")

                        iceCandidateQueue.forEach(candidate => pc.addIceCandidate(candidate));
                        console.log(iceCandidateQueue, "queue")
                        setIceCandidateQueue([]); 

                        const answer = await pc.createAnswer();
                        await pc.setLocalDescription(answer);

                        
                        getWsConnection().send(JSON.stringify({
                            type: "answer",
                            answer,
                            from_user: loggedInUser?.id,
                            to_user: res.from_user
                        }));


                        console.log(remoteStream, "remotestream before ontrack");

                        setIsCallActive(true);

                    }
                    break;

                case "answer":
                    console.log("answer", peerConnection)
                    if(peerConnection && res.to_user == loggedInUser?.id){
                        await peerConnection.setRemoteDescription(new RTCSessionDescription(res.answer))

                        console.log(peerConnection.remoteDescription, "in answer");

                        console.log("answer for remotestream", remoteStream)
                    
                        peerConnection.ontrack = (event) => {
                            const [stream] = event.streams;
                            console.log("stream", stream)
                            setRemoteStream(stream); 
                        };

                        console.log('end answer');
                    }
                    break;

                case "ice-candidate":
                    console.log("ice candidate case", peerConnection)
                    if(peerConnection && res.to_user == loggedInUser?.id){
                        console.log('Received ICE candidate:', res.candidate);

                        if(peerConnection.remoteDescription){
                            await peerConnection.addIceCandidate(new RTCIceCandidate(res.candidate))
                        }
                        else{
                            setIceCandidateQueue(prev => [...prev, new RTCIceCandidate(res.candidate)]);

                        }
                        console.log(iceCandidateQueue, "???");
                    }
                    break;

                case "end-call":
                    if(!isCallEnded){
                        handleEndCall();
                    }
                    break;
                    
                default: break;    

            }
    }
    getWsConnection().addEventListener("message", eventCallback);
    return () => {
        getWsConnection().removeEventListener("message", eventCallback);
    }
    }, [loggedInUser?.id, peerConnection])

    useEffect(() => {
        
        const fetchReactions = async() => {
            const reactionapi = new ReactionAPI();
            const data = await reactionapi.getReactions();
            const reactions = await data.json();
            //console.log(reactions, "\\");
            //setReaction(reactions);

            const objs = {}

            reactions.forEach(r => {
                const key = `${r.message_id}-${r.reaction}`;
                if(!objs[key]){
                    objs[key] = {
                        count: 0,
                        users: [],
                        emoji: r.reaction
                    }
                }

                if(!objs[key].users.includes(r.user_id)){
                    objs[key].users.push(r.user_id);
                    objs[key].count++;
                }
            })
            setReaction(objs);
        }

        fetchReactions();
    }, [])

    useEffect(() => {
        const eventCallBack = (e) => {
            const res = JSON.parse(e.data);
            console.log(res, "\\//")
            if (res.type != "new_reaction"){
                return;
            }
            setReaction((prev) => {
                const key = `${res.createdReaction.message_id}-${res.createdReaction.reaction}`;
                const reactionContent = prev[key] || {count: 0, users: [], emoji: res.createdReaction.reaction};

                if (!reactionContent.users.includes(res.createdReaction.user_id)){
                    return {
                        ...prev,
                        [key]: {
                            ...reactionContent,
                            count: reactionContent.count + 1,
                            users: [...reactionContent.users, res.createdReaction.user_id]
                        }
                    }
                }

                return prev;

            })
            

        }

        getWsConnection().addEventListener("message", eventCallBack);

        return () => {
            getWsConnection().removeEventListener("message", eventCallBack);
        }
    }, [loggedInUser?.id])

    useEffect(() => {
        const fetchChannelMembers = async() => {
            const channelMembersAPI = new ChannelMembersAPI();
            const userapi = new UserAPI();
            const members = await channelMembersAPI.getMembersByChannelId(channelId as string);
            console.log(members, "aaa")

            let arr = [];
            for(const member of members.members){
                const user = await userapi.getUser(member.user_id);
                arr.push({
                    user_id: member.user_id,
                    user_firstname: user.firstname
                })
            }

            console.log(arr, "--")
            setChannelMembers([...arr]);

        }

        fetchChannelMembers();
        console.log(channelMembers, "aaaa")

    }, [channelId, loggedInUser?.id])


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
        const messageStatusAPI = new MessagesStatusAPI();

        const messageApi = new MessageAPI();
        const message = {
            "from_users": loggedInUser?.id,
            "message" : data,
            "in_channel": 1,
            "channel_id": channelId
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

         setData("");

    
        await channelMessageApi.createChannelMessage({
            channel_id: channelId,
            message_id: idMessage.id
        })

        for(const channelMember of channelMembers){
            if(channelMember.user_id != loggedInUser?.id){
                await messageStatusAPI.createMessageStatus({
                    message_id: idMessage.id,
                    user_id: channelMember.user_id
                })

            }

        }
        
    }

    const handleToggleEmojiPicker = (messageId) => {
        setActiveEmojiPicker(prevId => prevId === messageId ? null : messageId);

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


    const handleReaction = async(_reaction) => {
        console.log(_reaction.emoji, "__")
        const reactionapi = new ReactionAPI();
        const reactionKey = `${activeEmojiPicker}-${_reaction.emoji}`
        let currentReaction = reaction[reactionKey];

        if(currentReaction && currentReaction.users.includes(loggedInUser?.id)){
            return;
        }

        let newReaction;
        if(userId){
            newReaction = {
                to_user: userId,
                message_id: activeEmojiPicker,
                user_id: loggedInUser?.id,
                reaction: _reaction.emoji
            }
        }else if(channelId){
            newReaction = {
                channel_id: channelId,
                message_id: activeEmojiPicker,
                user_id: loggedInUser?.id,
                reaction: _reaction.emoji
            }
        }

        const res = await reactionapi.createReaction(newReaction);

        const data = await res.json();

        if(data){
            const updatedReaction = {
                ...currentReaction,
                count: currentReaction ? currentReaction.count + 1 : 1,
                users: currentReaction ? [...currentReaction.users, loggedInUser?.id] : [loggedInUser?.id],
                emoji: _reaction.emoji
            }

            setReaction(prev => ({
                ...prev,
                [reactionKey]: updatedReaction
            }));
        }
    
        setActiveEmojiPicker(null);
        console.log(activeEmojiPicker)

        // const existingReaction = reaction.find(r => r.message_id == activeEmojiPicker &&
        //     r.user_id == loggedInUser?.id &&
        //     r.reaction == _reaction.emoji
        // );

        // if(!existingReaction){
        //     const res = await reactionapi.createReaction({
        //         message_id: activeEmojiPicker,
        //         user_id: loggedInUser?.id,
        //         reaction: _reaction.emoji
        //     })
        //     const data = await res.json()
    
        //     setReaction((prev) => [
        //         ...prev,
        //         data
        //     ]);
        // }

    }


    const addFile = () => {
        fileInputRef.current.click();
    }
    const handleFileChange = (e) => {
        const files = e.target.files[0];
        console.log(files)
    }

    const handleStartCall = async () => {
        setIsCallEnded(false);

        const pc = new RTCPeerConnection(iceServers);
        setPeerConnection(pc);

        try{
            const stream = await navigator.mediaDevices.getUserMedia({video:true, audio:true});
            setLocalStream(stream);

            //adding tracks to the peer connection
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            //create an offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            getWsConnection().send(JSON.stringify({
                type:"offer",
                offer,
                from_user: loggedInUser?.id,
                to_user: userId
            }))
        }catch(error){
            console.log("Error starting call", error);
        }

        setIsCallActive(true);

        pc.onicecandidate = e => {
            if(e.candidate){
                getWsConnection().send(JSON.stringify({
                    type: "ice-candidate",
                    candidate: e.candidate,
                    from_user: loggedInUser?.id,
                    to_user: userId
                }))
            }
        }

        //for remote server
        pc.ontrack = e => {
            const [remoteStream] = e.streams;
            console.log(remoteStream, "ooooooooo")
            setRemoteStream(remoteStream);
        }
    }

    const handleClickReaction = async(emoji, messageId) => {
        const reactionapi = new ReactionAPI();

        const key = `${messageId}-${emoji}`;
        let currentReaction = reaction[key];

        if(currentReaction && currentReaction.users.includes(loggedInUser?.id)){
            return;
        }

        let newReaction;
        if(userId){
            newReaction = {
                to_user: userId,
                message_id: messageId,
                user_id: loggedInUser?.id,
                reaction: emoji
            }

        }else if(channelId){
            newReaction = {
                channel_id: channelId,
                message_id: messageId,
                user_id: loggedInUser?.id,
                reaction: emoji
            }
        }


        const res = await reactionapi.createReaction(newReaction);
        const data = await res.json();

        if(data){
            const updatedReaction = {
                ...currentReaction,
                count: currentReaction ? currentReaction.count+1 : 1,
                users: currentReaction ? [...currentReaction.users, loggedInUser?.id] : loggedInUser?.id,
                emoji: emoji
            }

            setReaction(prev => ({
                ...prev,
                [key]: updatedReaction
            }))
        }
    }

    const renderReactions = (messageId) => {
        const userapi = new UserAPI();
        if(userId){
            return Object.entries(reaction).map(([key,value]) => {
                if(key.startsWith(messageId + '-')){
                    const userNames = value.users.map(id => 
                        id == userId ? user?.firstname : loggedInUser?.firstname
                    );
    
                    const names = userNames.join(', ')
                    console.log(names, "?")
                    return <span key={key} onClick={() => handleClickReaction(value.emoji, messageId)} className="reaction" title={names} >{value.emoji} {value.count}</span>
                }
            })
        }else if(channelId){
            return Object.entries(reaction).map( ([key,value]) => {
                if(key.startsWith(messageId + "-")) {

                    console.log(channelMembers, ">>>")

                    const userNames = value.users.map(id => {
                        const member = channelMembers.find(member => member.user_id == id);
                        return member?.user_firstname
                    }
                    );
    
                    const names = userNames.join(', ')
                    console.log(names, "?")
                    return <span key={key} onClick={() => handleClickReaction(value.emoji, messageId)} className="reaction" title={names}>{value.emoji} {value.count}</span>
                }
            })
        }
    }


    const handleEndCall = () => {
        if(isCallEnded) return;

        setShowIncomingCall(false);

        setIsCallEnded(true);

        if(peerConnection){
            peerConnection.close();
            setPeerConnection(null);
        }

        if(localStream){
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }

        if(remoteStream){
            remoteStream.getTracks().forEach(track => track.stop());
            setRemoteStream(null);
        }

        peerConnection?.close();
        setPeerConnection(null)

        getWsConnection().send(JSON.stringify({
            type:'end-call',
            from_user: loggedInUser?.id,
            to_user: userId
        }))

        setIsCallActive(false);
    }

    const handleSettings = () => {
        setInSettings((prev) => !prev);
    }

    return (
        <div className="container message-container">   
            {userId && (
                <>        
                <div className="message-inner-container">
                     
                    <div className="message-intro">
                        <span className="message-call">
                            <FontAwesomeIcon onClick={handleStartCall} icon={faHeadphones}></FontAwesomeIcon>
                            <FontAwesomeIcon  onClick={handleSettings} icon={faBars} className="message-call-icon"></FontAwesomeIcon>
                        </span>
                        {inSettings && <UserSettings userId={userId}></UserSettings>}
                        {showIncomingCall && <IncomingCallPopUp showIncomingCall={showIncomingCall} caller={user?.firstname} onClose={handleEndCall} onAccept={() => {setIsCallActive(true); setShowIncomingCall(false)}}></IncomingCallPopUp>}
                        {isCallActive && <VideoCall localStream={localStream} remoteStream={remoteStream} onClose={handleEndCall} ></VideoCall>}

                        <h3>{user?.firstname} {user?.lastname} {user?.status}</h3>
                        {messages.length < 15 ? <p>This is your very begining chat with {user?.firstname}</p> : ""}

                    </div>
           
                    <div className="message-content">
                        {messages.map((message) => (
                            <div className="message-row">
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
                                <span onClick={() => handleToggleEmojiPicker(message.id)}>+</span>
                                {/* {reaction.map((r) => (
                                    r.message_id == message.id ? <span>{r?.reaction}</span> : ""

                                ))} */}
                                <div className="message-reactions" key={message.id}>{renderReactions(message.id)}</div>
                                {activeEmojiPicker === message.id && <EmojiPicker reactionsDefaultOpen={true} onReactionClick={handleReaction} onEmojiClick={handleReaction}/>}
                            </div>    
                        ))}
                    </div>
                </div>
                    <span className="send-group">
                        <span>
                            <FontAwesomeIcon icon={faFaceSmile} onClick={handleEmoji}>               
                            </FontAwesomeIcon>
                            {showPicker && <EmojiPicker className="emoji-picker" onEmojiClick={onEmojiClick}></EmojiPicker>}
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
                            <FontAwesomeIcon onClick={handleStartCall} icon={faHeadphones} className="message-call-icon"></FontAwesomeIcon>
                            <FontAwesomeIcon  onClick={handleSettings} icon={faBars} className="message-call-icon"></FontAwesomeIcon>
                        </span>
                        {/* {isCallActive && <VideoCall localStream={localStream} remoteStream={remoteStream}  ></VideoCall>} */}
                        {inSettings && <ChannelSettings channelId={channelId}></ChannelSettings>}
                        <h3>{channel}</h3>
                        
                    </div>

                    <div className="message-content">
                        {channelMessages.map((message) => (
                            <div>
                                <span className="message">
                                    {message.from_users != loggedInUser.id && <>
                                        <span className="message-user">
                                            <UserAvatar username={message?._user?.firstname}></UserAvatar>{message?._user?.firstname}
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

                                <span onClick={() => handleToggleEmojiPicker(message.id)}>+</span>

                                {/* {reaction.map((r) => (
                                    r.message_id == message.id ? <span>{r?.reaction}</span> : ""

                                ))} */}
                                <div className="message-reactions" key={message.id}>{renderReactions(message.id)}</div>
                                {activeEmojiPicker === message.id && <EmojiPicker reactionsDefaultOpen={true} onReactionClick={handleReaction} onEmojiClick={handleReaction}/>}
                            </div>    
                        ))}
                    </div>
                </div>

                <span className="send-group">
                            <span>
                                <FontAwesomeIcon icon={faFaceSmile} onClick={handleEmoji}>               
                                </FontAwesomeIcon>
                                {showPicker && <EmojiPicker className="emoji-picker" onEmojiClick={onEmojiClick}></EmojiPicker>}
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