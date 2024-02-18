import express from 'express';
import session, { SessionData } from 'express-session';
import bcrypt from 'bcrypt';

interface ExtendedSessionData extends SessionData {
    username?: string;
}

export const sessionMiddleware = session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
});

export const login = (req: express.Request, res: express.Response) => {
    const { username, password } = req.body;
    if (username && password) {
        (req.session as ExtendedSessionData).username = username;
        res.status(200).json({ username });
    } else {
        res.status(400).send('Bad request');
    }
};

export const checkLogin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session && (req.session as ExtendedSessionData).username) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

export const logout = (req: express.Request, res: express.Response) => {
    if (req.session) {
        req.session.destroy(() => {
            res.status(204).send('Logged out');
        });
    } else {
        res.status(400).send('Bad request');
    }
};

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
};

export default {
    sessionMiddleware,
    login,
    checkLogin,
    logout,
    hashPassword,
    comparePasswords,
};
