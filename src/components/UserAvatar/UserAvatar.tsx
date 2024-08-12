import { useEffect, useState } from "react"
import "./UserAvatar.css"
type UserAvatarProps = {
    username: string,
    image:any
}

export const UserAvatar = (props: UserAvatarProps) => {
    const [color, setColor] = useState("");
  

    useEffect(() => {
        const redColor = () => {
            return (Math.random() + 0.8)  * 100 ;
        }
    
        const greenColor = () => {
            return (Math.random() + 0.2) * 155;
        }
    
        const blueColor = () => {
            return (Math.random() + 0.2) * 200;
        }
    
        const _color = `rgba(${redColor()}, ${greenColor()}, ${blueColor()}, 1)`
        setColor(_color);
    }, [])

    return (
        <span style={{backgroundColor: color}} className="user-avatar">
            {props.image ? <img className="user-avatar" src={props.image}></img> : props.username?.slice(0,2)}
        </span>
    )
}