import mongoose from "mongoose";

export interface MessageInterface extends mongoose.Document{
  from?: string;
  to: string;
  text?: string;
  date: Date;
}

const messageSchema = new mongoose.Schema<MessageInterface>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: false },
  date: { type: Date, required: true },
}); 

const Message = mongoose.model<MessageInterface>("Message", messageSchema);

export default Message;