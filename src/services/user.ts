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
