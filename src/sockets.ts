import { Server, Socket } from 'socket.io';
import { findSocketId } from './constants/helpers';
import { saveMessage, getMessages } from './services/message';
import User from './models/user';
import jwt from 'jsonwebtoken';
import errorResponse from './constants/errorResponse';
import socketError from './constants/socketError';
import { MISSING_DATA, NOT_FOUND } from './constants/constants';

const connectedUsers: Record<string, string> = {};

export const initSockets = async (io: Server): Promise<void> => {
  io.on('connection', async (socket: Socket) => {
    // add client to connected users, remove previous instance of user if exists
    const cookie = socket.request.headers.cookie;
    const token = cookie?.split('token=')[1];

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
      try {
        const messages = await getMessages(username, recipient);
        const socketId = findSocketId(username, connectedUsers);
        if (socketId && messages) {
          io.to(socketId).emit('selectChat', messages);
        }
      } catch (error) {
        socketError(error, socket);
      }
    });

    socket.on('privateMessage', async (data) => {
      try {
        data = { ...data, from: username };
        const message = await saveMessage(data);
        if (!message) {
          throw new Error(MISSING_DATA);
        }
        const toSocketId = findSocketId(message.to, connectedUsers);
        if (!toSocketId) {
          throw new Error(NOT_FOUND);
        }
        const fromSocketId = findSocketId(username, connectedUsers);
        console.log('toSocketId', toSocketId, 'from ', fromSocketId);

        if (socket && toSocketId && fromSocketId) {
          socket.to(toSocketId).emit('privateMessage', message);
          socket.to(fromSocketId).emit('privateMessage', message);
        } else {
          throw new Error(NOT_FOUND);
        }
      } catch (error) {
        socketError(error, socket);
      }
    });
    socket.on('disconnect', () => {
      console.log('a user disconnected');
      delete connectedUsers[socket.id];
      io.emit('connectedUsers', connectedUsers);
      console.log('connectedUsers', connectedUsers);
    });
  });
};
