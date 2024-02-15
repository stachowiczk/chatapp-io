import React, { FormEvent, useState, useEffect } from 'react';
import axios from 'axios';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/api/messages').then((response) => {
      setMessages(response.data);
    });
  }, []);

  const sendMessage = (text: string) => {
    axios.post('http://localhost:3001/api/messages', { text });
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(text);
    setText('');
  }

  return (
    <div>
      <ul>
        {messages.map((message: any) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input type="text" value={text} onChange={e => setText(e.target.value)}/>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Messages;
