import { RegisterForm } from "./RegisterForm";
import "./Register.css"

export function Register(){
    return (
        <div className="page">
            <div className="column-right column">
                <RegisterForm></RegisterForm>
            </div>
        </div>
    );

}