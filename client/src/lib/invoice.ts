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

  // --- 1. Elegant Minimalist Header with Branding Logo ---
  try {
    doc.addImage('/logo.png', 'PNG', 15, 12, 10, 10);
  } catch (e) {
    console.warn("Zenvy logo image load failed, continuing without image logo", e);
  }

  // Shop Name: Lightweight but large font size, placed on a new line below logo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(22);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(receipt.shopName, 15, 30);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5); // Thinner, sharper
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text("Premium Smartphone Distribution Outlet", 15, 36);
  doc.text("Dhaka, Bangladesh  |  zenvy.com.bd", 15, 40.5);

  // Invoice Details (Right Aligned - Elegant Normal weight)
  doc.setFont("helvetica", "normal"); // Thinner, luxury aesthetic
  doc.setFontSize(18);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("INVOICE", 195, 22, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 85);
  doc.text(`Invoice Number: ${receipt.invoiceNumber}`, 195, 28, { align: "right" });
  doc.text(`Date: ${receipt.date}`, 195, 32.5, { align: "right" });
  doc.text(`Status: PAID`, 195, 37, { align: "right" });

  // --- 2. Billed To Block (Generous Spacing) ---
  let metaY = 56;
  
  // Left Column: Issued To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5); // Sharp, less bold
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Issued To:", 15, metaY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text(`Name: ${receipt.buyerName}`, 15, metaY + 5.5);
  doc.text("Type: Walk-in Customer", 15, metaY + 10);
  doc.text("Channel: Verified Smartphone Transaction", 15, metaY + 14.5);

  // Middle Column: Pay To & CLICKABLE WhatsApp
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Pay To / Outlet:", 95, metaY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text(`Outlet: ${receipt.shopName}`, 95, metaY + 5.5);
  doc.text("Phone: +880 1712 345678", 95, metaY + 10);
  doc.text("Website: zenvy.com.bd", 95, metaY + 14.5);

  // Shop WhatsApp (Clickable & Color Coded)
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 197, 94); // Green WhatsApp ink color
  doc.text("WhatsApp: +880 1712 345678", 95, metaY + 19);
  doc.link(95, metaY + 15.5, 60, 4.5, { url: "https://wa.me/8801712345678" });

  // Reset text color
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);

  // --- 3. Elegant Table Headers ---
  let yStart = metaY + 28;
  doc.setFont("helvetica", "normal"); // Thinner than bold
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text("Service / Device Description", 15, yStart);
  doc.text("Unit Price", 125, yStart, { align: "right" });
  doc.text("Qty", 155, yStart, { align: "right" });
  doc.text("Amount", 195, yStart, { align: "right" });

  // Thin razor-sharp stroke divider
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.setLineWidth(0.2);
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
  doc.setLineWidth(0.2);
  doc.line(15, currentY, 195, currentY);

  // --- 4. Totals Area ---
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
  doc.setFont("helvetica", "normal");
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Total Paid:", 135, currentY);
  doc.text(`Tk ${receipt.total.toLocaleString()}`, 195, currentY, { align: "right" });

  // --- 4.5 Elegant Warranty Policy Coverage Block ---
  let warrantyY = currentY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("WARRANTY POLICY & SYSTEM COVERAGE", 15, warrantyY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text("• Smartphone models include 1-Year Official Brand Warranty from the date of purchase printed on this invoice.", 15, warrantyY + 4.5);
  doc.text("• 7-Day Replacement Guarantee applies for verified manufacturer hardware faults, subject to diagnostic checks.", 15, warrantyY + 8.5);
  doc.text("• Warranty is strictly void if the device shows physical damage, water entry, seal tampering, or rooting/unofficial firmware modifications.", 15, warrantyY + 12.5);
  
  // Border wrapper for Warranty section to make it look legit and premium
  doc.setDrawColor(235, 235, 238);
  doc.setLineWidth(0.2);
  doc.rect(13, warrantyY - 3.5, 184, 19);

  // --- 5. Clean Times-Italic Signature & QR Code ---
  let signatureY = warrantyY + 31;
  const signName = receipt.shopName.split(' ')[0] || 'Zenvy';
  
  doc.setFont("times", "italic");
  doc.setFontSize(26);
  doc.setTextColor(40, 40, 45);
  doc.text(signName, 15, signatureY);

  doc.setFont("helvetica", "normal"); // sharp and less bold
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Authorized Representative", 15, signatureY + 6.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text(`Founder, ${receipt.shopName}`, 15, signatureY + 11);

  // --- 6. PAID Stamp Overlay ---
  doc.setTextColor(90, 82, 213); // matching SmartCAF indigo color
  doc.setFont("times", "bold");
  doc.setFontSize(36);
  doc.text("PAID", 136, signatureY - 2, { angle: 10 });

  // --- 6.5 QR Verification Code (Scanner bracket corners + QR) ---
  const qrX = 173;
  const qrY = signatureY - 14;
  const qrSize = 22;

  // Scanner bracket corners
  doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.setLineWidth(0.45);
  // Top-left
  doc.line(qrX, qrY, qrX + 3, qrY);
  doc.line(qrX, qrY, qrX, qrY + 3);
  // Top-right
  doc.line(qrX + qrSize, qrY, qrX + qrSize - 3, qrY);
  doc.line(qrX + qrSize, qrY, qrX + qrSize, qrY + 3);
  // Bottom-left
  doc.line(qrX, qrY + qrSize, qrX + 3, qrY + qrSize);
  doc.line(qrX, qrY + qrSize, qrX, qrY + qrSize - 3);
  // Bottom-right
  doc.line(qrX + qrSize, qrY + qrSize, qrX + qrSize - 3, qrY + qrSize);
  doc.line(qrX + qrSize, qrY + qrSize, qrX + qrSize, qrY + qrSize - 3);

  // Clean grey border background for safety
  doc.setDrawColor(230, 230, 235);
  doc.setLineWidth(0.15);
  doc.rect(qrX + 1, qrY + 1, qrSize - 2, qrSize - 2);

  // Try to load online API generated QR
  try {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('https://zenvy.com.bd/verify/' + receipt.invoiceNumber)}`;
    doc.addImage(qrUrl, 'PNG', qrX + 1, qrY + 1, qrSize - 2, qrSize - 2);
  } catch (e) {
    // Elegant mockup QR pixel box if offline
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(qrX + 3, qrY + 3, 5, 5, 'F');
    doc.rect(qrX + 14, qrY + 3, 5, 5, 'F');
    doc.rect(qrX + 3, qrY + 14, 5, 5, 'F');
    doc.rect(qrX + 9, qrY + 9, 4, 4, 'F');
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text("QR Verification Secure Link", qrX + qrSize / 2, qrY + qrSize + 4.5, { align: "center" });

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
