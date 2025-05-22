import mongoose, { Schema, Document } from 'mongoose';

export interface PDFTemplateSettingsDocument extends Document {
  userId: string;
  settings: object;
  createdAt: Date;
  updatedAt: Date;
}

const PDFTemplateSettingsSchema = new Schema<PDFTemplateSettingsDocument>(
  {
    userId: { type: String, required: true, unique: true },
    settings: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const PDFTemplateSettings = mongoose.model<PDFTemplateSettingsDocument>(
  'PDFTemplateSettings',
  PDFTemplateSettingsSchema
);

export default PDFTemplateSettings; 