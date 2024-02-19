import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import initSession from './session';
import { connectToDb } from './models';
import { initPassport } from './passport';
import { initSockets } from './sockets';

import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    username: string;
  }
}

(async function main(): Promise<void> {
  const app = express();
  const server = http.createServer(app);

  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  const sessionMiddleware = initSession(app);
  const passport = initPassport(app);

  await connectToDb();

  const io = new Server(server, {
    cors: corsOptions,
  });

  const sockets = initSockets(io, sessionMiddleware);

  app.post('/api/login', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.status(200).send('Login successful');
  });

  server.listen(3001, () => {
    console.log('Server is listening on port 3001');
  });
})();
