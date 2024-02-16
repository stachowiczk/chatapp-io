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
    },
  });
  const user: Record<string, string> = {};

  const connectedUsers: Record<string, string> = {};
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('setUser', (username) => {
      Object.keys(connectedUsers).find((key) => {
        if (connectedUsers[key] === username) {
          delete connectedUsers[key];
        }
      });
      connectedUsers[socket.id] = username;
      console.log('connectedUsers', connectedUsers);
    });

    socket.on('message', (text) => {
      console.log('message', { text });
      io.emit('message', text);
    });

    socket.on('privateMessage', ({ text, to }) => {
      const toSocketId = Object.keys(connectedUsers).find(
        (socketId) => connectedUsers[socketId] === to
      );
      console.log('toSocketId', toSocketId);

      if (socket && toSocketId) {
        console.log('privateMessage', { text, to });
        try {
          socket.to(toSocketId).emit('privateMessage', { text });
        } catch (error) {
          console.error(error);
        }
      }
    });
  });

  io.on('disconnect', (socket) => {
    console.log('a user disconnected');
    delete connectedUsers[socket.id];
    console.log('connectedUsers', connectedUsers);
  });

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
    // TODO: connectedUsers[username] = hashedPassword;
    console.log('logged in', { username, password, hashedPassword });
    res.status(200).json({ success: true, username });
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.status(204).send();
    });
  });

  server.listen(3001, () => {
    console.log('Server is listening on port 3001');
  });
})();
