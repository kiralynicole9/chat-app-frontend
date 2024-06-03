import { User } from "./API/UserAPI";

export const saveUserSession = (user: User) => {
    
    document.cookie = `user=${user.id}`
    window.localStorage.setItem("user", JSON.stringify(user));
}
  
export const getUserSession = () => {
    return JSON.parse(window.localStorage.getItem("user") as string);
}

export const deleteUserSession = () => {
    window.localStorage.removeItem("user");
}

