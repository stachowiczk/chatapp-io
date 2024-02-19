import { Server } from 'socket.io';
import User from './models/user';
import Message, { MessageObject } from './models/message';
import { io } from 'socket.io-client';
import { findSocketId } from './constants/helpers';
import { saveMessage, getMessages } from './services/message';

export const initSockets = async (io: Server, session: any) => {
  const connectedUsers: Record<string, string> = {};
  io.on('connection', (socket) => {
    // add client to connected users, remove previous instance of user if exists
    const username = socket.handshake.auth.username;
    console.log('username', username);
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

    socket.on('selectChat', async (sender, recipient) => {
      const messages = await getMessages(sender, recipient);
      const socketId = findSocketId(sender, connectedUsers);
      if (socketId && messages) {
        io.to(socketId).emit('selectChat', messages);
      }
    });

    // send private message to specific client and sender
    socket.on('privateMessage', async (data) => {
      const message = await saveMessage(data);
      if (!message) {
        return;
      }
      const toSocketId = findSocketId(message.to, connectedUsers);
      const fromSocketId = findSocketId(message.from, connectedUsers);
      console.log('toSocketId', toSocketId);

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
