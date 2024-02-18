import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chats = (props: any) => {
  const handleClickedUser = (user: string) => {
    props.setSelectedUser(user);
  };


  return (
    <div>
      <ul>
        {props.users.map((user: string) => (
          <li key={user} onClick={() => handleClickedUser(user)}>
            {user}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chats;
