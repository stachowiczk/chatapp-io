import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { sessionMiddleware, login, checkLogin, logout } from './session';
import { connectToDb } from './models';
import User from './models/user';
import Message from './models/message';
import { findSocketId } from './constants/helpers';

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

  const db = await connectToDb();

  //app.use((req, res, next) => {
  //checkLogin(req, res, next);
  //});

  const connectedUsers: Record<string, string> = {};
  io.on('connection', (socket) => {
    console.log('a user connected');

    // add client to connected users, remove previous instance of user if exists
    socket.on('setUser', (username) => {
      Object.keys(connectedUsers).find((key) => {
        if (connectedUsers[key] === username) {
          delete connectedUsers[key];
        }
      });
      connectedUsers[socket.id] = username;
      //send connected users to all clients
      io.emit('connectedUsers', connectedUsers);
      console.log('connectedUsers', connectedUsers);
    });

    socket.on('selectChat', async (sender, recipient) => {
      try {
        const messages = await Message.find({
          $or: [
            { to: sender, from: recipient },
            { to: recipient, from: sender },
          ],
        });
        messages.sort((a, b) => a.date.getTime() - b.date.getTime());

        const socketId = findSocketId(sender, connectedUsers);
        if (socketId) {
          io.to(socketId).emit('selectChat', messages);
        }
      } catch (error) {
        console.error(error);
      }
    });

    // send private message to specific client and sender
    socket.on('privateMessage', async (data) => {
      const { text, to, from } = data;
      const message = new Message({
        to,
        from,
        text,
        date: new Date(),
      });

      try {
        await message.save();
      } catch (error) {
        console.error(error);
      }

      const toSocketId = findSocketId(to, connectedUsers);
      const fromSocketId = findSocketId(from, connectedUsers);
      console.log('toSocketId', toSocketId);

      if (socket && toSocketId && fromSocketId) {
        console.log('privateMessage', message);
        try {
          socket.to(toSocketId).emit('privateMessage', message);
          socket.to(fromSocketId).emit('privateMessage', message);
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
