import { User, UserAPI } from "../../API/UserAPI";
import { useContext, useEffect, useState } from "react";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import "./UsersList.css"
import { Link } from "react-router-dom";
import { getWsConnection } from "../../API/WS";
import { MessageAPI } from "../../API/MessageAPI";
import { AuthContext } from "../../App";
type UsersListProps = {
    fieldName: string,
    secondFieldName: string
}
export const UsersList = (props: UsersListProps) => {
    const [users, setUsers] = useState<User[]>([]);
    const [userMessagesCount, setUserMessagesCount] = useState({});
    const {user: loggedInUser} = useContext(AuthContext);


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
        const userAPI = new UserAPI();
        userAPI.getUsers().then((res) => {
           return res.json()
        }).then((data) => {
            setUsers(data);
            console.log(users, "users listtt");
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
                return updatedUsers;
            })
        }

        getWsConnection().addEventListener("message", eventCallback);

        return () => {
            getWsConnection().removeEventListener("message", eventCallback);
        }
    }, [users])

    

    return(
        <div>
            <ul className="users-list">
                {users.map((user) => (
                    <li class= {`users-list-item${user.active ? " user-active" : ""}${user.animate ? " user-animate" : ""}`} onAnimationEnd={() => animateFunction(user)} >
                        <Link to={`/${(user as {[key: string]: any}).id}`}>
                            <UserAvatar username={user[props.fieldName]}></UserAvatar>
                            <span>{user[props.fieldName]} {user[props.secondFieldName]} {user?.status} {userMessagesCount[user.id]}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
    
}