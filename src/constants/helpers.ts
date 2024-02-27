import jwt from 'jsonwebtoken';
import User from '../models/user';

// finds socketId by username
export const findSocketId = (
  username: string,
  users: { [username: string]: string }
) => {
  return Object.keys(users).find((key) => users[key] === username);
};

// authentication middleware
export const authenticate = async (req, res, next) => {
  const token = req.cookies['token'];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  jwt.verify(token, 'secret', async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const user = await User.findOne({
        _id: (decoded as any).id,
      });
      req.user = user;
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
    next();
  });
};
