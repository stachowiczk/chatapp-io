import React, { useState,useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

function Home() {
  const { isLoggedIn } = useContext(AuthContext); // Use the context
  const [loading, setLoading] = useState(true);

  if (isLoggedIn === null) {
    return <div>Loading...</div>; // Or some loading spinner
  }

  return <Navigate to={isLoggedIn ? '/messages' : '/login'} />;
}

export default Home;

