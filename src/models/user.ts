import mongoose from 'mongoose';

interface User {
  username: string;
  chats?: {
    [to: string]: {
      messages: {
        from: string;
        text: string;
        date: Date;
      }[];
    };
  };
}

const userSchema = new mongoose.Schema<User>({
  username: { type: String, required: true },
  chats: {
    type: Map,
    of: {
      messages: [
        {
          from: { type: String, required: true },
          text: { type: String, required: false },
          date: { type: Date, required: true },
        },
      ],
    },
  },
});

const User = mongoose.model<User>('User', userSchema);

export default User;


