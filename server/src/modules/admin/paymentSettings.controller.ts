import { Request, Response } from 'express';
import { PaymentSettings } from '../../models/PaymentSettings.model';
import { handleError } from '../../utils/handleError';
import CustomError from '../../utils/CustomError';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import * as backblaze from '../../lib/backblaze';

// GET /payment-settings/qr-image — proxy for the Revolut QR code to handle Backblaze signed URL expiration
export const getQrImage = async (_req: Request, res: Response): Promise<void> => {
  try {
    const settings = await PaymentSettings.findOne();
    if (!settings || !settings.revolutQrUrl || !settings.revolutQrUrl.startsWith('settings/qr/')) {
      res.status(404).send('QR Code not found');
      return;
    }

    const signedUrl = await backblaze.generatePreviewUrl(settings.revolutQrUrl, 600); // 10 min validity for the redirect
    res.redirect(signedUrl);
  } catch (error) {
    handleError(error, res);
  }
};

// GET /admin/payment-settings — returns current settings (creates defaults if none exist)
export const getPaymentSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await PaymentSettings.findOne();
    if (!settings) {
      settings = await PaymentSettings.create({});
    }

    // Convert internal Backblaze key to a permanent proxy URL for the frontend
    let responseSettings = settings.toObject();
    if (responseSettings.revolutQrUrl && responseSettings.revolutQrUrl.startsWith('settings/qr/')) {
      const serverUrl = process.env.SERVER_URL || '';
      responseSettings.revolutQrUrl = `${serverUrl}/payment-settings/qr-image?t=${Date.now()}`;
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

    const updateData: any = { 
      revolutTag, 
      iban, 
      ibanRecipientName, 
      cashNote, 
      postpayNote 
    };

    // Only update revolutQrUrl if it's being cleared or set to a raw key.
    // We ignore incoming full URLs (proxy or signed) to avoid corrupting the key in the DB.
    if (revolutQrUrl === "" || (revolutQrUrl && revolutQrUrl.startsWith('settings/qr/'))) {
      updateData.revolutQrUrl = revolutQrUrl;
    }

    const settings = await PaymentSettings.findOneAndUpdate(
      {},
      updateData,
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
      // Delete the old QR code from B2 here to save space
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

    // Return the permanent proxy URL to the frontend
    const serverUrl = process.env.SERVER_URL || '';
    const proxyUrl = `${serverUrl}/payment-settings/qr-image?t=${Date.now()}`;

    res.json({ success: true, qrUrl: proxyUrl });
  } catch (error) {
    handleError(error, res);
  }
};
