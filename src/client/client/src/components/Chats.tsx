import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';

const Chats = (props: any) => {
  const [friends, setFriends] = useState<string[]>([]);
  const [addFriend, setAddFriend] = useState<string>('');
  const handleClickedUser = (user: string) => {
    localStorage.setItem('selectedUser', user);
    props.setSelectedUser(user);
  };
  useEffect(() => {
    const friendList = async () => {
      try {
        const response = await axios.get(
          'http://localhost:4000/api/users/friends',
          {
            withCredentials: true,
          }
        );
        if (response.status === 200) {
          console.log('friends', response.data.friends);
          setFriends(response.data.friends);
        }
      } catch (error) {
        console.error(error);
      }
    };
    friendList();
  }, []);

  const handleAddFriend = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:4000/api/users/add',
        {
          username: addFriend,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        console.log('added friend');
        const friendList = async () => {
          try {
            const response = await axios.get(
              'http://localhost:4000/api/users/friends',
              {
                withCredentials: true,
              }
            );
            if (response.status === 200) {
              console.log('friends', response.data.friends);
              setFriends(response.data.friends);
            }
          } catch (error) {
            console.error(error);
          }
        };
        await friendList();
      }
    } catch (error) {
      console.error(error);
    }
    setAddFriend('');
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setAddFriend(event.target.value);
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
      <ul>
        {friends.map((friend: string) => (
          <li key={friend} onClick={() => handleClickedUser(friend)}>
            {friend}{' '}
            {props.users.includes(friend) ? (
              <span className="online-dot">&#x2022;</span>
            ) : (
              'offline'
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={handleAddFriend}>
        <input type="text" placeholder="add friend" onChange={handleChange} />
        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default Chats;
