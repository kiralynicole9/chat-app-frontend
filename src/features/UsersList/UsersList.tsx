import { User, UserAPI } from "../../API/UserAPI";
import { useContext, useEffect, useState } from "react";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import "./UsersList.css"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getWsConnection } from "../../API/WS";
import { MessageAPI } from "../../API/MessageAPI";
import { AuthContext } from "../../App";
import { NewMessageSound } from "../../sounds/NewMessageSound";
import { Channels } from "../Channels/Channels";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

type UsersListProps = {
    fieldName: string,
    secondFieldName: string,

}

export const UsersList = (props: UsersListProps) => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [userMessagesCount, setUserMessagesCount] = useState({});
    const {user: loggedInUser} = useContext(AuthContext);
    const {userId} = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const animateFunction = (user) => {

        setUsers((_users) => {
            const updatedUsers = _users.map((_user) => {
                if (user.id === _user.id){
                    return {
                        ..._user,
                        animate: false,
                    }
                }
                return _user;
            })
            return updatedUsers;
        })
    }

    useEffect(() => {
        setUserMessagesCount((prev) => {
            return {
                ...prev,
                [userId]: 0
            }
        })
    }, [userId])

    useEffect(() => {
        const userAPI = new UserAPI();
        userAPI.getUsers().then((res) => {
           return res.json()
        }).then((data) => {
            setUsers(data);
            setFilteredUsers(data);
        });   
    }, [])

    useEffect(() => {
        if(!loggedInUser?.id || !users.length){
            return;
        }
        const messageapi = new MessageAPI();
        messageapi.countMessagesFromUser(loggedInUser.id)
        .then((res) => res.json())
        .then((messagesCount) => {
            const messToUserCount = messagesCount.map((mess) => {
                return {
                    [mess.from_users]: mess.messages
                }
            })
            .reduce((acc,current) => {
                return {
                    ...acc,
                    ...current
                }
            }, {})
            setUserMessagesCount(messToUserCount);
        });
        
    }, [users, loggedInUser])

    useEffect(()=>{
        const eventCallback = (e) => {
            const data = JSON.parse(e.data);

            if (data.type === "new_message_count") {
                NewMessageSound.play();
                setUserMessagesCount((prev) => {
                    return {
                        ...prev,
                        [data.from_user]: prev[data.from_user] + 1
                    }
                });

                setUsers((_users) => {
                    const updatedUsers = _users.map((user) => {
                        if(user.id === data.from_user){
                            return {
                                ...user,
                                animate: true
                            }
                        }
                        return user;
                    })
                    return updatedUsers;
                });
            }

            if(data.type !== "users_status_update"){  
                return;
            }
            const payload = data.data
            const updatedUsers = users.map((user: User) => {
                if(user.id === payload.userId) {
                    return {
                        ...user,
                        status: payload.status,
                        animate: true

                    }
                }
                return {...user, animate:false};
            });
            setFilteredUsers(updatedUsers); //
            setUsers(updatedUsers)
        }
        getWsConnection().addEventListener("message", eventCallback);
        return () => {
            getWsConnection().removeEventListener("message", eventCallback);
        }
    }, [users])

    useEffect(() => {
        const eventCallback = (e) => {
            const data = JSON.parse(e.data);
            if(data.type !== "user_online" && data.type !== "user_offline"){  
                return;
            }
            
            setUsers((_users) => {
                let active = true;
                if(data.type === "user_offline"){
                    active = false
                }
                const payload = data.data
                const updatedUsers = _users.map((user: User) => {
                    if(user.id === payload.userId) {
                        return {
                            ...user,
                            animate: true,
                            active
    
                        }
                    }
                    return {...user, animate:false};
                });
                setFilteredUsers(updatedUsers); //
                return updatedUsers;
            })
        }

        getWsConnection().addEventListener("message", eventCallback);

        return () => {
            getWsConnection().removeEventListener("message", eventCallback);
        }
    }, [users])  
    
    useEffect(() => {
        if(!searchTerm){
            setFilteredUsers(users);
        }else{
            setFilteredUsers(users.filter((user) => {
                return (
                    user[props.fieldName].toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user[props.secondFieldName].toLowerCase().includes(searchTerm.toLowerCase())
                )
            }))
        }
    }, [searchTerm, users])

    const getMessagesCount = (userId: number) => {
        return userMessagesCount[userId] || null;
    }

    return(
        <div>
            <div className="users-list-search">
                <FontAwesomeIcon icon={faMagnifyingGlass}></FontAwesomeIcon>
                <input className="users-list-input-search" type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <Channels searchTerm={searchTerm}></Channels>
            <div className="dm">Direct messages</div>
            <ul className="users-list">
                {filteredUsers.map((user) => (
                    <li onClick={() => navigate(`/${user.id}`)} className={`users-list-item${user.active ? " user-active" : ""}${user.animate ? " user-animate" : ""}${getMessagesCount(user.id) > 0 || user.id === parseFloat(userId) ? ' highlight': ''}`} onAnimationEnd={() => animateFunction(user)} >
                        <span>
                            <UserAvatar username={user[props.fieldName]} image={user?.img}></UserAvatar>
                            <span>
                                {user[props.fieldName]} {user[props.secondFieldName]} 
                                <span className="user-status">{user?.status}</span>
                            </span>
                        </span>
                        {getMessagesCount(user.id) ? <span className="messages-counter">{getMessagesCount(user.id)}</span> : null}
                    </li>
                ))}
            </ul>
        </div>
    )
    
}