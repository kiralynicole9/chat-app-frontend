import { MessageAPI } from "../../API/MessageAPI";
import { useContext, useRef, useState } from "react";
import { useEffect } from "react";
import "./Message.css"
import { useParams } from "react-router-dom";
import { UserAPI } from "../../API/UserAPI";
import { User } from "../../API/UserAPI";
import { AuthContext } from "../../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faFaceSmile, faHeadphones, faPaperPlane, faPaperclip, faPhone, faPlane } from "@fortawesome/free-solid-svg-icons";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { getWsConnection } from "../../API/WS";
import { ChannelAPI } from "../../API/ChannelAPI";
import { ChannelMessageAPI } from "../../API/ChannelMessageAPI";
import { ChannelMembersAPI } from "../../API/ChannelMembersAPI";
import { VideoCall } from "../Call/VideoCall";
import { IncomingCallPopUp } from "../Call/IncomingCallPopUp";
import { UserSettings } from "../UserSettings/UserSettings";

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
    const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null> (null);
    const [isCallActive, setIsCallActive] = useState(false);
    const [channelMembers, setChannelMembers] = useState([]);
    const [showIncomingCall, setShowIncomingCall] = useState(false);
    const [iceCandidateQueue, setIceCandidateQueue] = useState([]);
    const [isCallEnded, setIsCallEnded] = useState(false);
    const [inSettings, setInSettings] = useState(false);


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

            console.log(fetchedMessages, "123")
            console.log(channelMessages, "why")
        }
        
        fetchMessages();

        const eventCallback = async(e) => {
            const res = JSON.parse(e.data);
            if(res.type === "new_channel_message" && res.message.in_channel && res.channel_id === channelId){
                let _user;
                if(usersMap.has(res.message.from_users)){
                    _user = usersMap.get(res.message.from_users);
                }else{
                    _user = await userapi.getUser(res.message.from_users);
                    usersMap.set(res.message.from_users, _user);
                }
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
        if(!channelId){
            return;
        }
        const fetchMembers = async() => {
            const channelMembersApi = new ChannelMembersAPI();
            const userapi = new UserAPI();
            const members = await channelMembersApi.getMembersByChannelId(channelId);
            console.log(members.members, "channeeel memberss");

            let membersArr = []
            for(const member of members.members){
                console.log(member, "ppp");
                const data = await userapi.getUser(member.user_id);
                console.log(data, "nimi");
                const name = data.firstname + " " + data.lastname;
                console.log(name, "ki");
                membersArr.push(name);
            }

            setChannelMembers(membersArr);
        }

        fetchMembers();
    }, [channelId])

   

    useEffect(() => {
        if(!getWsConnection().addEventListener) return;

        const eventCallback = async (e) => {
            const res = JSON.parse(e.data);
            console.log(res, "parsedData in front")

            switch(res.type){
                case "offer": 
                console.log("are u here", loggedInUser.id)
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
                            <FontAwesomeIcon onClick={handleStartCall} icon={faHeadphones} className="message-call-icon"></FontAwesomeIcon>
                            <FontAwesomeIcon  onClick={handleSettings} icon={faBars} className="message-call-icon"></FontAwesomeIcon>
                        </span>
                        {/* {isCallActive && <VideoCall localStream={localStream} remoteStream={remoteStream}  ></VideoCall>} */}
                        <h3>{channel}</h3>
                        <ul>
                            {channelMembers.map((member) => (
                                <li className="channel-members">{member}</li>
                            ))}
                        </ul>
                        
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