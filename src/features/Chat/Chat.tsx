import { UsersList } from "../UsersList/UsersList"
import "./Chat.css"
import { Message } from "../Messages/Message";
import { Notification } from "../Notification/Notification";
import { Logout } from "../Auth/Logout/Logout";
import { useEffect } from "react";
import { getUserSession } from "../../UserSession";
import { useNavigate } from "react-router-dom";
import { Profile } from "../Profile/Profile";

export const Chat = () => {
    const navigate = useNavigate();

    useEffect(() => {
        console.log(getUserSession());
        
    }, [])

    return (
        <div className="page">
            <header className="header">
                <nav>
                    <ul className="menu">
                        <li><Profile></Profile></li>
                        <li><Notification></Notification></li>
                        <li><Logout></Logout></li>
                    </ul>
                </nav>
            </header>
            <div className="chat">
            <div className="column column-left">
                <UsersList fieldName="firstname" secondFieldName="lastname"></UsersList>
            </div>
            <div className="column column-right column-reversed">
                <Message></Message>
            </div>

            </div>
        </div>
    )
}