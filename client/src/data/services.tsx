import React from 'react';
import { FileText, Building2, Globe, IdCard } from 'lucide-react';

export interface SubService {
  name: string;
  price: number;
  duration: string;
}

export interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  subservices: SubService[];
}

export const services: Service[] = [
  {
    id: "servizi-caf",
    name: "SERVIZI CAF",
    icon: <FileText size={20} />,
    subservices: [
      { name: "Cessione di fabbricato", price: 30, duration: "3 Days" },
      { name: "Idoneità alloggiativa / alloggio", price: 50, duration: "7 Days" },
      { name: "Richiesta Carta d’Identità Elettronica (CIE)", price: 25, duration: "5 Days" },
      { name: "Dichiarazione di residenza", price: 30, duration: "5 Days" },
      { name: "Permesso di soggiorno – kit fill-up", price: 40, duration: "7 Days" },
      { name: "Carta di soggiorno – kit fill-up", price: 45, duration: "7 Days" },
      { name: "Ricongiungimento familiare", price: 80, duration: "14 Days" },
      { name: "Cittadinanza italiana", price: 150, duration: "30 Days" },
      { name: "NASPI – disoccupazione", price: 35, duration: "5 Days" },
      { name: "Assegno Unico Universale", price: 20, duration: "3 Days" },
      { name: "Assegno di inclusione", price: 25, duration: "3 Days" },
      { name: "Assegno nucleo familiare", price: 20, duration: "3 Days" },
      { name: "Invalidità civile", price: 60, duration: "10 Days" },
      { name: "Dimissione volontaria", price: 15, duration: "1 Day" },
      { name: "SFL (Servizio di formazione lavoro)", price: 30, duration: "5 Days" },
      { name: "ISEE (Indicatore Situazione Economica Equivalente)", price: 0, duration: "2 Days" },
      { name: "Modello 730", price: 50, duration: "7 Days" },
      { name: "Modello Unico (Persone fisiche)", price: 70, duration: "10 Days" },
      { name: "F24 (Pagamenti fiscali)", price: 10, duration: "1 Day" },
      { name: "Firma digitale", price: 40, duration: "2 Days" },
      { name: "SPID (Sistema Pubblico di Identità Digitale)", price: 20, duration: "1 Day" },
      { name: "PEC (Posta Elettronica Certificata)", price: 25, duration: "1 Day" },
      { name: "Contratto di casa / negozio", price: 100, duration: "7 Days" },
      { name: "Visura catastale e planimetria", price: 20, duration: "2 Days" },
      { name: "Abbonamento ATAC – bus e ticket", price: 5, duration: "1 Day" },
      { name: "Domanda TARI (tassa rifiuti)", price: 30, duration: "5 Days" },
      { name: "Carta acquisti – min. 3 বছর & over 65", price: 20, duration: "5 Days" },
      { name: "Mensa scolastica", price: 15, duration: "3 Days" },
      { name: "Anno scolastico", price: 20, duration: "5 Days" },
      { name: "Bonus comunale", price: 25, duration: "5 Days" },
      { name: "Contratti di lavoro domestico", price: 60, duration: "7 Days" },
    ],
  },
  {
    id: "impresa-servizi",
    name: "IMPRESA SERVIZI",
    icon: <Building2 size={20} />,
    subservices: [
      { name: "Apertura Partita IVA / CCIAA / INPS / SCIA", price: 250, duration: "10 Days" },
      { name: "Chiusura Partita IVA / CCIAA / INPS / SCIA", price: 150, duration: "7 Days" },
      { name: "Variazione Partita IVA / CCIAA", price: 100, duration: "5 Days" },
      { name: "Apertura SRLS (Partita IVA / CCIAA / INPS / Atto / Notaio)", price: 800, duration: "20 Days" },
      { name: "Contratto di Lavoro (UNILAV)", price: 50, duration: "2 Days" },
      { name: "Busta Paga", price: 30, duration: "3 Days" },
      { name: "Electronic Fattura", price: 15, duration: "1 Day" },
      { name: "Contabilità", price: 100, duration: "Monthly" },
      { name: "Bilancio", price: 300, duration: "Annual" },
      { name: "Dichiarazione IVA", price: 150, duration: "Annual" },
      { name: "Comunicazione IVA", price: 50, duration: "Quarterly" },
    ],
  },
  {
    id: "flussi-migratori",
    name: "FLUSSI MIGRATORI",
    icon: <Globe size={20} />,
    subservices: [
      { name: "Richiesta ANPAL", price: 40, duration: "5 Days" },
      { name: "Asseverazione", price: 150, duration: "10 Days" },
      { name: "Idoneità alloggiativa / alloggio", price: 50, duration: "7 Days" },
      { name: "Compilazione domanda flussi", price: 100, duration: "14 Days" },
    ],
  },
  {
    id: "visti",
    name: "VISTI",
    icon: <IdCard size={20} />,
    subservices: [
      { name: "Umrah Visa", price: 200, duration: "10 Days" },
      { name: "Tourist Visa", price: 150, duration: "14 Days" },
    ],
  },
  {
    id: "embassy-services",
    name: "SERVIZI AMBESSATA / EMBASSY SERVICES",
    icon: <Building2 size={20} />,
    subservices: [
      { name: "New born passport application", price: 100, duration: "21 Days" },
      { name: "Birth certificate", price: 50, duration: "14 Days" },
      { name: "Wage Earner membership", price: 30, duration: "7 Days" },
      { name: "E-passport application and appointment", price: 120, duration: "30 Days" },
      { name: "Bangladesh embassy appointment service", price: 20, duration: "2 Days" },
      { name: "NVR (No Visa Required)", price: 80, duration: "14 Days" },
    ],
  },
];
