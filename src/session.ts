import { Express } from "express";
import session from "express-session";
import fileStoreInitializer from "session-file-store";

export const initSession = (app: Express) => {
    const FileStore = fileStoreInitializer(session);

    const sessionMiddleware = session({
        store: new FileStore(),
        secret: "secret",
        resave: false,
        saveUninitialized: true,
    });
    app.use(sessionMiddleware);
    return sessionMiddleware;
}

export default initSession;


