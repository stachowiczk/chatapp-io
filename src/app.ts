import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { connectToDb } from './models';
import { initPassport } from './passport';
import { initSockets } from './sockets';
import cookieParser from 'cookie-parser';
import loginRouter from './api/loginRoutes';
import usersRouter from './api/usersRoutes';
import { CORS_OPTIONS, SERVER_PORT } from './constants/constants';

(async function main(): Promise<void> {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: CORS_OPTIONS,
  });

  app.use(cors(CORS_OPTIONS));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  await connectToDb();

  initPassport(app);

  initSockets(io);

  app.use('/api/auth', loginRouter);
  app.use('/api/users', usersRouter);

  app.use((_, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  server.listen(SERVER_PORT, () => {
    console.log('Server running on port', SERVER_PORT);
  });
})();
