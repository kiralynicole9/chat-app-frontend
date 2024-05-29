import { UserAPI } from "../../API/UserAPI";
import { useEffect, useState } from "react";
import { UserAvatar } from "../../components/UserAvatar/UserAvatar";
import "./UsersList.css"
import { Link } from "react-router-dom";
type UsersListProps = {
    fieldName: string,
    secondFieldName: string
}
export const UsersList = (props: UsersListProps) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const userAPI = new UserAPI();
        const users = userAPI.getUsers().then((res) => {
           return res.json()
        }).then((data) => {
            setUsers(data);
            console.log(users);
        });
        
    }, [])

    

    return(
        <div>
            <ul className="users-list">
                {users.map((user) => (
                    <li className="users-list-item">
                        <Link to={`/${(user as {[key: string]: any}).id}`}>
                            <UserAvatar username={user[props.fieldName]}></UserAvatar>
                            <span>{user[props.fieldName]} {user[props.secondFieldName]}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    )
    
}