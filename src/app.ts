import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { sessionMiddleware, login, checkLogin, logout,  } from './session';

(async function main(): Promise<void> {
  const app = express();
  const server = http.createServer(app);

  app.use(cors());
  app.use(express.json());
  app.use(sessionMiddleware);
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:3000',
    },
  });
  const user: Record<string, string> = {};

  //app.use((req, res, next) => {
    //checkLogin(req, res, next);
  //});

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
      io.emit('connectedUsers', connectedUsers);
      console.log('connectedUsers', connectedUsers);
    });

    socket.on('message', (text) => {
      console.log('message', { text });
      io.emit('message', text);
    });

    socket.on('privateMessage', ({ text, to, from }) => {
      const toSocketId = Object.keys(connectedUsers).find(
        (socketId) => connectedUsers[socketId] === to
      );
      const fromSocketId = Object.keys(connectedUsers).find(
        (socketId) => connectedUsers[socketId] === from
      );
      console.log('toSocketId', toSocketId);

      if (socket && toSocketId && fromSocketId) {
        console.log('privateMessage', { text, to, from});
        try {
          socket.to(toSocketId).emit('privateMessage', { text });
          socket.to(fromSocketId).emit('privateMessage', { text });
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

  app.get('/api/users', (req, res) => {
    res.json(Object.values(connectedUsers));
  });

  app.post('/api/login', async (req, res) => {
    login(req, res);
  });

  app.post('/api/logout', (req, res) => {
    logout(req, res);
   });

  server.listen(3001, () => {
    console.log('Server is listening on port 3001');
  });
})();
