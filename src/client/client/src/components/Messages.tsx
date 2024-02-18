import React, { FormEvent, useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { set } from 'mongoose';
import { redirect } from 'react-router-dom';
import { send } from 'process';
import Chats from './Chats';

interface Message {
  id: number;
  to?: string | null;
  text?: string;
  from?: string | null;
  date?: Date;
}
interface MessagesProps {
  usernameProp: string;
}

const Messages: React.FC<MessagesProps> = ({ usernameProp }) => {
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [message, setMessage] = useState<Message>({ id: 0, text: '' });
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');

    newSocket.on('connect', () => {
      console.log('connected to socketio');
      if (newSocket.id) {
        setSocketId(newSocket.id);
        newSocket.emit('setUser', usernameProp);
      }
      setSocket(newSocket);
    });
    newSocket.on('connectedUsers', (connectedUsers: Record<string, string>) => {
      setUsers(Object.values(connectedUsers));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('privateMessage', (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      socket.on('connectedUsers', (connectedUsers: Record<string, string>) => {
        setUsers(Object.values(connectedUsers));
      });
    }
    return () => {
      if (socket) {
        socket.off('privateMessage');
      }
    };
  }, [socket]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  //const sendMessage = (message: Message) => {
  //if (socket) {
  //socket.emit('message', text);
  //}
  //};

  useEffect(() => {
    setMessage({
      id: messages.length + 1,
      text: text,
      to: selectedUser,
      from: usernameProp,
      date: new Date(),
    });
  }, [text, selectedUser]);

  const sendPrivateMessage = (message: Message) => {
    console.log('sendPrivateMessage', message);
    setMessage({
      id: messages.length + 1,
      text: text,
    });

    console.log(message);
    if (socket) {
      socket.emit('privateMessage', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    //sendMessage(message);
    sendPrivateMessage(message);
    setText('');
  };

  return (
    <div>
      <h3>Chat with {selectedUser}</h3>
      <ul className="messages">
        {messages
          .slice() // create a copy of the array to avoid mutating the original
          .sort((a, b) =>
            a.date && b.date ? a.date.getTime() - b.date.getTime() : 0
          ) // sort messages by date
          .map((message: Message) => {
            const isFromCurrentUser = message.from === usernameProp;
            const messageClass = `message ${isFromCurrentUser ? 'message-left' : 'message-right'}`;
            return (
              <li key={message.id} className={messageClass}>
                {message.text}
              </li>
            );
          })}
      </ul>
      {selectedUser ? (
        <form onSubmit={handleSubmit}>
          <input type="text" value={text} onChange={handleChange} />
          <button type="submit">Send</button>
        </form>
      ) : (
        <p>Select a user to chat with</p>
      )}
      <p>
        Connected to socket.io {socketId} as {usernameProp}
      </p>
      <Chats
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        users={users}
      />
    </div>
  );
};

export default Messages;
