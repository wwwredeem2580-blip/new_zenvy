import { Request, Response } from 'express';
import { PaymentSettings } from '../../models/PaymentSettings.model';
import { handleError } from '../../utils/handleError';
import CustomError from '../../utils/CustomError';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import * as backblaze from '../../lib/backblaze';

// GET /admin/payment-settings — returns current settings (creates defaults if none exist)
export const getPaymentSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = await PaymentSettings.create({});
    }

    // Convert internal Backblaze key to a presigned preview URL for the frontend
    let responseSettings = settings.toObject();
    if (responseSettings.revolutQrUrl && responseSettings.revolutQrUrl.startsWith('settings/qr/')) {
      responseSettings.revolutQrUrl = await backblaze.generatePreviewUrl(responseSettings.revolutQrUrl, 3600); // 1 hour validity
    }

    res.json({ success: true, settings: responseSettings });
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

// POST /admin/payment-settings/qr
export const uploadQrCode = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      throw new CustomError('No file uploaded', 400);
    }

    const timestamp = Date.now();
    const sanitizedFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `settings/qr/${timestamp}-${sanitizedFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
      Key: objectKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await backblaze.s3Client.send(command);

    // Update the database with the new key
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = await PaymentSettings.create({ revolutQrUrl: objectKey });
    } else {
      // Optional: Delete the old QR code from B2 here to save space
      if (settings.revolutQrUrl && settings.revolutQrUrl.startsWith('settings/qr/')) {
        try {
          await backblaze.deleteObject(settings.revolutQrUrl);
        } catch (e) {
          console.error("Failed to delete old QR code", e);
        }
      }
      settings.revolutQrUrl = objectKey;
      await settings.save();
    }

    // Generate a preview URL to return immediately to the admin UI
    const previewUrl = await backblaze.generatePreviewUrl(objectKey, 3600);

    res.json({ success: true, qrUrl: previewUrl });
  } catch (error) {
    handleError(error, res);
  }
};
