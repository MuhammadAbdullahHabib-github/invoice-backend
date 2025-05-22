import mongoose, { Schema, Document } from 'mongoose';

export interface ProductDocument extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model<ProductDocument>('Product', ProductSchema);
export default Product; 