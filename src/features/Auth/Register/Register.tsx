import { RegisterForm } from "./RegisterForm";
import "./Register.css"
import { getUserSession } from "../../../UserSession";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function Register(){
    const navigate = useNavigate();

    useEffect(() => {
        if (getUserSession()) {
            navigate('/')
        };
    }, [navigate]);

    return (
        <div className="page">
            <div className="column-right column">
                <RegisterForm></RegisterForm>
            </div>
        </div>
    );

}