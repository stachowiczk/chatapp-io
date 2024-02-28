import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';

const Chats = (props: any) => {
  const [friends, setFriends] = useState<string[]>([]);
  const [addFriend, setAddFriend] = useState<string>('');

  const handleClickedUser = (user: string) => {
    localStorage.setItem('selectedUser', user);
    props.setSelectedUser(user);
  };

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
  useEffect(() => {
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
      <form onSubmit={handleAddFriend}>
        <input type="text" placeholder="New message to:" onChange={handleChange} />
        <button type="submit"> + </button>
      </form>

      <ul className="chat-list">
        {friends.map((friend: string) => (
          <li key={friend} onClick={() => handleClickedUser(friend)}>
            {friend}{' '}
            {props.users.includes(friend) ? (
              <span className="online-dot">&#x2022;</span>
            ) : (
              <span className="offline-dot">&#x2022;</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Chats;
