import { useContext, useEffect, useState } from "react";
import { ChannelAPI } from "../../API/ChannelAPI"
import './Channels.css'
import { ChannelModal } from "./ChannelModal";
import { getUserSession } from "../../UserSession";
import { ChannelMembersAPI } from "../../API/ChannelMembersAPI";
import { getWsConnection } from "../../API/WS";
import { useNavigate, useParams } from "react-router-dom";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import { AuthContext } from "../../App";
import { MessagesStatusAPI } from "../../API/MessagesStatusAPI";

export const Channels = ({searchTerm}) => {
    const {channelId} = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const [channels, setChannels] = useState([]);
    const [filteredChannels, setFilteredChannels] = useState([]);
    const [channelMessagesCount, setChannelMessagesCount] = useState({});
    const {user: loggedInUser} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleModal = () => {
        setIsOpen(!isOpen);
    }

    const handleClose = () => {
        setIsOpen(false);
    }

    useEffect(() => {
        setChannelMessagesCount((prev) => {
            return {
            ...prev,
            [channelId]: 0
                
            } 
        })
    }, [channelId])

    useEffect(() => {
        if(!loggedInUser?.id){
            return;
        }

        const messagesStatusAPI = new MessagesStatusAPI();
        messagesStatusAPI.countMessagesFromChannel(loggedInUser?.id)
        .then((res) => res.json())
        .then((messagesCount) => {
            const messCount = messagesCount.map((mess) => {
                return {
                    [mess.channel_id]: mess.messages
                }
            })
            .reduce((acc,current) => {
                return {
                    ...acc,
                    ...current
                }
            }, {})
            setChannelMessagesCount(messCount);
        })
    }, [channels, loggedInUser])

    useEffect(() => {

        const fetchChannels = async() => {
            const loggedInUser = getUserSession();
            console.log(loggedInUser.id, "lll")

            const channelMembersAPI = new ChannelMembersAPI();
            const channelsAPI = new ChannelAPI();

           const data = await channelMembersAPI.getChannelByMemberId(loggedInUser.id as string); 
           const newChannels = [];
            console.log(data.channels, "33")            

            for(const channel of data.channels){
                console.log(channel, "www");
                const newChannel = await channelsAPI.getChannelById(channel.channel_id);
                console.log(newChannel, "1channel")
                newChannels.push(newChannel)    
            }

            setChannels(newChannels);
            setFilteredChannels(newChannels);
            
        }
        fetchChannels();

        const eventCallback = async(e) => {
            const res = JSON.parse(e.data);
            if(res.type === "new_channel"){
                setChannels((prev) => [...prev, res.channel])
                setFilteredChannels((prev) => [...prev, res.channel])
            }

        }
        
       getWsConnection().addEventListener("message", eventCallback);
        
       return () => {getWsConnection().removeEventListener("message", eventCallback)};
    
    }, [])

    useEffect(() => {
        if(!searchTerm){
            setFilteredChannels(channels);
        }else{
            setFilteredChannels(channels.filter((channel) => {
                return (
                    channel?.[0]?.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            }))
        }
    }, [searchTerm, channels])

    useEffect(() => {
        const eventCallBack = (e) => {
            const data = JSON.parse(e.data);

            if(data.type === "new_channel_message_count"){
                setChannelMessagesCount((prev) => {
                   return {
                    ...prev,
                    [data.channel_id]: prev[data.channel_id] + 1
                   }
                });
            }
        }

        getWsConnection().addEventListener("message", eventCallBack);

        return () => {
            getWsConnection().removeEventListener("message", eventCallBack)
        }

    }, [channels])

    const getMessagesCount = (channelId) => {
        return channelMessagesCount[channelId] || null;
    }


    return (
        <div>
            <span className="dm">Channels </span>
            <button className="channel-button" onClick={handleModal}>+</button>
            <ChannelModal isOpen={isOpen} onRequestClose={handleClose}></ChannelModal>
            <ul className="channels-list">
                {filteredChannels.map((channel) => (
                    <li className = "channel-list-item" onClick={() => navigate(`/channels/${channel[0]?.id}`)}>
                        <span>
                            <UserAvatar username="#"></UserAvatar>
                            <span>{channel?.[0]?.name}</span>
                        </span>
                        {getMessagesCount(channel?.[0].id) ? <span className="messages-counter">{getMessagesCount(channel[0]?.id)}</span> : null}

                    </li>
                ))}

            </ul>

        
        </div>
    )
}