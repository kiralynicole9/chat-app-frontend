import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../../App";
import { useNavigate } from "react-router-dom";

const hasUserSession = () => {
    return window.localStorage.getItem("user");
}

export function Login(){
    const [data, setData] = useState({});
    const [error, setError] = useState("");
    const {login, setUser} = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (hasUserSession()) {
            navigate('/')
        };
    }, [navigate]);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        try{
           const user = await login(data);
           setUser(user);
            setError("");
            navigate("/");
        }catch(e){
            setError("Invalid login")
        }
    }

    const addEmail = (email:string) => {
        setData({
            ...data,
            email: email
        })
    }

    const addPassword = (password:string) => {
        setData({
            ...data,
            password
        })
    }

    return(
        <div className="page">
            <div className="column column-right">
                {error && (
                    <h3>{error}</h3>
                )}
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input type="email" onChange={(e) => {addEmail(e.target.value)}} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" onChange={(e) => {addPassword(e.target.value)}} />
                    </div>
                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    )
}