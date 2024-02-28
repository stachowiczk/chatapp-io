import React, { useState } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';
import { set } from 'mongoose';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:4000/api/auth/register',
        {
          username: username,
          password: password,
        }
      );
      if (response.status === 200) {
        console.log('registered');
        return navigate('/login');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        console.log('username already exists');
      } else if (axios.isAxiosError(error) && error.response?.status === 401) {
        return navigate('/login');
      }
      console.error(error);
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="login" onSubmit={handleSubmit}>
      <form className='login'>
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
        <button type="submit">Register</button>
      </form>
      <a href="/login" className='register-link'>Login</a>
    </div>
  );
};

export default Register;
