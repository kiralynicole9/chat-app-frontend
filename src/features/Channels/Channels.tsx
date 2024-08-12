import { useEffect, useState } from "react";
import { ChannelAPI } from "../../API/ChannelAPI"
import './Channels.css'
import { ChannelModal } from "./ChannelModal";
import { getUserSession } from "../../UserSession";
import { ChannelMembersAPI } from "../../API/ChannelMembersAPI";
import { getWsConnection } from "../../API/WS";
import { useNavigate } from "react-router-dom";

export const Channels = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [channels, setChannels] = useState([]);
    const navigate = useNavigate();

    const handleModal = () => {
        setIsOpen(!isOpen);
    }

    const handleClose = () => {
        setIsOpen(false);
    }

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
                console.log(channel, "1channel")
                newChannels.push(newChannel)    
            }

            setChannels(newChannels);
            
        }
        fetchChannels();

        const eventCallback = async(e) => {
            const res = JSON.parse(e.data);
            if(res.type === "new_channel"){
                setChannels((prev) => [...prev, res.channel])
            }

        }
        
       getWsConnection().addEventListener("message", eventCallback);
        
       return () => {getWsConnection().removeEventListener("message", eventCallback)};
    
    }, [])

    return (
        <div>
            <span>Channels </span>
            <button className="channel-button" onClick={handleModal}>+</button>
            <ChannelModal isOpen={isOpen} onRequestClose={handleClose}></ChannelModal>
            {channels.map((channel) => (
                <li className = "channel-list" onClick={() => navigate(`/channels/${channel[0]?.id}`)}>
                    <div ># {channel?.[0]?.name}</div>

                </li>
            ))}

        
        </div>
    )
}