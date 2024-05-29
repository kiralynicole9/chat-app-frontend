import "./UserAvatar.css"
type UserAvatarProps = {
    username: string
}

export const UserAvatar = (props: UserAvatarProps) => {

    const redColor = () => {
        return (Math.random() + 0.8)  * 100 ;
    }

    const greenColor = () => {
        return (Math.random() + 0.2) * 155;
    }

    const blueColor = () => {
        return (Math.random() + 0.2) * 200;
    }

    const color = `rgba(${redColor()}, ${greenColor()}, ${blueColor()}, 1)`

    return (
        <span style={{backgroundColor: color}} className="user-avatar">
            {props.username.slice(0,2)}
        </span>
    )
}