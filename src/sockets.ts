import { Server, Socket } from 'socket.io';
import { Request } from 'express';
import { findSocketId } from './constants/helpers';
import { saveMessage, getMessages } from './services/message';
import { Session } from 'express-session';
import User from './models/user';
import passport from 'passport';
declare module 'express-session' {
  interface Session {
    passport: {
      user: string;
    };
  }
}

declare module 'http' {
  interface IncomingMessage {
    session?: Session & Partial<Session>; // Add session
    sessionID?: string; // Add sessionID
    sessionStore?: any; // Add sessionStore
  }
}

const connectedUsers: Record<string, string> = {};

export const initSockets = async (
  io: Server,
  sessionMiddleware: any
): Promise<void> => {
  const wrap = (middleware: any) => (socket: Socket, next: any) =>
    middleware(socket.request, {}, next);
  io.use(wrap(sessionMiddleware));

  io.on('connection', async (socket: Socket) => {
    // add client to connected users, remove previous instance of user if exists
    const username = socket.handshake.auth.username;
    const session = socket.request.session;
    const sessionstore = socket.request.sessionStore;
    if (session) {
      const passportSession = session?.passport;
      console.log('passportSession', passportSession);
    }
    console.log('session', session, 'id', session.id);

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
