import { RegisterForm } from "./RegisterForm";
import "./Register.css"

export function Register(){
    return (
        <div className="register flex-container">
            <div className="column-left column"></div>
            <div className="column-right column">
                <RegisterForm></RegisterForm>
            </div>
        </div>
    );

}