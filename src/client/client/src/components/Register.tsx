import React, { useState } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { set } from 'mongoose';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setPassword(event.target.value);
  };

  const handleSubmit = async () => {
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
        return <Navigate to="/login" />;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        console.log('username already exists');
      } else if (axios.isAxiosError(error) && error.response?.status === 401) {
        <Navigate to="/login" />;
      }
      console.error(error);
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="register" onSubmit={handleSubmit}>
      <form>
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
    </div>
  );
};

export default Register;
