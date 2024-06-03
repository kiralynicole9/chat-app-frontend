import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect } from 'react';
import {PopUp} from './PopUp.tsx'
import './Notification.css'

export const Notification = () => {
    const [showPopUp, setShowPopUp] = useState(false); 

    function handleNotifications(){
        setShowPopUp(!showPopUp);
        console.log(showPopUp);
    }

    return(
        <div>
            <FontAwesomeIcon onClick = {handleNotifications} icon = {faBell} />
            <PopUp handleNotifications = {handleNotifications} show = {showPopUp}></PopUp>
        </div>
    );

}