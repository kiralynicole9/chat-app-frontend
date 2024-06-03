import { useEffect, useState } from "react";
import { User } from "../../API/UserAPI";
import { getUserSession } from "../../UserSession";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";

export const  ProfilePopUp = (props) => {

    const [user, setUser] = useState<User>();

    useEffect (() => {
        setUser(getUserSession()); 
    }, [])



    if(!props.showProfile){
        return null;
    }else{
        return(
            
            <div className="profile-popup">
                <div className="profile-info">
                    <div className="profile-title">Profile</div>
                    <div className="profile-photo">
                        <UserAvatar username={user?.username} ></UserAvatar>
                    </div>
                    {user?.firstname} {user?.lastname}
                    <p>
                        Update your status
                    </p>
                </div>
                <div className="contact-information">
                    <div className="contact-information-header">
                        <span >Contact information</span>
                        <button>Edit</button>
                    </div>
                    
                    <div>  
                        <FontAwesomeIcon icon={faEnvelope}></FontAwesomeIcon>
                        <span>
                            Email address
                        </span>
                        <p>
                            {user?.email}
                        </p>
                        
                        
                    </div>
                    <p className="contact-phone">
                        +Add phone  
                    </p>
                    
                </div>

            </div>

        )

    }
}