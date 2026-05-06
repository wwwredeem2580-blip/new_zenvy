import { Request, Response } from 'express';
import { ContactSettings } from '../../models/ContactSettings.model';
import { handleError } from '../../utils/handleError';

// GET /contact-settings (and /admin/contact-settings)
export const getContactSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await ContactSettings.findOne();
    if (!settings) {
      settings = await ContactSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    handleError(error, res);
  }
};

// PUT /admin/contact-settings
export const updateContactSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { whatsappNumber, supportEmail, supportPhone } = req.body;

    const settings = await ContactSettings.findOneAndUpdate(
      {},
      { whatsappNumber, supportEmail, supportPhone },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, settings });
  } catch (error) {
    handleError(error, res);
  }
};
