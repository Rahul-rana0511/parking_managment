import { Schema as schema, model } from "mongoose";
const Schema = schema;

const parkingslotSchema = new Schema({
    slotNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    parkingid: {
      type: Schema.Types.ObjectId,
      ref: 'Area', 
      required: true,
    },
  });
  
export default  model('Parkingslot', parkingslotSchema);

