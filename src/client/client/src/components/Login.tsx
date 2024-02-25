import React, { useState, FormEvent } from 'react';
import {redirect as redirectTo} from 'react-router-dom';
import axios from 'axios';

interface LoginProps {
  setIsLoggedIn: (value: boolean, username: string) => void;
}

const Login: React.FC<LoginProps> = ({setIsLoggedIn}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:4000/api/auth/login',{ 
        username: username,
        password: password,
      }, {
        withCredentials: true,
      });

      if (response.status === 200) {
        setIsLoggedIn(true, username);
      } 
    } catch (error) {
      console.error(error);
    }

  };

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  }

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  }



  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="username" onChange={handleUsernameChange}/>
        <input type="password" placeholder="password" onChange={handlePasswordChange}/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
