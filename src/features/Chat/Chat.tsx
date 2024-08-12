import { UsersList } from "../UsersList/UsersList"
import "./Chat.css"
import { Message } from "../Messages/Message";
import { Notification } from "../Notification/Notification";
import { Logout } from "../Auth/Logout/Logout";
import { useNavigate, useParams } from "react-router-dom";
import { Profile } from "../Profile/Profile";
import { HomePage } from "../Home/HomePage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPeopleArrows, faPeopleGroup, faUsers } from "@fortawesome/free-solid-svg-icons";
import { faMessage } from "@fortawesome/free-solid-svg-icons/faMessage";
import { useState } from "react";

export const Chat = () => {
    const navigate = useNavigate();
    const { userId, channelId } = useParams();
    console.log(channelId, "inchat")
    const [ displayUsersMenu, setDisplayUsersMenu ] = useState(false);

    return (
        <div className={`page${displayUsersMenu ? " mobile-users-menu-display" : ""}`}>
            <header className="header">
                <div className="logo" onClick={() => {navigate('/'); setDisplayUsersMenu(false)}}>Logo</div>
                <nav className="nav-menu">
                    <ul className="menu">
                        <li><Profile></Profile></li>
                        <li><Notification></Notification></li>
                        <li><Logout></Logout></li>
                        <li className="mobile-users-button" onClick={() => setDisplayUsersMenu(!displayUsersMenu)}><FontAwesomeIcon icon={faPeopleGroup}></FontAwesomeIcon></li>
                    </ul>
                </nav>
            </header>
            <div className="chat">
            <div className="column column-left" onClick={() => setDisplayUsersMenu(false)}>
                <UsersList fieldName="firstname" secondFieldName="lastname"></UsersList>
            </div>
            <div className="column column-right column-reversed">
                {userId && <Message></Message>}
                {channelId &&  <Message></Message>}
                {!userId && !channelId && <HomePage></HomePage>}
            </div>

            </div>
        </div>
    )
}