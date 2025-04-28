
export interface CollabBrand {
  id: string;
  [key: string]: string; // Allow dynamic columns
}

export interface TableColumn {
  id: string;
  name: string;
  key: string;
}
