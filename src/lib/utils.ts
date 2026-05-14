import { jsPDF } from "jspdf";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateInvoice(clientData: { name: string, email: string, amount: string, services: string[] }) {
  const doc = new jsPDF();

  // Branding
  doc.setFontSize(22);
  doc.setTextColor(99, 102, 241); // indigo-500
  doc.text("LUMINA CREATIVE OS", 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text("Digital Excellence Delivered", 20, 38);

  // Invoice Details
  doc.setFontSize(16);
  doc.setTextColor(30);
  doc.text("INVOICE", 20, 60);

  doc.setFontSize(10);
  doc.text(`Invoice No: INV-${Date.now().toString().slice(-6)}`, 20, 70);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 75);

  // Client Info
  doc.text("BILL TO:", 140, 60);
  doc.setFontSize(12);
  doc.text(clientData.name, 140, 68);
  doc.setFontSize(10);
  doc.text(clientData.email, 140, 73);

  // Line Items
  doc.setDrawColor(230);
  doc.line(20, 90, 190, 90);
  
  doc.setFontSize(11);
  doc.text("Service Description", 20, 100);
  doc.text("Amount", 170, 100, { align: "right" });

  let y = 110;
  clientData.services.forEach(service => {
    doc.text(service, 20, y);
    y += 10;
  });

  doc.line(20, y + 5, 190, y + 5);
  
  doc.setFontSize(14);
  doc.text("TOTAL DUE", 20, y + 20);
  doc.text(`$${clientData.amount}`, 170, y + 20, { align: "right" });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(180);
  doc.text("Thank you for choosing Brandavox AI. Payment is due within 14 days.", 105, 280, { align: "center" });

  doc.save(`invoice_${clientData.name.toLowerCase().replace(/\s+/g, '_')}.pdf`);
}
