import { Router } from 'express';
import User, { UserInterface } from '../models/user';
import { authenticate } from '../constants/helpers';
import errorResponse from '../constants/errorResponse';
import { addFriend, getFriends } from '../services/user';
import { UNAUTHORIZED } from '../constants/constants';

const usersRouter = Router();

usersRouter.post('/add', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error(UNAUTHORIZED);
    }
    const userToAdd = req.body.username;
    await addFriend(user as UserInterface, userToAdd);
    return res.status(200).json({ message: 'Friend added' });
  } catch (err) {
    return errorResponse(err, res);
  }
});

usersRouter.get('/friends', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
        throw new Error(UNAUTHORIZED);
    }
    // get user document from db
    const usernames = await getFriends(user as UserInterface);

    return res.status(200).json({ friends: usernames });
  } catch (error) {
    return errorResponse(error, res);
  }
});

export default usersRouter;
