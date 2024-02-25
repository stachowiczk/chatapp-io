import { Router } from 'express';
import User, { UserInterface } from '../models/user';
import { authenticate } from '../constants/helpers';
import f from 'session-file-store';

const usersRouter = Router();

usersRouter.post('/add', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ message: 'User not authenticated' });
    }
    const userToAdd = req.body.username;
    const userId = await User.findOne({ username: userToAdd }).select('_id');
    if ((user as UserInterface)._id === userId?._id) {
      return res.status(409).json({ message: 'Cannot add yourself' });
    }
    const entryAlreadyExists = await User.findOne({
      _id: (user as UserInterface)._id,
      friends: userId,
    });
    if (entryAlreadyExists) {
      return res.status(409).json({ message: 'Friend already added' });
    }
    await User.updateOne(
      { _id: (user as UserInterface)._id },
      { $addToSet: { friends: userId } }
    );
    return res.status(200).json({ message: 'Friend added' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

usersRouter.get('/friends', authenticate, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(403).json({ message: 'User not authenticated' });
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
