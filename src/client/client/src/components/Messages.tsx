import React, { FormEvent, useState, useEffect, useContext} from 'react';
import { io, Socket } from 'socket.io-client';
import Chats from './Chats';
import LogoutButton from './LogoutButton';
import { AuthContext } from '../context/AuthContext';

interface Message {
  id: string;
  to?: string | null;
  text?: string;
  from?: string | null;
  date?: Date;
}

const Messages = () => {
  const { username } = useContext(AuthContext);
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>('');
  const [message, setMessage] = useState<Message>({ id: '', text: '' });
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null | undefined>(localStorage.getItem('selectedUser') || null);
  const scrollRef = React.useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:4000', {
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
          socket.emit('selectChat', message.from);
          setSelectedUser(message.from);
        }
        setMessages((prevMessages) => [...prevMessages, message]);
      });
      socket.on('connectedUsers', (connectedUsers: Record<string, string>) => {
        setUsers(Object.values(connectedUsers));
      });
      socket.emit('selectChat', selectedUser);
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  useEffect(() => {
    setMessage({
      id: socketId ? (socketId + messages.length) : '0',
      text: text,
      to: selectedUser,
    });
  }, [text, selectedUser]);

  const sendPrivateMessage = (message: Message) => {
    console.log('sendPrivateMessage', message);
    setMessage({
      id: socketId ? (socketId + messages.length) : '0',
      text: text,
    });

    console.log(message);
    if (socket) {
      socket.emit('privateMessage', message);
      message.from = username;
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
      <LogoutButton />
      <h3>Chat with {selectedUser}</h3>
      <ul ref={scrollRef} className="messages">
        {messages.map((message: Message) => {
          const isFromCurrentUser = message.from === username;
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
        Connected to socket.io {socketId} as {username}
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
