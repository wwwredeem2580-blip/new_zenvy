import { jsPDF } from 'jspdf';

export interface InvoiceItem {
  brand?: string;
  name?: string;
  color?: string;
  specs?: string;
  quantity: number;
  price: number;
  total: number;
  description?: string;
}

export interface InvoiceData {
  shopName: string;
  invoiceNumber: string;
  date: string;
  time?: string;
  buyerName: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export interface SingleVariantSaleData {
  shopName: string;
  invoiceNumber: string;
  date: string;
  buyerName: string;
  productName: string;
  brandName: string;
  variantColor: string;
  variantSpecs: string;
  price: number;
  qty: number;
  total: number;
}

/**
 * Generates an elegant, professional A4 invoice PDF using jsPDF.
 */
export const generateBrandedInvoicePDF = (receipt: InvoiceData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const darkColor = [26, 28, 29]; // Clean charcoal black
  const greyColor = [110, 110, 115]; // Slate grey
  const lightBorder = [228, 228, 230]; // #e4e4e6 dividers

  // --- 1. Symmetrical Minimalist Header (Logo + Single Clean Left Stacked Row) ---
  try {
    // Symmetrical 12x12mm brand logo
    doc.addImage('/logo.png', 'PNG', 15, 12, 12, 12);
  } catch (e) {
    console.warn("Zenvy logo image load failed, continuing without image logo", e);
  }

  // Shop Brand Header Block: Lightweight but large font size, aligned perfectly next to logo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(20);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(`${receipt.shopName}.`, 30, 19.5); // Elegant dot at the end
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5); // Thinner, sharper
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text("Premium Smartphone Distribution Outlet", 30, 25);
  doc.text("Dhaka, Bangladesh  |  info@zenvy.com.bd", 30, 29.5);

  // Clickable WhatsApp Link - Formatted clean in matching grey
  doc.text("WhatsApp: +880 1712 345678", 30, 34);
  doc.link(30, 31, 45, 4, { url: "https://wa.me/8801712345678" });

  // Invoice Details (Right Aligned - Clean, lightweight and vertically matching left block)
  doc.setFont("helvetica", "normal"); 
  doc.setFontSize(20);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("INVOICE", 195, 19.5, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 85);
  doc.text(`Invoice Number: ${receipt.invoiceNumber}`, 195, 25, { align: "right" });
  doc.text(`Date: ${receipt.date}`, 195, 29.5, { align: "right" });
  doc.text(`Status: PAID`, 195, 34, { align: "right" });

  // --- 2. Clean Single Column Bill To Block ---
  let metaY = 52;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Bill To:", 15, metaY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text(`Name: ${receipt.buyerName}`, 15, metaY + 5.5);
  doc.text("Type: Walk-in Customer", 15, metaY + 10);
  doc.text("Channel: Verified Smartphone Transaction", 15, metaY + 14.5);

  // --- 3. Symmetrical Table Headers ---
  let yStart = metaY + 26;
  doc.setFont("helvetica", "normal"); 
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text("Service / Device Description", 15, yStart);
  doc.text("Unit Price", 125, yStart, { align: "right" });
  doc.text("Qty", 155, yStart, { align: "right" });
  doc.text("Amount", 195, yStart, { align: "right" });

  // Thin razor-sharp stroke divider line above/below headers
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.setLineWidth(0.15);
  doc.line(15, yStart + 2.5, 195, yStart + 2.5);

  let currentY = yStart + 2.5;

