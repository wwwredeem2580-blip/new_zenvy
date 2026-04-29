import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { IApplication } from '../models/Application.model';
import * as backblaze from '../lib/backblaze';
import { ensureInvoicesWorkspace } from '../modules/admin/workspace.service';

/**
 * Generates an invoice PDF and uploads it to Backblaze under the Invoices workspace
 */
export const generateAndUploadInvoice = async (application: IApplication): Promise<{ url: string; name: string }> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));

      // Calculate totals
      const subtotal = application.selectedServices.reduce((sum, s) => sum + s.price, 0);
      const fee = subtotal * 0.05;
      const total = subtotal + fee;
      
      const invoiceNumber = `INV-${application.applicationId}-${Date.now().toString().slice(-4)}`;
      const date = new Date().toLocaleDateString();

      // Ensure Invoices workspace exists
      const invoiceWs = await ensureInvoicesWorkspace();

      // --- Draw PDF Content --- //
      
      // Try to load the logo
      const logoPath = path.resolve(__dirname, '../../../client/public/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 50 });
      }

      // Header
      doc.fillColor('#444444')
         .fontSize(20)
         .text('Smart CAF.', 110, 57);
      
      doc.fontSize(10)
         .text('Tax & Immigration Services', 110, 80)
         .text('Via Roma 123, Milan, Italy', 110, 95)
         .text('info@smartcaf.com', 110, 110);

      // Invoice Details (Right Aligned)
      doc.fontSize(20)
         .text('INVOICE', 0, 57, { align: 'right' })
         .fontSize(10)
         .text(`Invoice Number: ${invoiceNumber}`, 0, 80, { align: 'right' })
         .text(`Date: ${date}`, 0, 95, { align: 'right' })
         .text(`Status: PAID`, 0, 110, { align: 'right' });

      doc.moveDown(4);

      // Bill To
      doc.fontSize(12).text('Bill To:', 50, 180);
      doc.fontSize(10)
         .text(`Name: ${application.name}`, 50, 200)
         .text(`Codice Fiscale: ${application.codiceFiscale}`, 50, 215)
         .text(`Email: ${application.email}`, 50, 230)
         .text(`Phone: ${application.phone}`, 50, 245)
         .text(`Address: ${application.address}`, 50, 260);

      // Table Header
      let y = 320;
      doc.fontSize(10).fillColor('#000000');
      doc.text('Service', 50, y);
      doc.text('Duration', 300, y);
      doc.text('Amount', 0, y, { align: 'right' });
      
      doc.moveTo(50, y + 15).lineTo(550, y + 15).strokeColor('#dddddd').stroke();
      
      y += 30;

      // Table Rows
      application.selectedServices.forEach(service => {
        doc.text(service.name, 50, y);
        doc.text(service.duration, 300, y);
        doc.text(`EUR ${service.price.toFixed(2)}`, 0, y, { align: 'right' });
        y += 25;
      });

      doc.moveTo(50, y).lineTo(550, y).strokeColor('#dddddd').stroke();
      y += 20;

      // Totals
      doc.text('Subtotal:', 350, y);
      doc.text(`EUR ${subtotal.toFixed(2)}`, 0, y, { align: 'right' });
      y += 20;
      
      doc.text('Processing Fee (5%):', 350, y);
      doc.text(`EUR ${fee.toFixed(2)}`, 0, y, { align: 'right' });
      y += 20;

      doc.font('Helvetica-Bold');
      doc.text('Total Paid:', 350, y);
      doc.text(`EUR ${total.toFixed(2)}`, 0, y, { align: 'right' });
      doc.font('Helvetica');

      // Footer
      doc.fontSize(10)
         .text(
           'Payment received with thanks. This document serves as official proof of payment.',
           50,
           700,
           { align: 'center', width: 500 }
         );

      doc.end();

      // Handle stream finish
      doc.on('end', async () => {
        const pdfBuffer = Buffer.concat(buffers);
        const filename = `${invoiceNumber}.pdf`;
        const objectKey = `workspaces/${invoiceWs._id}/${filename}`;

        // Upload to Backblaze
        try {
          const command = new PutObjectCommand({
            Bucket: process.env.BACKBLAZE_BUCKET_NAME!,
            Key: objectKey,
            Body: pdfBuffer,
            ContentType: 'application/pdf',
          });

          await backblaze.s3Client.send(command);

          resolve({
            url: objectKey,
            name: filename,
          });
        } catch (uploadError) {
          reject(uploadError);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
