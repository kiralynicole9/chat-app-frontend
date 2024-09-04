import { useEffect, useState } from "react";
import { ChannelAPI } from "../../API/ChannelAPI";
import { ChannelMembersAPI } from "../../API/ChannelMembersAPI";
import { UserAPI } from "../../API/UserAPI";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import { useNavigate } from "react-router-dom";
import './ChannelSettings.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { AddPeoplePopUp } from "./AddPeoplePopUp";
import { getWsConnection } from "../../API/WS";

export const ChannelSettings = ({channelId}) => {
    const [channelName, setChannelName] = useState("");
    const [channelMembers, setChannelMembers] = useState([]);
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const fetchChannels = async() => {
            const channelapi = new ChannelAPI(); 
            const channel = await channelapi.getChannelById(channelId);
            setChannelName(channel[0].name)
        }

        fetchChannels();    

    }, [channelId]);


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
                membersArr.push(data);
            }

            setChannelMembers(membersArr);
        }

        fetchMembers();
    }, [channelId])

    useEffect(() => {

        const userapi = new UserAPI();

        const eventCallBack = async(e) => {
            const data = JSON.parse(e.data);
            if(data.type !== "update_channel_members"){
                return;
            }
            let membersArr = []
            for(const member of data.members){
                const data = await userapi.getUser(member.user_id);
                membersArr.push(data);
            }
            setChannelMembers(membersArr);
        }

        getWsConnection().addEventListener("message", eventCallBack);

        return () => {
            getWsConnection().removeEventListener("message", eventCallBack);
        }    

    
    }, [])

    const handleAddPeople = () => {
        setIsActive(true);
    }

    const handleClose = () => {
        console.log(isActive, "press cancel")
        setIsActive(false);
        console.log(isActive, "after setting false")
    }


    return (
        <div className="user-settings-container">
            
            <div className="user-settings-section">
                <p>Settings </p>
                <div className="user-settings-title">
                    Channel {channelName}
                </div>
                <div className="user-settings-details">
                    Members:
                </div>
                <div className="add-people" onClick={handleAddPeople}>
                    <FontAwesomeIcon icon={faUserPlus} className="add-button"></FontAwesomeIcon>
                    <span>Add people</span>
                </div>
                <div className="add-people">
                    <AddPeoplePopUp  isActive={isActive} onRequestClose={handleClose} channelId={channelId}></AddPeoplePopUp>
                </div>
                <ul className="channel-members-ul">
                    {channelMembers.map((member) => (
                        <li className="channel-members" onClick={() => navigate(`/${member.id}`)} >
                            <UserAvatar username={member.firstname}></UserAvatar>
                            <span >{member.firstname} {member.lastname}</span>
                            <span>
                            {member?.active==1 ? <span className="active-profile"></span> : <span className="inactive-profile"></span>}

                            </span>
                        </li>
                    ))}
                </ul>
            </div>

        </div>        
    );
}