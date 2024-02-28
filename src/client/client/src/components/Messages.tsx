import React, { FormEvent, useState, useEffect, useContext } from 'react';
import { io, Socket } from 'socket.io-client';
import Chats from './Chats';
import LogoutButton from './LogoutButton';
import { AuthContext } from '../context/AuthContext';
import { set } from 'mongoose';
import { doc } from 'prettier';

interface Message {
  id: string;
  to?: string | null;
  text?: string;
  from?: string | null;
  date?: Date;
}

const Messages = () => {
  const { username } = useContext(AuthContext);
  const [users, setUsers] = useState<string[]>([]); // online users
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>('');
  const [message, setMessage] = useState<Message>({ id: '', text: '' });
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null | undefined>(
    localStorage.getItem('selectedUser') || null
  );
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

  // auto resize textarea
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value);
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  };


  useEffect(() => {
    setMessage({
      id: socketId ? socketId + messages.length : '0',
      text: text,
      to: selectedUser,
    });
  }, [text, selectedUser]);

  const sendPrivateMessage = (message: Message) => {
    console.log('sendPrivateMessage', message);
    setMessage({
      id: socketId ? socketId + messages.length : '0',
      text: text,
    });

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
    const textarea = document.getElementById('textarea-message');
    if (textarea) textarea.style.height = 'auto'; // Reset the height to auto
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevent default to stop new line being added
      handleSubmit(event); // Programmatically trigger form submission
    }
  };

  return (
    <div className="messages-container">
      <div className="inner-container">
        {selectedUser ? (
          <h3>Chat with {selectedUser}</h3>
        ) : (
          <h3>Select a user to chat with</h3>
        )}
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
          <form className="message-form" onSubmit={handleSubmit}>
            <textarea
              id="textarea-message"
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <button className="message-button" type="submit">{'>'}</button>
          </form>
        ) : (
          <p>Select a user to chat with</p>
        )}
      </div>
      <div className="chat-list">
        <LogoutButton />
        <Chats
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          users={users}
          socket={socket}
        />
      </div>
    </div>
  );
};

export default Messages;
