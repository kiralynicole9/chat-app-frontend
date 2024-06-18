import {Routes, Route, redirect, useNavigate, useRouteLoaderData, useLocation } from 'react-router-dom';

import './App.css'
import { Register } from './features/Auth/Register/Register';
import { Chat } from './features/Chat/Chat';
import { createContext, useEffect, useState } from 'react';
import { LoginAPI } from './API/LoginAPI';
import { Login } from './features/Auth/Login/Login';
import { User } from './API/UserAPI';
import { getUserSession, saveUserSession } from './UserSession';
import { Profile } from './features/Profile/Profile';


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
  const {pathname} = useLocation();
  
  useEffect(() => {
    console.log('sdds')
    if (!getUserSession()) {
      navigate("/login");
    }
  }, [navigate])

  useEffect(() => {
    if(user?.id){
      saveUserSession(user);
    }

    if (getUserSession() && !user?.id) {
      const user = getUserSession();
      setUser(user);
    }

    console.log(pathname, user, 'dfsdfsdf')

    if(!getUserSession()) {
      navigate("/login");
    } else if (pathname === '/login' || pathname === '/register') {
      navigate('/')
    }
  }, [user, navigate])

  return (
    <AuthContext.Provider value={{
        login: authUtilities.login,
        user: user, setUser
    }}>
      <Routes>
        <Route path='/register' element={<Register></Register>}></Route> 
        <Route path='/login' element={<Login></Login>}></Route>
        <Route path='/:userId' element = {<Chat></Chat>}></Route>
        {getUserSession() && <Route path='/' element={<Chat></Chat>}></Route>}

      </Routes>

    </AuthContext.Provider>
  )
}

export default App;
