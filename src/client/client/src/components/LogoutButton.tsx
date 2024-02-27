import React, {useContext} from 'react';
import axios from 'axios';
import { Navigate, useNavigate} from 'react-router';
import { AuthContext } from '../context/AuthContext';

const LogoutButton = () => {
    const navigate = useNavigate();
    const { setIsLoggedIn } = useContext(AuthContext);
  const handleLogout = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/auth/logout', {
        withCredentials: true,
      });
      if (response.status === 200) {
        setIsLoggedIn(false);
        return navigate('/');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
