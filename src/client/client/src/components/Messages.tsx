import React, { FormEvent, useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { set } from 'mongoose';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');

    newSocket.on('connect', () => {
      console.log('connected to socketio');
      if (newSocket.id) {
        setSocketId(newSocket.id);
      }
      setSocket(newSocket);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendMessage = (text: string) => {
    if (socket) {
      socket.emit('message', text);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(text);
    setText('');
  };

  return (
    <div>
      <ul>
        {messages.map((message: any) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      <p>Connected to socket.io {socketId}</p>
    </div>
  );
};

export default Messages;
