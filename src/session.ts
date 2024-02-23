// deprecated: now using jwt

import session from 'express-session';
import fileStoreInitializer from 'session-file-store';
import path from 'path';

export const initSession = (app: any) => {
  const FileStore = fileStoreInitializer(session);

  const sessionMiddleware = session({
    store: new FileStore({
      path: path.join(__dirname, '../sessions'),
    }),
    secret: 'secret',
    name: 'connect.sid', // name of the cookie
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: false,
      sameSite: 'none',
    },
  });
  app.use(sessionMiddleware);

  return sessionMiddleware;
};

export default { initSession };
