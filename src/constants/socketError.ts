import { MISSING_DATA, CONFLICT, NOT_FOUND, VALIDATION_ERROR, UNAUTHORIZED } from './constants';

// error handler for socket.io
export default (err, socket) => {
    let errorMessage = 'Internal server error';
    let errorCode = 500;

    switch (err.message) {
        case MISSING_DATA:
            errorMessage = 'Missing data';
            errorCode = 400;
            break;
        case CONFLICT:
            errorMessage = 'Conflict';
            errorCode = 409;
            break;
        case NOT_FOUND:
            errorMessage = 'Not found';
            errorCode = 404;
            break;
        case VALIDATION_ERROR:
            errorMessage = 'Validation error';
            errorCode = 400;
            break;
        case UNAUTHORIZED:
            errorMessage = 'Unauthorized';
            errorCode = 401;
            break;
    }

    socket.emit('errorResponse', { errorCode, errorMessage });
}