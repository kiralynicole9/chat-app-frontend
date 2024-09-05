import { useEffect, useState } from "react";
import { ChannelAPI } from "../../API/ChannelAPI"
import './Channels.css'
import { ChannelModal } from "./ChannelModal";
import { getUserSession } from "../../UserSession";
import { ChannelMembersAPI } from "../../API/ChannelMembersAPI";
import { getWsConnection } from "../../API/WS";
import { useNavigate } from "react-router-dom";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";

export const Channels = ({searchTerm}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [channels, setChannels] = useState([]);
    const [filteredChannels, setFilteredChannels] = useState([]);
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

                    </li>
                ))}

            </ul>

        
        </div>
    )
}