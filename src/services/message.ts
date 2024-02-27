import { NOT_FOUND, VALIDATION_ERROR } from '../constants/constants';
import Message, { MessageInterface } from '../models/message';
import User from '../models/user';
import { addFriend, getFriends } from './user';
export const saveMessage = async (data: MessageInterface) => {
  try {
    const { from, to, text } = data;
    const user = await User.findOne({ username: to });
    const friends = await getFriends(user);
    if (!friends.includes(from)) {
      await addFriend(user, from);
    }
    const message = new Message({
      from,
      to,
      text,
      date: new Date(),
    });

    await message.save();

    return message;
  } catch (error) {
    throw new Error(VALIDATION_ERROR);
  }
};

export const getMessages = async (sender: string, recipient: string) => {
  try {
    const messages = await Message.find({
      $or: [
        { to: sender, from: recipient },
        { to: recipient, from: sender },
      ],
    })
      .sort({ date: 1 })
      .limit(100);

    return messages;
  } catch (error) {
    throw new Error(NOT_FOUND);
  }
};