  receipt.items.forEach((item: InvoiceItem) => {
    currentY += 7.5;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 65);
    const desc = item.description || `${item.brand || ''} ${item.name || ''} - ${item.color || ''} (${item.specs || ''})`.trim();
    doc.text(desc, 15, currentY);

    doc.text(`Tk ${item.price.toLocaleString()}`, 125, currentY, { align: "right" });
    doc.text(String(item.quantity), 155, currentY, { align: "right" });
    
    doc.text(`Tk ${item.total.toLocaleString()}`, 195, currentY, { align: "right" });
  });

  currentY += 5.5;
  // Bottom border under table rows
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.setLineWidth(0.15);
  doc.line(15, currentY, 195, currentY);

  // --- 4. Symmetrical Totals Area ---
  currentY += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 85);
  doc.text("Subtotal:", 135, currentY);
  doc.text(`Tk ${receipt.subtotal.toLocaleString()}`, 195, currentY, { align: "right" });

  if (receipt.discount > 0) {
    currentY += 5;
    doc.text("Discount:", 135, currentY);
    doc.text(`-Tk ${receipt.discount.toLocaleString()}`, 195, currentY, { align: "right" });
  }

  currentY += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Total Paid:", 135, currentY);
  doc.text(`Tk ${receipt.total.toLocaleString()}`, 195, currentY, { align: "right" });

  // --- 4.5 Clean Unboxed Warranty Policy ---
  let warrantyY = currentY + 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("WARRANTY POLICY", 15, warrantyY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text("• Smartphone models include 1-Year Official Brand Warranty from the date of purchase printed on this invoice.", 15, warrantyY + 4.5);
  doc.text("• 7-Day Replacement Guarantee applies for verified manufacturer hardware faults, subject to diagnostic checks.", 15, warrantyY + 8.5);
  doc.text("• Warranty is strictly void if the device shows physical damage, water entry, seal tampering, or rooting/unofficial firmware modifications.", 15, warrantyY + 12.5);

  // --- 5. Clean Times-Italic Signature & outline Stamp ---
  let signatureY = warrantyY + 31;
  const signName = receipt.shopName.split(' ')[0] || 'Zenvy';
  
  doc.setFont("times", "italic");
  doc.setFontSize(26);
  doc.setTextColor(40, 40, 45);
  doc.text(signName, 15, signatureY);

  doc.setFont("helvetica", "normal"); 
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Authorized Representative", 15, signatureY + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text(`Founder, ${receipt.shopName}`, 15, signatureY + 11);

  // --- 6. Symmetrical OUTLINE PAID Stamp (Exactly like Reference!) ---
  doc.setDrawColor(90, 82, 213); // Indigo outline color
  doc.setTextColor(90, 82, 213);
  doc.setFont("times", "bold");
  doc.setFontSize(36);
  doc.setLineWidth(0.45);
  // @ts-ignore
  doc.text("PAID", 136, signatureY - 2, { angle: 10, renderingMode: "stroke" });

  // --- 6.5 Symmetrical QR Verification Code (Discrete 16x16mm size) ---
  const qrX = 179;
  const qrY = signatureY - 12;
  const qrSize = 16;

  // Discrete grey corners
  doc.setDrawColor(190, 190, 195);
  doc.setLineWidth(0.3);
  // Top-left
  doc.line(qrX, qrY, qrX + 2, qrY);
  doc.line(qrX, qrY, qrX, qrY + 2);
  // Top-right
  doc.line(qrX + qrSize, qrY, qrX + qrSize - 2, qrY);
  doc.line(qrX + qrSize, qrY, qrX + qrSize, qrY + 2);
  // Bottom-left
  doc.line(qrX, qrY + qrSize, qrX + 2, qrY + qrSize);
  doc.line(qrX, qrY + qrSize, qrX, qrY + qrSize - 2);
  // Bottom-right
  doc.line(qrX + qrSize, qrY + qrSize, qrX + qrSize - 2, qrY + qrSize);
  doc.line(qrX + qrSize, qrY + qrSize, qrX + qrSize, qrY + qrSize - 2);

  // Grey background for neat placement
  doc.setDrawColor(240, 240, 242);
  doc.setLineWidth(0.1);
  doc.rect(qrX + 0.5, qrY + 0.5, qrSize - 1, qrSize - 1);

  // Try to load online API generated QR
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://zenvy.com.bd/verify/' + receipt.invoiceNumber)}`;
    doc.addImage(qrUrl, 'PNG', qrX + 0.5, qrY + 0.5, qrSize - 1, qrSize - 1);
  } catch (e) {
    // Elegant mockup QR pixel box if offline
    doc.setFillColor(greyColor[0], greyColor[1], greyColor[2]);
    doc.rect(qrX + 2, qrY + 2, 3, 3, 'F');
    doc.rect(qrX + 11, qrY + 2, 3, 3, 'F');
    doc.rect(qrX + 2, qrY + 11, 3, 3, 'F');
    doc.rect(qrX + 6, qrY + 6, 2, 2, 'F');
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text("Scan to Verify", qrX + qrSize / 2, qrY + qrSize + 3.5, { align: "center" });
  // --- 7. Clean Monochromatic Footer ---
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.setLineWidth(0.2);
  doc.line(15, 262, 195, 262);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Thank you for your purchase!", 15, 268);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text("For support, warranties, or transaction inquiries, contact our customer helpdesk.", 15, 272);

  // Subtle powered by watermark
  doc.setFont("helvetica", "oblique");
  doc.setFontSize(7.5);
  doc.setTextColor(165, 165, 170);
  doc.text("Powered by Zenvy - Premium Smartphone Terminal", 195, 268, { align: "right" });
  doc.text("zenvy.com.bd", 195, 272, { align: "right" });

  doc.save(`${receipt.invoiceNumber}_invoice.pdf`);
};

/**
 * Maps single variant sale data to standard invoice layout and triggers generation.
 */
export const generateSingleVariantInvoicePDF = (data: SingleVariantSaleData) => {
  const A4Receipt: InvoiceData = {
    shopName: data.shopName,
    invoiceNumber: data.invoiceNumber,
    date: data.date,
    buyerName: data.buyerName,
    items: [{
      description: `${data.brandName} ${data.productName} - ${data.variantColor} (${data.variantSpecs})`,
      quantity: data.qty,
      price: data.price,
      total: data.total
    }],
    subtotal: data.total,
    discount: 0,
    total: data.total
  };
  generateBrandedInvoicePDF(A4Receipt);
};

/**
 * Compiles a WhatsApp share URL for a single variant sale.
 */
export const getWhatsAppShareUrl = (data: SingleVariantSaleData): string => {
  const textMessage = `Hello ${data.buyerName},\n\nThank you for purchasing at ${data.shopName}!\nHere is your receipt details:\n\n*Invoice No:* ${data.invoiceNumber}\n*Date:* ${data.date}\n*Device:* ${data.brandName} ${data.productName} - ${data.variantColor} (${data.variantSpecs})\n*Quantity:* ${data.qty}\n*Price:* Tk ${data.price.toLocaleString()}\n*Total Amount:* *Tk ${data.total.toLocaleString()}*\n\nThank you for shopping with us! Have a wonderful day! 🌟`;
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(textMessage)}`;
};
