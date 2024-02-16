import React, { FormEvent, useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { set } from 'mongoose';
import { redirect } from 'react-router-dom';
import { send } from 'process';

interface Message {
  id: number;
  to?: string;
  text?: string;
}
interface MessagesProps {
  usernameProp: string;
}

const Messages: React.FC<MessagesProps> = ({ usernameProp }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sentMessages, setSentMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [message, setMessage] = useState<Message>({ id: 0, text: '' });
  const [socketId, setSocketId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

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

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('privateMessage', (message: Message) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          message,
        ]);
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
  }

  //const sendMessage = (message: Message) => {
    //if (socket) {
      //socket.emit('message', text);
    //}
  //};

  useEffect(() => {

    setMessage({ 
      id: messages.length + 1,
      text: text,
      to: 'test3' });}, [text]);
  const sendPrivateMessage = (message: Message) => {
    console.log('sendPrivateMessage', message);
    setMessage({ 
      id: messages.length + 1,
      text: text,
      to: 'test3' });
    
    console.log(message)
    if (socket) {
      socket.emit('privateMessage', message);
      setSentMessages((prevMessages) => [
        ...prevMessages,
        message,
      ]);
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
      <ul className='messages'>
        {messages.map((message: Message) => (
          <li key={message.id} className="message message-right">
            {message.text}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={handleChange}
        />
        <button type="submit">Send</button>
      </form>
      <p>Connected to socket.io {socketId} as {usernameProp}</p>
    </div>
  );
};

export default Messages;
