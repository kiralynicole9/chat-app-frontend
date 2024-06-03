import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { ProfilePopUp } from "./ProfilePopUp";
import "./Profile.css"

export function Profile(){
    const [showPopUp, setShowPopUp] = useState(false); 

    function handleProfile(){
       setShowPopUp(!showPopUp);       
    }

    return(
        <div>
            <FontAwesomeIcon icon={faUser} onClick={handleProfile}></FontAwesomeIcon>
            <ProfilePopUp showProfile={showPopUp}></ProfilePopUp>

        </div>
    )
}