import { Router } from 'express';
import User, { UserInterface } from '../models/user';
import { authenticate } from '../constants/helpers';
import errorResponse from '../constants/errorResponse';
import { addFriend } from '../services/user';
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
    const userDocument = await User.findOne({
      _id: (user as UserInterface)._id,
    });
    // get friends array from user document
    const friends = userDocument?.friends;

    // get friends documents from db
    const friendsList = await User.find({
      _id: { $in: friends },
    }).select('username');
    // get usernames from friends documents
    const usernames = friendsList.map((friend) => friend.username);

    return res.status(200).json({ friends: usernames });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default usersRouter;
