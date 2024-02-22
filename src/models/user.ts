import mongoose from 'mongoose';

export interface UserInterface extends mongoose.Document {
  username: string;
  password: string;
  validatePassword: (password: string) => Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserInterface>({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
});

userSchema.methods.validatePassword = function (password: string) {
  return password === this.password;
};

const User = mongoose.model<UserInterface>('User', userSchema);

export default User;
