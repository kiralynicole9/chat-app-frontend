import { useEffect, useRef, useState } from "react";
import { User, UserAPI } from "../../API/UserAPI";
import { getUserSession, saveUserSession } from "../../UserSession";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faPen, faSmile, faUser } from "@fortawesome/free-solid-svg-icons";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import EmojiPicker from "emoji-picker-react";

export const  ProfilePopUp = (props) => {

    const [user, setUser] = useState<User>();
    const [status, setStatus] = useState(false);
    const [inputPhone, setInputPhone] = useState(false);
    const inputRef = useRef(null);
    const [emoji, setEmoji] = useState(getUserSession()?.status);
    const [phone, setPhone] = useState(getUserSession()?.phone);
    

    useEffect (() => {
        setUser(getUserSession()); 
    }, [])

    const handleStatus = () => {
        setStatus(!status);
    }
    
    function handleClick(){
        setInputPhone(!inputPhone);
    }

    const onEmojiClick = (e) => {
        if(!e.emoji) return;
        const selectedEmoji = e.emoji;
        setEmoji(selectedEmoji);
        updateStatus(selectedEmoji);
    }

    const updatePhone = async (newPhone) => {
        const userapi = new UserAPI();
        const _user = await userapi.updateUser(user?.id, {phone: newPhone});
        saveUserSession(_user);
        setUser(_user);
        
    }

    const updateStatus = async (newStatus) => {
        const userapi = new UserAPI();
        const _user = await userapi.updateUser(user?.id, {status: newStatus});
        saveUserSession(_user);
        setUser(_user);
        console.log(_user, "statussss")

    }

    function handleImageClick(){
        inputRef.current.click();
    }
    const handleImageChange = async (event) => {
        const file = event?.target.files[0];
        const userapi = new UserAPI();
        console.log(file);
        if (file) {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener("load", async() => {
                console.log(reader.result)
                const formData = new FormData();
                formData.append("profile-image", reader.result as string || "");
                const _user = await userapi.updateProfileImg(user?.id, formData );
                console.log(_user, "userrr updated");
                saveUserSession(_user);
                setUser(_user);
            })
    }
    }

    

    if(!props.showProfile){
        return null;
    }else{
        return(
            
            <div className="profile-popup">
                <div className="profile-info">
                    <div className="profile-title">
                        <FontAwesomeIcon icon={faUser}></FontAwesomeIcon>
                        <span className="profile-title-text">Profile</span>
                    </div>
                    <div className="profile-info-details popup-row">
                        <div className="profile-photo popup-row-title">
                            <span onClick={handleImageClick}>
                            
                                <UserAvatar username={user?.firstname} image={user?.img}></UserAvatar>
                                <input className="profile-input" type="file" ref={inputRef}  onChange={handleImageChange}/>
                            </span>
                            <span>
                                <span>{user?.firstname} {user?.lastname}</span>
                                <span>{emoji}</span>
                            
                            </span>
                        </div>
                       
                        <div className="popup-row-description">
                            <span>
                                Update your status
                            </span>
                            <span>
                                <FontAwesomeIcon icon={faSmile} onClick={handleStatus}></FontAwesomeIcon>
                                {status && <EmojiPicker className="emoji-picker" onEmojiClick={onEmojiClick}></EmojiPicker >}

                            </span>
                        </div>

                    </div>
            
                </div>
                <div className="popup-row">

                    <div className="contact-information ">
                        <div className="contact-information-header popup-row-title">
                            <span className="contact-information-title" >Contact information</span>
                            <button>Edit</button>
                        </div>
                        
                        <div className="popup-row-description">  
                            <FontAwesomeIcon icon={faEnvelope}></FontAwesomeIcon>
                            <span>
                                Email address
                            </span>
                            <p>
                                {user?.email}
                            </p>
                         
                            <p className="contact-phone" onClick={handleClick}>
                                {!phone ? "+Add phone" : phone}  
                            </p>
                            {inputPhone ? <input type="phone" onChange={(e) => {setPhone(e.target.value)}} onKeyDown={(e) => {if(e.key === 'Enter') {
                                setInputPhone(false); 
                                updatePhone(phone);
                            }}}></input> : null}
                        </div>
                    </div>
                </div>

            </div>

        )

    }
}