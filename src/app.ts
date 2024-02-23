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
  app.use(cookieParser())
  await connectToDb();
  //const sessionMiddleware = initSession(app);
  const passport = initPassport(app);

  const io = new Server(server, {
    cors: corsOptions,
  });

  initSockets(io);

  app.get('/api/login', async (req, res, next) => {
    try {
      const token = req.cookies['token'];
      if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      jwt.verify(token, 'secret', async (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        const usernameFromToken = await User.findOne({
          _id: (decoded as any).id,
        });
        if (!usernameFromToken) {
          return res.status(404).json({ message: 'User not found' });
        }
        const username = usernameFromToken?.username;
        return res.status(200).json({
          username: username,
        });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/login', async (req, res) => {
    passport.authenticate(
      'local',
      { session: false },
      async (err, user, info) => {
        try {
          const token = jwt.sign({ id: user._id }, 'secret', {
            expiresIn: 60 * 60 * 24 * 7,
          });
          res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24 * 7,
          });
          return res.status(200).json({ok: 'ok'});
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Internal server error' });
        }
      }
    )(req, res);
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out' });
  });
  server.listen(3001, () => {
    console.log('Server is listening on port 3001');
  });
})();
