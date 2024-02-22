import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Messages from './components/Messages';
import Login from './components/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import { set } from 'mongoose';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginStateHandler = (status: boolean, username: string) => {
    setUsername(username);
    setIsLoggedIn(status);
  };

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.post('http://localhost:3001/api/login', {
        });
        if (response.status === 200) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };
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
