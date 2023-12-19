import { Schema as schema, model } from "mongoose";
const Schema = schema;
import bcrypt from 'bcrypt';

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: 1,
  },
  Role: {
    type: String,
    default: 3,
  },
  Created_At: {
    type: Date,
    default: null,
  },
  Updated_At: {
    type: Date,
    default: null,
  },
  is_Deleted: {
    type: Boolean,
    default: 0,
  },
  is_verified: {
    type: String,
    default: 0,
  },
  verification_timestamp: {
    type: Date,
    default: null,
  },
});
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default model("User", userSchema);