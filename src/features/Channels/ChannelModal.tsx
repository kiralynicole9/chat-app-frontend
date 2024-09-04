import { useEffect, useState } from "react";
import { ChannelAPI } from "../../API/ChannelAPI";
import Modal from 'react-modal';
import { User, UserAPI } from "../../API/UserAPI";
import { ChannelMembersAPI } from "../../API/ChannelMembersAPI";


export const ChannelModal = ({isOpen, onRequestClose}) => {

    const [channelName, setChannelName] = useState('');
    const [members, setMembers] = useState([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {

        const fetchUsers = async () => {
            const userapi = new UserAPI();
            const data = await userapi.getUsers();
            const _users = await data.json();
            setUsers(_users);
        }

        if(isOpen){
            fetchUsers();
        }

    }, [isOpen])



    async function handleChannels(e){
        e.preventDefault();

        const channelapi = new ChannelAPI();
        const channelmembersapi = new ChannelMembersAPI();
        await channelapi.createChannel({name: channelName});

        const channels = await channelapi.getChannelId(channelName);
        console.log(channels[channels.length - 1].id, "channell id");

       for(const member of members){
        console.log(member, "aaaaaa")
            const newMember = await channelmembersapi.addMember({
                user_id: member,
                channel_id: channels[channels.length - 1].id
            })
            console.log(newMember)
       }        
        
    }

    function handleMembersChange(e){
        const value = parseInt(e.target.value, 10);
        console.log(value)
        setMembers((prevMembers) => e.target.checked ? [...prevMembers, value] : prevMembers.filter((id) => id !== value));
    }
  

    if(!isOpen){
        return null;
    }else{
        return(
            <div className="channel-modal">
                <div className="channel-modal-header">
                    <span className="channel-modal-title">Create a new Channel</span>
                    <button type="button" onClick={onRequestClose} className="channel-modal-button">X</button>
                </div>

                <form >
                    <div className="channel-modal-row">
                        <label htmlFor="channel-name">Name: </label>
                        <input type="text" value={channelName} name="channel-name" id="channel-name"  onChange={e => setChannelName(e.target.value)}  required/>
                    </div>
                    <div className="channel-modal-row">
                        <label  className="channel-members-label">Members:</label>
                        <span className="channel-members-list">
                            {users.map((user) => (
                                <span key={user.id}>
                                    <label  htmlFor={`member-${user.id}`}>
                                    <input type="checkbox" value={user.id} id={`member-${user.id}`} name={`member-${user.id}`} onChange={handleMembersChange}/>{user.firstname} {user.lastname}
                                    </label>
                                </span>
                            ))}
                        </span>
                    </div>
                    <div className="channel-modal-buttons">
                        <button className="channel-button-create" onClick={handleChannels}>Create Channel</button>
                        <button type="button" onClick={onRequestClose} className="channel-button-create">Cancel</button>

                    </div>
                </form>
            </div>
        )

}
}