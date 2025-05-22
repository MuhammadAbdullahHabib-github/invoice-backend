import mongoose, { Schema, Document, Types } from 'mongoose';

export type InvoiceStatus = 'pending' | 'sent' | 'paid' | 'overdue';

export interface LineItem {
  id: string;
  particulars: string;
  rate: number;
  amount: number;
  quantity: number;
}

export interface InvoiceDocument extends Document {
  invoiceNumber: string;
  amount: number;
  dueDate: Date;
  status: InvoiceStatus;
  customerId: Types.ObjectId;
  userId: Types.ObjectId;
  lineItems: LineItem[];
  meterReading?: string;
  customFields?: Record<string, string>;
  name?: string;
  vehicleNo?: string;
  carModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<InvoiceDocument>({
  invoiceNumber: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['draft', 'pending', 'sent', 'paid', 'overdue'],
    default: 'pending',
    required: true,
  },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lineItems: [{
    id: { type: String, required: true },
    particulars: { type: String, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
    quantity: { type: Number, required: true }
  }],
  meterReading: { type: String },
  customFields: { type: Object },
  name: { type: String },
  vehicleNo: { type: String },
  carModel: { type: String },
}, { timestamps: true });

const Invoice = mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema);
export default Invoice; 