import Message, { MessageObject } from '../models/message';
export const saveMessage = async (data: MessageObject) => {
  try {
    const { from, to, text } = data;
    const message = new Message({
      from,
      to,
      text,
      date: new Date(),
    });

    await message.save();

    return message;
  } catch (error) {
    console.error(error);
  }
};

export const getMessages = async (sender: string, recipient: string) => {
  try {
    const messages = await Message.find({
      $or: [
        { to: sender, from: recipient },
        { to: recipient, from: sender },
      ],
    });
    messages.sort((a, b) => a.date.getTime() - b.date.getTime());

    return messages;
  } catch (error) {
    console.error(error);
  }
};
