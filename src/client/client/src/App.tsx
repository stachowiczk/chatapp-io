import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Messages from './components/Messages';
import Login from './components/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { set } from 'mongoose';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean|null>(null);
  const [username, setUsername] = useState<string>('');

  const loginStateHandler = (status: boolean, username: string) => {
    setUsername(username);
    setIsLoggedIn(status);
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/login', {
          withCredentials: true,
        });
        if (response.status === 200) {
          setIsLoggedIn(true);
          console.log('username', response.data.username);  
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error(error);
      }
    };
    checkLogin();
  }, []);

    //<Router>
      //<Routes>
        //<Route path="/messages" element={<Messages />} />
        //<Route
          //path="/login"
          //element={<Login setIsLoggedIn={loginStateHandler} />}
        ///>
      //</Routes>
    //</Router>
  return (
    isLoggedIn ? (<Messages usernameProp={username}/>) : (<Login setIsLoggedIn={loginStateHandler} />)
  );
}

export default App;
