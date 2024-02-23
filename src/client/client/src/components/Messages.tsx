import React, { FormEvent, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { redirect } from 'react-router-dom';
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
  const [text, setText] = useState<string>('');
  const [message, setMessage] = useState<Message>({ id: 0, text: '' });
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      if (!usernameProp) {
        redirect('/login');
      }
    }, 120);
    const token = localStorage.getItem('token');
    const newSocket = io('http://localhost:3001', {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('connected to socketio');
      if (newSocket.id) {
        setSocketId(newSocket.id);
        console.log('socket id', newSocket.id);
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
        if (!selectedUser) {
          socket.emit('selectChat', usernameProp, message.from);
        } else if (message.from === selectedUser) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });
      socket.on('connectedUsers', (connectedUsers: Record<string, string>) => {
        setUsers(Object.values(connectedUsers));
      });
      socket.emit('selectChat', usernameProp, selectedUser);
      socket.on('selectChat', (messages: Message[]) => {
        setMessages(messages);
      });
    }
    return () => {
      if (socket) {
        socket.off('privateMessage');
      }
    };
  }, [socket, selectedUser]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  useEffect(() => {
    setMessage({
      id: messages.length + 1,
      text: text,
      to: selectedUser,
      from: usernameProp,
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
        {messages.map((message: Message) => {
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
        socket={socket}
      />
    </div>
  );
};

export default Messages;
