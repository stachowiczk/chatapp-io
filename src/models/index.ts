import mongoose from 'mongoose';
import { DB_NAME, DB_URI } from '../constants/constants';

export const connectToDb = async () => {
  try {
    await mongoose.connect(`${DB_URI}/${DB_NAME}`, {});
    console.log('Connected to database');
  } catch (error) {
    console.error(error);
  }
};
