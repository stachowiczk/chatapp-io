import { Server, Socket } from 'socket.io';
import { findSocketId } from './constants/helpers';
import { saveMessage, getMessages } from './services/message';
import User from './models/user';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
declare module 'express-session';


const connectedUsers: Record<string, string> = {};

export const initSockets = async (
  io: Server,
): Promise<void> => {

  io.on('connection', async (socket: Socket) => {
    // add client to connected users, remove previous instance of user if exists
    const cookie = socket.request.headers.cookie;
    const token = cookie?.split('token=')[1];


    console.log('token', token);
    if (!token) {
      return;
    }
    jwt.verify(token, 'secret', async (err, decoded) => {
      if (err) {
        console.error(err);
        return socket.disconnect();
      }
    });
    const decoded = jwt.decode(token);
    if (!decoded) {
      return;
    }
    const usernameFromToken = await User.findOne({ _id: (decoded as any).id });
    const username = usernameFromToken?.username;

    if (username) {
      Object.keys(connectedUsers).find((key) => {
        if (connectedUsers[key] === username) {
          delete connectedUsers[key];
        }
      });
      connectedUsers[socket.id] = username;
      //send connected users to all clients
      io.emit('connectedUsers', connectedUsers);
      console.log('connectedUsers', connectedUsers);
    }

    socket.on('selectChat', async (recipient) => {
      const messages = await getMessages(username, recipient);
      const socketId = findSocketId(username, connectedUsers);
      if (socketId && messages) {
        io.to(socketId).emit('selectChat', messages);
      }
    });

    // send private message to specific client and sender
    socket.on('privateMessage', async (data) => {
      data = { ...data, from: username };
      const message = await saveMessage(data);
      if (!message) {
        return;
      }
      const toSocketId = findSocketId(message.to, connectedUsers);
      const fromSocketId = findSocketId(username, connectedUsers);
      console.log('toSocketId', toSocketId, 'from ', fromSocketId);

      if (socket && toSocketId && fromSocketId) {
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
};
