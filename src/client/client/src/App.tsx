import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import Messages from './components/Messages';
import axios from 'axios';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    axios.post('http://localhost:3001/api/login', {
      username: 'user',
      password: 'password',
    });
    setIsLoggedIn(true);
  }, []);

  return (
    isLoggedIn ? <Messages /> : <div>Login</div>
  );
}

export default App;
