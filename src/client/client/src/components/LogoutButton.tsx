import React from 'react';
import axios from 'axios';

const LogoutButton = (props: { setIsLoggedIn: (arg0: boolean) => void; }) => {
  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/logout', {
        withCredentials: true,
      });
      if (response.status === 200) {
        console.log('logged out');
        props.setIsLoggedIn(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
