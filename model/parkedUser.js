import { Schema as schema, model } from "mongoose";
const Schema = schema;
const slotParkedUserSchema = new Schema({
    customId: {
      type: String,
      default: null, // Use the uuidv4 function as the default value
      unique: true,
    },
    vehiclenumber: {
      type: String,
      required: true,
    },
    vehicletype: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    parkingSlot: {
      type: Schema.Types.ObjectId,
      ref: 'Parkingslot', 
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  });
  export default  model('SlotParkedUser', slotParkedUserSchema);
