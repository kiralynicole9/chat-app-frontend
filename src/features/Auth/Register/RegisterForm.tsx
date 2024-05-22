import { useForm } from "react-hook-form";
import "./Register.css"
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { UserAPI } from "../../../API/UserAPI";
import { useLocation, useParams } from "react-router-dom";
import { LoginAPI } from "../../../API/LoginAPI";

const commonSchema = {
    email: yup.string().email("Please type a valid email").required("Email is required."),
    password: yup.string().min(6, "Password must be at least 6 characters long").required("Password is required."),
};

const loginSchema = yup.object(commonSchema);


const registerSchema = yup.object({
    ...commonSchema,
    username: yup.string().required("Username is required."),
    firstName: yup.string().required("First name is required."),
    lastName: yup.string().required("Last name is required."),
    retypePassword: yup.string().oneOf([yup.ref('password')], "The passwords do not match").required("Please retype your password"),

})


export function RegisterForm(){

    const {pathname} = useLocation();
    let isRegister = false;

    if(pathname === '/register'){
        isRegister = true;
    }

    const {register, handleSubmit, formState: {errors}} = useForm({
        resolver: yupResolver(registerSchema)
    })

    function onSubmit(data: any){
        if(isRegister){
            const userapi = new UserAPI();
            const user = userapi.register(data);
            console.log(user);
        }else{
            const loginapi = new LoginAPI();
            

        }

    }

console.log(handleSubmit)
    return (
        <form onSubmit={handleSubmit(onSubmit)} >
            <h1>{isRegister ? 'Register' : 'Login'}</h1>
            <div className="form-group">
                <label htmlFor="email" >Email:</label>
                <input type="email" id="email" {...register('email')}/>
                {errors.email && <p className="errors">{errors.email.message}</p>}

            </div>

            <div className="form-group">
                <label htmlFor="password" >Password:</label>
                <input type="password" id="password" {...register('password')}/>
                {errors.password && <p className="errors">{errors.password.message}</p>}

            </div>

            {isRegister && (

            <div>

            <div className="form-group">
                <label htmlFor="username" >Username:</label>
                 <input type="text" id="username" {...register('username')} />
                 {errors.username && <p className="errors">{errors.username.message}</p>}
            </div>

            <div className="form-group">
                <label htmlFor="firstName" >First name:</label>
                <input type="text" id="firstName" {...register('firstName')} />
                {errors.firstName && <p className="errors">{errors.firstName.message}</p>}

            </div>

            <div className="form-group">
                <label htmlFor="lastName" >Last name:</label>
                <input type="text" id="lastName" {...register('lastName')} />
                {errors.lastName && <p className="errors">{errors.lastName.message}</p>}

            </div>

            
            <div className="form-group">
                <label htmlFor="retypePassword" >Retype Password:</label>
                <input type="password" id="retypePassword" {...register('retypePassword')}/>
                {errors.retypePassword && <p className="errors">{errors.retypePassword.message}</p>}

            </div>

            <div className="form-group">
                <label htmlFor="image" >Profile picture:</label>
                <input type="file" name="image"/>
            </div>

            </div>
            )
            }

            <button type="submit">
                {isRegister ? 'Register' : 'Login'}
            </button>
            

        </form>
    );
}