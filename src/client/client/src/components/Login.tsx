import React, { useState, FormEvent, useContext, useEffect } from 'react';
import { redirect as redirectTo, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Register from './Register';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface LoginProps {
  setIsLoggedIn: (value: boolean, username: string) => void;
}

const Login = () => {
  const navigate = useNavigate();
  const {
    isLoggedIn,
    setIsLoggedIn,
    setUsername: setContextUsername,
  } = useContext(AuthContext);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/messages');
    }
  }, [isLoggedIn]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:4000/api/auth/login',
        {
          username: username,
          password: password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setIsLoggedIn(true);
        setContextUsername(username);
        <Navigate to="/messages" />;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="username"
          onChange={handleUsernameChange}
        />
        <input
          type="password"
          placeholder="password"
          onChange={handlePasswordChange}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
