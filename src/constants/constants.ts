export const DB_URI = 'mongodb://localhost:27017';
export const DB_NAME = 'chat';
export const SERVER_PORT = 4000;
export const CLIENT_PORT = 3000;
export const CLIENT_URL = `http://localhost:${CLIENT_PORT}`;
export const CORS_OPTIONS = {
  origin: CLIENT_URL,
  credentials: true,
};

export const CONFLICT = 'CONFLICT';
export const NOT_FOUND = 'NOT_FOUND';
export const VALIDATION_ERROR = 'VALIDATION_ERROR';
export const UNAUTHORIZED = 'UNAUTHORIZED';

