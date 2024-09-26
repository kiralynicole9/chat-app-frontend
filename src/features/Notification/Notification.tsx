import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState, useEffect } from 'react';
import {PopUp} from './PopUp.tsx'
import './Notification.css'
import { getWsConnection } from '../../API/WS.ts';
import { getUserSession } from '../../UserSession.ts';
import { NotificationAPI } from '../../API/NotificationAPI.ts';
import { ChannelMembersAPI } from '../../API/ChannelMembersAPI.ts';

export const Notification = () => {
    const [showPopUp, setShowPopUp] = useState(false); 
    const [amount, setAmount] = useState(0);

    function handleNotifications(){
        setShowPopUp(!showPopUp);
        console.log(showPopUp);
    }

    useEffect(() => {
        const fetchNotif = async() => {
            const notificationapi = new NotificationAPI();
            const channelMembersApi = new ChannelMembersAPI();
    
            const notifications = await notificationapi.getNotifications(getUserSession().id)

            const channels = await channelMembersApi.getChannelByMemberId(getUserSession().id);

            let sum = notifications.length;
            for(const channel of channels.channels){
                const _channelNotifications = await notificationapi.getNotificationsChannel(channel.channel_id, getUserSession().id);
                //has_been_read
                sum+=_channelNotifications.filter(n => n.from_user.id !== getUserSession().id).length;
            }

            setAmount(sum);

        }
    
            const eventCallback = (e) => {
                console.log(e);
                const data = JSON.parse(e.data);
                if(data.type === "new_notification" || data.type === "new_channel_notification"){  
                    setAmount((_amount) => _amount + 1);
                    return;
                }
                if(data.type === "read_notification"){
                    setAmount((_amount) => _amount - 1);
                    return;
                }
            }
        

        fetchNotif();

        getWsConnection().addEventListener("message",eventCallback)
        return () => {
            getWsConnection().removeEventListener("message", eventCallback)}
    }, [])

    return(
        <div>
            <span className='notification-bell'>
                <FontAwesomeIcon onClick = {handleNotifications} icon = {faBell} /> 
                {amount > 0 && <span className='notification-count'>
                    {amount}
                </span>}            
            </span>
            <PopUp handleNotifications = {handleNotifications} show = {showPopUp}></PopUp>
        </div>
    );

}