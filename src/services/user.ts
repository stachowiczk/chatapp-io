import User, { UserInterface } from '../models/user';

import {
  CONFLICT,
  VALIDATION_ERROR,
  NOT_FOUND,
  UNAUTHORIZED,
} from '../constants/constants';

export const addFriend = async (source: UserInterface, targetUser: string) => {
  const targetId = await User.findOne({ username: targetUser });
  if (!targetId) {
    throw new Error(NOT_FOUND);
  }
  if (source._id.equals(targetId?._id)) {
    throw new Error(CONFLICT);
  }
  console.log(source._id, targetId?._id);
  const entryAlreadyExists = await User.findOne({
    _id: source._id,
    friends: targetId,
  });
  if (entryAlreadyExists) {
    throw new Error(CONFLICT);
  }
  try {
    await User.updateOne(
      { _id: source._id },
      { $addToSet: { friends: targetId } }
    );
  } catch (err) {
    throw new Error(VALIDATION_ERROR);
  }
};

export const getFriends = async (user: UserInterface) => {
    const userDocument = await User.findOne({
        _id: user._id,
        });
    if (!userDocument) {
        throw new Error(NOT_FOUND);
    }
    const friends = userDocument?.friends;
    const friendsList = await User.find({
        _id: { $in: friends },
        }).select('username');

    return friendsList.map((friend) => friend.username);
}

export const addUser = async (username: string, password: string) => {
  try {
    const user = new User({
      username,
      password,
    });
    user.password = await user.hashPassword(password);
    await user.save();
  } catch (error) {
    throw new Error(VALIDATION_ERROR);
  }
};
