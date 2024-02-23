import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { initSession } from './session';
import { connectToDb } from './models';
import { initPassport } from './passport';
import { initSockets } from './sockets';
import jwt from 'jsonwebtoken';
import User from './models/user';
import cookieParser from 'cookie-parser';
import router from './api/loginRoutes';

(async function main(): Promise<void> {
  const app = express();
  const server = http.createServer(app);

  const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  await connectToDb();
  //const sessionMiddleware = initSession(app);
  const passport = initPassport(app);

  const io = new Server(server, {
    cors: corsOptions,
  });

  initSockets(io);

  //TODO: move to a middleware

  app.use('/', router);

  server.listen(3001, () => {
    console.log('Server is listening on port 3001');
  });
})();
