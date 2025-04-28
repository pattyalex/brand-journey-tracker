
export interface CollabBrand {
  id: string;
  brandName: string;
  contact: string;
  lastFollowUp: string;
  status: string;
  deliverables: string;
  rate: string;
  nextReminder: string;
}

export interface TableColumn {
  key: keyof CollabBrand;
  title: string;
  editable: boolean;
}
