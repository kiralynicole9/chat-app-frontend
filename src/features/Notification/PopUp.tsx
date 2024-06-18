import { faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import {NotificationAPI} from "../../API/NotificationAPI";
import { Notification } from "../../API/NotificationAPI";
import { useNavigate } from "react-router-dom";
import { getUserSession } from "../../UserSession";


export const PopUp = (props) => {

    const [notifications, setNotifications] = useState({});
    const navigate = useNavigate();

    const readNotification = (notification: Notification) => {
        const notificationapi = new NotificationAPI();
        const notifications = notificationapi.makeNotificationRead(notification.id, {has_been_read: 1});
        navigate(`/${notification.from_user.id}`);
        props.handleNotifications?.();
    }

    useEffect(() => {
        const notificationapi = new NotificationAPI();

        const notifications = notificationapi.getNotifications(getUserSession().id).then((data) => {
            setNotifications(data);
            console.log(notifications);
        });
    }, [props.show]);

    const getNotificationTime = (notification: Notification) => {
        const date = new Date(notification.created_at);
        return `${date.getHours()}: ${date.getMinutes()}`
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

                    {!notifications?.length && (
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
                                    {notification.from_user.firstname} sent you a new message
                                </p>
                            </div>
                            <div className="popup-row-footer">
                                <div className="popup-time">
                                    {getNotificationTime(notification)}
                                </div>

                            </div>
                            
                        </div>
                    ))}
                </div>

            </div>


        );
    }
}