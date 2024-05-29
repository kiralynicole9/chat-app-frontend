import {Routes, Route, redirect, useNavigate } from 'react-router-dom';

import './App.css'
import { Register } from './features/Auth/Register/Register';
import { Chat } from './features/Chat/Chat';
import { createContext, useEffect, useState } from 'react';
import { LoginAPI } from './API/LoginAPI';
import { Login } from './features/Auth/Login/Login';
import { User } from './API/UserAPI';

const authUtilities = {
    login: async(data: any) => {
      const loginapi = new LoginAPI();
      const res = await loginapi.login(data);
      const user = await res.json()
      console.log(user, "here")
      console.log(this)
      return user;
    },
    user: {} as any,
    setUser: ((data: any) => {}) as any
  }

export const AuthContext = createContext(authUtilities);
function App() {
  const [user, setUser] = useState<User>();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("aaa")
    if(user?.id){
      navigate("/")
    }
  }, [user?.id])

  return (
    <AuthContext.Provider value={{
        login: authUtilities.login,
        user: user, setUser
    }}>
      <Routes>
        <Route path='/register' element={<Register></Register>}></Route> 
        <Route path='/login' element={<Login></Login>}></Route>
        <Route path='/' element={<Chat></Chat>}></Route>
        <Route path='/:userId' element = {<Chat></Chat>}></Route>

      </Routes>

    </AuthContext.Provider>
  )
}

export default App;
