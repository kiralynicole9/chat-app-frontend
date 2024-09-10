import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import {NotificationAPI} from "../../API/NotificationAPI";
import { Notification } from "../../API/NotificationAPI";
import { useNavigate, useParams } from "react-router-dom";
import { getUserSession } from "../../UserSession";
import { ChannelMembersAPI } from "../../API/ChannelMembersAPI";
import { MessagesStatusAPI } from "../../API/MessagesStatusAPI";
import { NotificationStatusAPI } from "../../API/NotificationStatusAPI";


export const PopUp = (props) => {

    const [notifications, setNotifications] = useState([]);
    const [channelNotifications, setChannelNotifications] = useState([]);

    const navigate = useNavigate();

    const readNotification = (notification: Notification) => {
        const notificationapi = new NotificationAPI();
        const notifications = notificationapi.makeNotificationRead(notification.id, {has_been_read: 1});
        setNotifications((prev) => prev.filter((n) => n.id != notification.id))
        navigate(`/${notification.from_user.id}`);
        props.handleNotifications?.();
    }

    const readNotificationChannel = async(notification: Notification) => {
         const notificationStatusAPI = new NotificationStatusAPI();
        // const channelNotifications = notificationapi.makeNotificationRead(notification.id, {has_been_read: 1});
        // const messagesStatusAPI = new MessagesStatusAPI();
        // const messageStatus = await messagesStatusAPI.updateMessageStatus(notification.id_message, getUserSession().id, {has_been_read: 1})

        console.log(messageStatus, "||");

       // setChannelNotifications((prev) => prev.filter((n) => n.id != notification.id))
       // navigate(`/channels/${notification.channel_id}`);
       // props.handleNotifications?.();
    }

    useEffect(() => {
        async function fetchNotif(){
            const notificationapi = new NotificationAPI();
            const channelMembersApi = new ChannelMembersAPI();
            
            const _notifications = await notificationapi.getNotifications(getUserSession().id)
            console.log(_notifications, "}}")
            setNotifications(_notifications);
            
    
            const channels = await channelMembersApi.getChannelByMemberId(getUserSession().id);
            console.log(channels.channels, "notiiifff");

            let arr = [];
            for(const channel of channels.channels){
                const _channelNotifications = await notificationapi.getNotificationsChannel(channel.channel_id);
                console.log(_channelNotifications, "lll")
                //has_been_read
                arr.push(_channelNotifications.filter(n => n.from_user.id !== getUserSession().id));
            }
            console.log(arr.flat(), ":::")
            
            setChannelNotifications(arr.flat())

            console.log(channelNotifications, "jiji")  


        }


        fetchNotif();

    }, [props.show, getUserSession().id]);

    const getNotificationTime = (notification: Notification) => {
        const date = new Date(notification.created_at);
        if(date.getMinutes() < 10 && date.getHours() > 9){
            return `${date.getHours()}: 0${date.getMinutes()}`
        }else if(date.getMinutes() > 9 && date.getHours() > 9){
            return `${date.getHours()}: ${date.getMinutes()}`
        }else if(date.getMinutes() < 10 && date.getHours() < 10){
            return `0${date.getHours()}: 0${date.getMinutes()}`
        }else{
            return `0${date.getHours()}: ${date.getMinutes()}`
        }
    }

    if(!props.show){
        return null;
    }else{
        return(
            <div className="popup" >
                <div className="popup-header">
                    <FontAwesomeIcon icon={faBell} />
                    <span className="popup-header-title">Notifications</span>
                </div>
                <div className="popup-content">
                    
                    {!notifications?.length && !channelNotifications.length && (
                        <div className="popup-row-content">
                            <p className="popup-row-description">
                                No new notifications 
                            </p>
                        </div>
                    )}
                    {notifications.map((notification: Notification) => (
                        <div className="popup-row" onClick={() => {readNotification(notification)}}>
                            <div className="popup-row-content">
                                <p className="popup-row-title">
                                    New message {notification.id_message}
                                </p>

                                <p className="popup-row-description">
                                    {notification.from_user.firstname} sent you a new message.
                                </p>
                                
                            </div>
                            <div className="popup-row-footer">
                                <div className="popup-time">
                                    {getNotificationTime(notification)}
                                </div>

                            </div>
                            
                        </div>
                    ))}
                    
                    {channelNotifications.map((channelNotification: Notification) => (
                        <div className="popup-row" onClick={() => readNotificationChannel(channelNotification)}>
                            <div className="popup-row-content">
                                <p className="popup-row-title">
                                    New message {channelNotification.id_message}
                                </p>

                                <p className="popup-row-description">
                                    {channelNotification?.from_user.firstname} sent a new message in channel {channelNotification.channel_id}.
                                </p>
                            </div>
                            <div className="popup-row-footer">
                                <div className="popup-time">
                                    {getNotificationTime(channelNotification)}
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

            </div>


        );
    }
}