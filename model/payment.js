import { Schema as schema, model } from "mongoose";
const Schema = schema;
const paymentSchema = new Schema({
    amount: {
      type: Number,
      required: true,
    },
    paid: {
      type: Boolean,
    },
    SlotParkedUser: {
      type: Schema.Types.ObjectId,
      ref: 'SlotParkedUser',
      required: true,
    },
  });
  
  export default model('Payment', paymentSchema);
