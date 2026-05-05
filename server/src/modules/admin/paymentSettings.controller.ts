import { Request, Response } from 'express';
import { PaymentSettings } from '../../models/PaymentSettings.model';
import { handleError } from '../../utils/handleError';

// GET /admin/payment-settings — returns current settings (creates defaults if none exist)
export const getPaymentSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = await PaymentSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    handleError(error, res);
  }
};

// PUT /admin/payment-settings — upsert settings
export const updatePaymentSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      revolutTag,
      revolutQrUrl,
      iban,
      ibanRecipientName,
      cashNote,
      postpayNote,
    } = req.body;

    const settings = await PaymentSettings.findOneAndUpdate(
      {},
      { revolutTag, revolutQrUrl, iban, ibanRecipientName, cashNote, postpayNote },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ success: true, settings });
  } catch (error) {
    handleError(error, res);
  }
};
