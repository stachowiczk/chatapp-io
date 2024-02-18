import mongoose from "mongoose";

export interface Message {
  from: string;
  to: string;
  text?: string;
  date: Date;
}

const messageSchema = new mongoose.Schema<Message>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: false },
  date: { type: Date, required: true },
}); 

const Message = mongoose.model<Message>("Message", messageSchema);

export default Message;