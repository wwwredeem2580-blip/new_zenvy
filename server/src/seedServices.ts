import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import { Service } from './models/Service.model';

const services = [
  {
    id: "servizi-caf",
    name: "SERVIZI CAF",
    icon: "FileText",
    subservices: [
      { name: "Cessione di fabbricato", price: 30, duration: "3 Days", requiredDocuments: [{ label: "Passport", required: true }, { label: "Contract", required: true }] },
      { name: "Idoneità alloggiativa / alloggio", price: 50, duration: "7 Days", requiredDocuments: [{ label: "Passport", required: true }] },
      { name: "Richiesta Carta d’Identità Elettronica (CIE)", price: 25, duration: "5 Days", requiredDocuments: [{ label: "Passport", required: true }, { label: "NID", required: true }] },
      { name: "Dichiarazione di residenza", price: 30, duration: "5 Days", requiredDocuments: [{ label: "Passport", required: true }] },
      { name: "Permesso di soggiorno – kit fill-up", price: 40, duration: "7 Days", requiredDocuments: [{ label: "Passport", required: true }, { label: "Old Permesso", required: true }] },
    ],
  },
  {
    id: "visti",
    name: "VISTI",
    icon: "IdCard",
    subservices: [
      { 
        name: "Umrah Visa", 
        price: 200, 
        duration: "10 Days", 
        requiredDocuments: [
          { label: "Passport Copy", required: true, instruction: "Valid for min 6 months" },
          { label: "Recent Passport Photo", required: true, instruction: "White background, 2x2 inch" },
          { label: "NID Copy", required: true },
          { label: "Bank Statement", required: false, instruction: "Last 3 months" }
        ] 
      },
      { name: "Tourist Visa", price: 150, duration: "14 Days", requiredDocuments: [{ label: "Passport Copy", required: true }] },
    ],
  },
  {
    id: "embassy-services",
    name: "SERVIZI AMBESSATA / EMBASSY SERVICES",
    icon: "Building2",
    subservices: [
      { 
        name: "Birth certificate", 
        price: 50, 
        duration: "14 Days",
        requiredDocuments: [
          { label: "Mother's NID Front", required: true },
          { label: "Mother's NID Back", required: true },
          { label: "Father's NID Front", required: true },
          { label: "Father's NID Back", required: true },
          { label: "Hospital Birth Document", required: true },
          { label: "Marriage Certificate", required: false }
        ]
      },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log('Connected to MongoDB');

  for (const s of services) {
    await Service.findOneAndUpdate({ id: s.id }, s, { upsert: true, new: true });
    console.log(`Seeded service: ${s.name}`);
  }

  console.log('Seeding complete');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
