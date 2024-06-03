import { faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { deleteUserSession } from "../../../UserSession";
import { AuthContext } from "../../../App";
import { useContext } from "react";

export const Logout = () => {
    const {setUser} = useContext(AuthContext);

    const logout = () => {
        deleteUserSession();
        setUser(null);
    }

    return(
        <FontAwesomeIcon icon={faSignOut} onClick={logout}></FontAwesomeIcon>
    );
}