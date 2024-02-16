import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';

export const sessionMiddleware = session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
});

