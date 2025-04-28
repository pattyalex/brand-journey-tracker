
export interface CollabBrand {
  id: string;
  brandName: string;
  contact: string;
  product: string;
  status: string;
  deliverables: string;
  rate: string;
  postDate: string;
  depositPaid: string;
  finalPaymentDueDate: string;
  invoiceSent: string;
  paymentReceived: string;
  [key: string]: string; // Allow for dynamic columns
}

export interface TableColumn {
  key: keyof CollabBrand;
  title: string;
  editable: boolean;
}
