import { Router } from 'express';
import User from '../models/user';
import jwt from 'jsonwebtoken';
import passport from 'passport';

const router = Router();

// This verifies if the user is logged in
router.get('/api/login', async (req, res, next) => {
  try {
    const token = req.cookies['token'];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    jwt.verify(token, 'secret', async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const usernameFromToken = await User.findOne({
        _id: (decoded as any).id,
      });
      if (!usernameFromToken) {
        return res.status(404).json({ message: 'User not found' });
      }
      const username = usernameFromToken?.username;
      return res.status(200).json({
        username: username,
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});
// Login route
router.post('/api/login', async (req, res) => {
  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      try {
        const token = jwt.sign({ id: user._id }, 'secret', {
          expiresIn: 60 * 60 * 24 * 7,
        });
        res.cookie('token', token, {
          httpOnly: true,
          secure: false,
          maxAge: 1000 * 60 * 60 * 24 * 7,
        });
        return res.status(200).json({ ok: 'ok' });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  )(req, res);
});

router.post('/api/logout', (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out' });
  } catch (error) {
    return res.status(400).json({ message: 'already logged out' });
  }
});

export default router;
