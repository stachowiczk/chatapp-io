import React from 'react';
import axios from 'axios';
import { Navigate } from 'react-router';

const LogoutButton = (props: { setIsLoggedIn: (arg0: boolean) => void; }) => {
  const handleLogout = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/auth/logout', {
        withCredentials: true,
      });
      if (response.status === 200) {
        props.setIsLoggedIn(false);
        return <Navigate to="/login" />;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
