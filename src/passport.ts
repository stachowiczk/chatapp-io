import express from 'express';
import { Request, Express } from 'express';
import 'express-session';
import User, { UserInterface } from './models/user';
import passport from 'passport';
import { Strategy as LocalStrategy, VerifyFunction } from 'passport-local';

export const initPassport = (app: Express) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(
    new LocalStrategy(async (username: string, password: string, done: any) => {
      try {
        const user: UserInterface | null = await User.findOne({ username });
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validatePassword(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user: UserInterface | null = await User.findById(id);
      if (user) {
        done(null, user);
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err);
    }
  });

  return passport;
};

export default initPassport;
