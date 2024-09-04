import { useEffect, useState } from 'react'
import './AddPeoplePopUp.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { User, UserAPI } from '../../API/UserAPI';
import { ChannelMembersAPI } from '../../API/ChannelMembersAPI';
export const AddPeoplePopUp = ({isActive, onRequestClose, channelId}) => {
    const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        const userapi = new UserAPI();
        const channelmembersapi = new ChannelMembersAPI();

        const data = await userapi.getUsers();
        let _users = await data.json();
        const channelMembers = await channelmembersapi.getMembersByChannelId(channelId);
        console.log(channelMembers, "\\")
        for(const channelMember of channelMembers.members){
            _users =  _users.filter((_user) => _user.id != channelMember.user_id)
            console.log(_users, "aaaaa")

        }
        console.log(_users, "aaaaa")
        setUsers(_users);
        setFilteredMembers(_users);
    }
    useEffect(() => {

        fetchUsers();
    }, [isActive])

    useEffect(() => {
        if(!searchTerm){
            setFilteredMembers(users);
        }else{
            setFilteredMembers(users.filter((user) => {
                return (
                    user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.lastname.toLowerCase().includes(searchTerm.toLowerCase())
                )
            }))
        }
    }, [searchTerm, users])

    const handleAddMembers = async (e) => {
        e.preventDefault();

        const channelmembersapi = new ChannelMembersAPI();
        for(const member of members){
            await channelmembersapi.addMember({
                user_id: member,
                channel_id: channelId
            });

        }
        onRequestClose();
    }

    function handleMembersChange(e){
        const value = parseInt(e.target.value, 10);
        console.log(value)
        setMembers((prevMembers) => e.target.checked ? [...prevMembers, value] : prevMembers.filter((id) => id !== value));
    }


    if(!isActive){
        return null;
    }else{
        return (
            <div className="add-people-popup">
                <div className='search-people'>
                    <div>
                        <FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>
                        <input type="text" className='users-list-input-search add' placeholder='Search...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button className='channel-modal-button' onClick={onRequestClose}>X</button>
                </div>
                <div className='users-list-popup'>
                    {filteredMembers.map((user) => (
                        <span key={user.id}>
                            <label  htmlFor={`member-${user.id}`}>
                            <input type="checkbox" value={user.id} id={`member-${user.id}`} name={`member-${user.id}`} onChange={handleMembersChange}/>{user.firstname} {user.lastname}
                            </label>
                        </span>
                    ))}
                </div>
                <div className='channel-modal-buttons'>
                    <button className='channel-button-create' onClick={handleAddMembers}>Add</button>
                    <button className='channel-button-create' onClick={onRequestClose}>Cancel</button>
                </div>
            </div>
        )
    }

    }