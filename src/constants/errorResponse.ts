import { CONFLICT, NOT_FOUND, VALIDATION_ERROR, UNAUTHORIZED, MISSING_DATA } from './constants';

// error handler for REST API
export default (err, res) => {
    switch (err.message) {
        case MISSING_DATA:
            return res.status(400).json({ message: 'Missing data' });
        case CONFLICT:
            return res.status(409).json({ message: 'Conflict' });
        case NOT_FOUND:
            return res.status(404).json({ message: 'Not found' });
        case VALIDATION_ERROR:
            return res.status(400).json({ message: 'Validation error' });
        case UNAUTHORIZED:
            return res.status(401).json({ message: 'Unauthorized' });
        default:
            return res.status(500).json({ message: 'Internal server error' });
    }
}

