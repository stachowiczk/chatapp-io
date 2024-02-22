import {  Express } from 'express';
import User, { UserInterface } from './models/user';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

export const initPassport = (app: Express) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(
    new LocalStrategy(async (username: string, password: string, done: any) => {
      try {
        const user: UserInterface | null = await User.findOne({ username }).exec();
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        const isValid = user.validatePassword(password);
        if (!isValid) {
          console.log('Incorrect password');
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user, { message: 'Logged In Successfully' });
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
      const user: UserInterface | null = await User.findOne({ _id: id }).exec();
      return done(null, user);
    } catch (err) {
      done(err);
    }
  });

  return passport;
};

export default initPassport;
