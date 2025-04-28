
export interface CollabBrand {
  id: string;
  brandName: string;
  contact: string;
  product: string;
  status: string;
  deliverables: string;
  briefContract: string;  
  rate: string;
  postDate: string;
  depositPaid: string;
  finalPaymentDueDate: string;
  invoiceSent: string;
  paymentReceived: string;
  notes: string;  // Added new field for notes
  [key: string]: string; // Allow for dynamic columns
}

export interface TableColumn {
  key: keyof CollabBrand;
  title: string;
  editable: boolean;
}
