import mongoose, { Schema, Document, Types } from 'mongoose';

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface CustomerDocument extends Document {
  name: string;
  email: string;
  contact?: string;
  vehicleNo?: string;
  carModel?: string;
  avatar?: string;
  address?: Address;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<Address>({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String,
}, { _id: false });

const CustomerSchema = new Schema<CustomerDocument>({
  name: { type: String, required: true },
  email: { type: String, required: false, lowercase: true },
  contact: { type: String },
  vehicleNo: { type: String },
  carModel: { type: String },
  avatar: { type: String },
  address: { type: AddressSchema },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Customer = mongoose.model<CustomerDocument>('Customer', CustomerSchema);
export default Customer; 