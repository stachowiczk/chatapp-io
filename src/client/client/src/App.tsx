import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Messages from './components/Messages';
import Login from './components/Login';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import axios from 'axios';
import { set } from 'mongoose';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/auth/', {
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

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isLoggedIn ? '/messages' : '/login'} />}
        />
        <Route
          path="/login"
          element={
            isLoggedIn ? (
              <Navigate to="/messages" />
            ) : (
              <Login setIsLoggedIn={setIsLoggedIn} />
            )
          }
        />
        <Route
          path="/messages"
          element={
            isLoggedIn ? (
              <Messages usernameProp={username} setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
