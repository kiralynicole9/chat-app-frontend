import { User } from "./API/UserAPI";

export const saveUserSession = (user: User) => {
    document.cookie = `user=${user.id}`
    window.sessionStorage.setItem("user", JSON.stringify(user));
}
  
export const getUserSession = () => {
    return JSON.parse(window.sessionStorage.getItem("user") as string);
}

export const deleteUserSession = () => {
    window.sessionStorage.removeItem("user");
}

