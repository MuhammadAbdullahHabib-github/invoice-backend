import { Request, Response } from 'express';
import PDFTemplateSettings from '../models/PDFTemplateSettings';

export const getSettings = async (req: Request<{ userId: string }>, res: Response) => {
  const { userId } = req.params;
  const settings = await PDFTemplateSettings.findOne({ userId });
  if (!settings) return res.status(404).json({ message: 'Settings not found' });
  res.json(settings.settings);
};

export const saveSettings = async (req: Request<{ userId: string }>, res: Response) => {
  const { userId } = req.params;
  const { body } = req;
  let settings = await PDFTemplateSettings.findOneAndUpdate(
    { userId },
    { settings: body },
    { new: true, upsert: true }
  );
  res.json(settings.settings);
}; 