import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

(async function main(): Promise<void> {
  const app = express();
  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json());
  app.use(
    session({
      secret: 'secret',
      resave: false,
      saveUninitialized: true,
    })
  );

  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  const users: Record<string, string> = {};
  const testMessage = {
    id: 1,
    text: 'Messages test',
  };
  

  app.get('/api/messages', (req, res) => {
    res.json([testMessage]);
  });

  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = hashedPassword;
    res.status(201).send();
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.status(204).send();
    });
  });

  app.post('/api/messages', (req, res) => {
    const { text } = req.body;
    if (text) {
      io.emit('message', text);
      res.status(201).send();
    } else {
      res.status(400).send();
    }
  });

  app.post('/api/messages', (req, res) => {
    const { text } = req.body;
    if (text) {
      io.emit('message', text);
      res.status(201).send();
    } else {
      res.status(400).send();
    }
  });

  io.on('message', (text) => {
    console.log('message', text);
  });


  server.listen(3001, () => {
    console.log('Server is listening on port 3001');
  });


})();
