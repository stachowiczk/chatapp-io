import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

export interface UserInterface extends mongoose.Document {
  username: string;
  password: string;
  validatePassword: (password: string) => Promise<boolean>;
  hashPassword: (password: string) => Promise<string>;
  friends: ObjectId[];
}

const userSchema = new mongoose.Schema<UserInterface>({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  friends: { type: [ObjectId], default: [] },
});

userSchema.methods.validatePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.hashPassword = async function (password: string) {
  return await bcrypt.hash(password, 10);
}


userSchema.methods.getFriends = function () {
  return this.friends;
}

const User = mongoose.model<UserInterface>('User', userSchema);

export default User;
