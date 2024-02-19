import express from 'express';
import { Request, Express } from 'express';
import session, { SessionData } from 'express-session';
import 'express-session';
import bcrypt from 'bcrypt';
import User from './models/user';
import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  VerifiedCallback,
} from 'passport-jwt';

interface JwtPayload {
  _id: string;
}

const jwtSecret = 'secret';

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

export const initPassport = (app: Express) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(
    new JwtStrategy(
      jwtOptions,
      async (jwtPayload: JwtPayload, done: VerifiedCallback) => {
        try {
          const user: User | null = await User.findOne({username: jwtPayload._id});
          if (user) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
 return passport; 
};

export default initPassport;
