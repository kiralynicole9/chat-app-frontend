import {Routes, Route } from 'react-router-dom';

import './App.css'
import { Register } from './features/Auth/Register/Register';
import {HomePage} from './features/Home/HomePage';
import {Login} from './features/Auth/Login/Login';

function App() {

  return (
    <Routes>
      <Route path='/' element={<HomePage></HomePage>}></Route>
       <Route path='/register' element={<Register></Register>}></Route> 
      <Route path='/login' element={<Login></Login>}></Route>

     
    </Routes>
  )
}

export default App;
