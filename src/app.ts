import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { initSession } from './session';
import { connectToDb } from './models';
import { initPassport } from './passport';
import { initSockets } from './sockets';

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
  await connectToDb();
  const sessionMiddleware = initSession(app);
  const passport = initPassport(app);
  
  const io = new Server(server, {
    cors: corsOptions,
  });


  initSockets(io, sessionMiddleware);

  app.post(
    '/api/login',
    passport.authenticate('local', {
      failureRedirect: '/',
    }),
    async (req, res) => {
        res.status(200).send('Logged in');
    }
  );

  server.listen(3001, () => {
    console.log('Server is listening on port 3001');
  });
})();
