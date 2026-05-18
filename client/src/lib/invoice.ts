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
  const greyColor = [100, 100, 105]; // Slate grey
  const lightBorder = [221, 221, 221]; // #dddddd dividers

  // --- 1. Elegant Minimalist Header with Branding Logo ---
  try {
    doc.addImage('/logo.png', 'PNG', 15, 14, 10, 10);
  } catch (e) {
    console.warn("Zenvy logo image load failed, continuing without image logo", e);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(receipt.shopName, 28, 22.5);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text("Premium Smartphone Distribution Outlet", 15, 32);
  doc.text("Dhaka, Bangladesh  |  Phone: 01712 345678  |  zenvy.com.bd", 15, 37);

  // Invoice Details (Right Aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("INVOICE", 195, 26, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(80, 80, 85);
  doc.text(`Invoice Number: ${receipt.invoiceNumber}`, 195, 32, { align: "right" });
  doc.text(`Date: ${receipt.date}`, 195, 37, { align: "right" });
  doc.text(`Status: PAID`, 195, 42, { align: "right" });

  // --- 2. Billed To Block (Generous Spacing) ---
  let metaY = 58;
  
  // Left Column: Issued To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Issued To:", 15, metaY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text(`Name: ${receipt.buyerName}`, 15, metaY + 6);
  doc.text("Type: Walk-in Customer", 15, metaY + 11);
  doc.text("Channel: Verified Smartphone Transaction", 15, metaY + 16);

  // Middle Column: Pay To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Pay To / Outlet:", 95, metaY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text(`Outlet: ${receipt.shopName}`, 95, metaY + 6);
  doc.text("Phone: +8801712345678", 95, metaY + 11);
  doc.text("Website: zenvy.com.bd", 95, metaY + 16);

  // --- 3. Elegant Table Headers ---
  let yStart = metaY + 29;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("Service / Device", 15, yStart);
  doc.text("Unit Price", 125, yStart, { align: "right" });
  doc.text("Duration / Qty", 155, yStart, { align: "right" });
  doc.text("Amount", 195, yStart, { align: "right" });

  // Thin stroke divider matching '#dddddd'
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.setLineWidth(0.4);
  doc.line(15, yStart + 3, 195, yStart + 3);

  let currentY = yStart + 3;

  receipt.items.forEach((item: InvoiceItem) => {
    currentY += 8;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(68, 68, 68);
    const desc = item.description || `${item.brand || ''} ${item.name || ''} - ${item.color || ''} (${item.specs || ''})`.trim();
    doc.text(desc, 15, currentY);

    doc.text(`Tk ${item.price.toLocaleString()}`, 125, currentY, { align: "right" });
    doc.text(String(item.quantity), 155, currentY, { align: "right" });
    
    doc.text(`Tk ${item.total.toLocaleString()}`, 195, currentY, { align: "right" });
  });

  currentY += 6;
  // Bottom border under table rows
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.setLineWidth(0.4);
  doc.line(15, currentY, 195, currentY);

  // --- 4. Totals Area ---
  currentY += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(68, 68, 68);
  doc.text("Subtotal:", 135, currentY);
  doc.text(`Tk ${receipt.subtotal.toLocaleString()}`, 195, currentY, { align: "right" });

  if (receipt.discount > 0) {
    currentY += 6;
    doc.text("Discount:", 135, currentY);
    doc.text(`-Tk ${receipt.discount.toLocaleString()}`, 195, currentY, { align: "right" });
  }

  currentY += 7;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Total Paid:", 135, currentY);
  doc.text(`Tk ${receipt.total.toLocaleString()}`, 195, currentY, { align: "right" });

  // --- 5. Clean Times-Italic Signature ---
  let signatureY = 222;
  const signName = receipt.shopName.split(' ')[0] || 'Zenvy';
  
  doc.setFont("times", "italic");
  doc.setFontSize(32);
  doc.setTextColor(0, 0, 0);
  doc.text(signName, 15, signatureY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Authorized Representative", 15, signatureY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text(`Founder, ${receipt.shopName}`, 15, signatureY + 13);

  // --- 6. PAID Stamp Overlay (Slanted Indigo Ink Stamp) ---
  doc.setTextColor(90, 82, 213); // #5a52d5 matching SmartCAF color
  doc.setFont("times", "bold");
  doc.setFontSize(44);
  doc.text("PAID", 142, signatureY + 2, { angle: 12 });

  // --- 7. Clean Monochromatic Footer ---
  doc.setDrawColor(lightBorder[0], lightBorder[1], lightBorder[2]);
  doc.setLineWidth(0.3);
  doc.line(15, 262, 195, 262);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text("Thank you for your purchase!", 15, 268);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(greyColor[0], greyColor[1], greyColor[2]);
  doc.text("For support, warranties, or transaction inquiries, contact our customer helpdesk.", 15, 272);

  // Subtle powered by watermark
  doc.setFont("helvetica", "oblique");
  doc.setFontSize(7.5);
  doc.setTextColor(165, 165, 170);
  doc.text("Powered by StockNet - Premium Smartphone Terminal", 195, 268, { align: "right" });
  doc.text("zenvy.com.bd/stocknet", 195, 272, { align: "right" });

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
