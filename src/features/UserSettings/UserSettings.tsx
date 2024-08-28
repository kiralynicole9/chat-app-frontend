import { useEffect, useState } from "react"
import "./UserSettings.css"
import { UserAPI } from "../../API/UserAPI"
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
export const UserSettings = ({userId}) => {
    const [user, setUser] = useState();
    useEffect(() => {
        const fetchUsers = async() => {
            const userapi = new UserAPI();
            const data = await userapi.getUser(userId);
           
            console.log(data, "the other user");
            setUser(data);
        }
        fetchUsers();
    }, [userId])
    return(
        <div className="user-settings-container">
            
            <div className="user-settings-section">
                <p>Settings </p>
                <div className="user-settings-title">
                    <span>
                        <UserAvatar username={user?.firstname}></UserAvatar>
                    </span>
                    <span className="user-settings-name">
                        {user?.firstname + " " + user?.lastname} 
                    </span>
                    <span>
                        {user?.status}
                    </span>
                </div>

                {user?.active==1 ? <div ><span className="active-profile"></span><span>Active</span></div> : <div ><span className="inactive-profile"></span><span>Away</span></div>}

                <div className="user-settings-details">
                    <p className="user-settings-about">About</p>
                    <p>username: {user?.username}</p>
                    
                    <p>
                        <FontAwesomeIcon icon={faEnvelope}></FontAwesomeIcon>
                        <span className="user-settings-detail-item">{user?.email}</span>
                    </p>
                    <p>
                        <span>{user?.phone}</span>
                    </p>
                </div>

                <div className="user-settings-details">
                    <p>Files</p>
                    <p>There aren’t any files to see here right now. </p>

                </div>

            </div>
        </div>
    )
}