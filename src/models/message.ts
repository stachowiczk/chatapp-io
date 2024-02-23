import mongoose from "mongoose";

export interface MessageObject {
  from?: string;
  to: string;
  text?: string;
  date: Date;
}

const messageSchema = new mongoose.Schema<MessageObject>({
  from: { type: String, required: true },
  to: { type: String, required: true },
  text: { type: String, required: false },
  date: { type: Date, required: true },
}); 

const Message = mongoose.model<MessageObject>("Message", messageSchema);

export default Message;