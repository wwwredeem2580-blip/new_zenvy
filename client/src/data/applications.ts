export type ApplicationStatus = "Pending" | "Reviewing" | "Approved" | "Rejected";

export interface SubService {
  name: string;
  price: number;
  duration: string;
}

export type ActivityType = 'status' | 'financial' | 'document' | 'note' | 'system' | 'reassignment';

export interface ActivityLogEntry {
  id: string;
  type: ActivityType;
  description: string;
  actorName: string;
  actorId: string;
  timestamp: string;
}

export interface Note {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  name: string;
  dob: string;
  pob: string;
  nationality: string;
  codiceFiscale: string;
  phone: string;
  email: string;
  address: string;
  streetAddress?: string;
  postCode?: string;
  province?: string;
  permessoType?: string;
  permessoExpiry?: string;
  paymentMethod?: 'Cash' | 'Revolut' | 'PostPay' | 'Card' | 'Credits';
  paymentStatus?: 'Pending' | 'Received';
  transactionId?: string;
  status: ApplicationStatus;
  submittedAt: string;
  selectedServices: SubService[];
  reviewerId?: string;
  reviewerName?: string;
  lastActivityAt?: string;
  refundAmount?: number;
  refundType?: 'Full' | 'Partial';
  notes?: Note[];
  activityLog?: ActivityLogEntry[];
}

export const mockApplications: Application[] = [
  {
    id: "CAF-882910",
    name: "Marco Rossi",
    dob: "1985-05-12",
    pob: "Rome, Italy",
    nationality: "Italian",
    codiceFiscale: "RSSMRA85E12H501W",
    phone: "+39 333 1234567",
    email: "marco.rossi@example.com",
    address: "Via del Corso 12, Rome",
    status: "Pending",
    submittedAt: "2024-03-10T10:00:00Z",
    selectedServices: [
      { name: "Cessione di fabbricato", price: 30, duration: "3 Days" },
      { name: "Modello 730", price: 50, duration: "7 Days" }
    ]
  },
  {
    id: "CAF-192837",
    name: "Sofia Bianchi",
    dob: "1992-09-21",
    pob: "Milan, Italy",
    nationality: "Italian",
    codiceFiscale: "BNCHSF92P61F205K",
    phone: "+39 347 9876543",
    email: "sofia.bianchi@example.com",
    address: "Corso Vittorio Emanuele II, Milan",
    status: "Reviewing",
    submittedAt: "2024-03-09T14:30:00Z",
    selectedServices: [
      { name: "Cittadinanza italiana", price: 150, duration: "30 Days" }
    ]
  },
  {
    id: "CAF-556677",
    name: "Ahmed Khan",
    dob: "1988-11-20",
    pob: "Dhaka, Bangladesh",
    nationality: "Bangladeshi",
    codiceFiscale: "KHNAHM88S20Z249H",
    phone: "+39 320 1122334",
    email: "ahmed.khan@example.com",
    address: "Via Padova 45, Milan",
    status: "Approved",
    submittedAt: "2024-03-08T09:15:00Z",
    selectedServices: [
      { name: "Ricongiungimento familiare", price: 80, duration: "14 Days" },
      { name: "Permesso di soggiorno – kit fill-up", price: 40, duration: "7 Days" }
    ]
  },
  {
    id: "CAF-123456",
    name: "Elena Popescu",
    dob: "1995-02-28",
    pob: "Bucharest, Romania",
    nationality: "Romanian",
    codiceFiscale: "PPSCEL95B68Z129W",
    phone: "+39 339 5566778",
    email: "elena.popescu@example.com",
    address: "Via Appia Nuova 200, Rome",
    status: "Rejected",
    submittedAt: "2024-03-07T16:45:00Z",
    selectedServices: [
      { name: "Tourist Visa", price: 150, duration: "14 Days" }
    ],
    paymentMethod: 'PostPay',
    paymentStatus: 'Pending'
  }
];
