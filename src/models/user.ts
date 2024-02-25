import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export interface UserInterface extends mongoose.Document {
  username: string;
  password: string;
  validatePassword: (password: string) => Promise<boolean>;
  friends: ObjectId[];
}

const userSchema = new mongoose.Schema<UserInterface>({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  friends: { type: [ObjectId], default: [] },
});

userSchema.methods.validatePassword = function (password: string) {
  return password === this.password;
};

userSchema.methods.getFriends = function () {
  return this.friends;
}

const User = mongoose.model<UserInterface>('User', userSchema);

export default User;
