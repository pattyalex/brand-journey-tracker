
import { CollabBrand, TableColumn } from "@/types/collab";
import { StorageKeys, getString, setString } from "@/lib/storage";

// Default column configuration
export const DEFAULT_COLUMNS: TableColumn[] = [
  { key: 'brandName', title: 'Brand Name', editable: true },
  { key: 'product', title: 'Product', editable: true },
  { key: 'contact', title: 'Contact', editable: true },
  { key: 'status', title: 'Status', editable: true },
  { key: 'deliverables', title: 'Deliverables', editable: true },
  { key: 'briefContract', title: 'Brief/Contract Terms', editable: true },
  { key: 'rate', title: 'Rate', editable: true },
  { key: 'postDate', title: 'Post Date', editable: true },
  { key: 'depositPaid', title: 'Deposit Paid', editable: true },
  { key: 'finalPaymentDueDate', title: 'Final Payment Due Date', editable: true },
  { key: 'invoiceSent', title: 'Invoice Sent', editable: true },
  { key: 'paymentReceived', title: 'Payment Received', editable: true },
  { key: 'notes', title: 'Notes', editable: true },
];

// Protected columns that cannot be deleted
export const PROTECTED_COLUMNS = [
  'brandName', 'contact', 'product', 'status', 'deliverables',
  'briefContract', 'rate', 'postDate', 'depositPaid', 'finalPaymentDueDate', 
  'invoiceSent', 'paymentReceived'
];

// Default brand template
export const createNewBrand = (): CollabBrand => ({
  id: Date.now().toString(),
  brandName: 'New Brand',
  contact: 'email@example.com',
  product: 'Product Details',
  status: 'Pitched',
  deliverables: 'TBD',
  briefContract: 'None',
  rate: '$0',
  postDate: 'Not set',
  depositPaid: 'No',
  finalPaymentDueDate: 'Not set',
  invoiceSent: 'No',
  paymentReceived: 'Unpaid',
  notes: 'None',
});

// Load brands from local storage
export const loadBrands = (): CollabBrand[] => {
  const savedBrands = getString(StorageKeys.collabBrands);
  if (savedBrands) {
    const parsedBrands = JSON.parse(savedBrands);
    return parsedBrands.map((brand: CollabBrand) => ({
      ...brand,
      invoiceSent: brand.invoiceSent || "No",
      paymentReceived: brand.paymentReceived || "Unpaid",
      postDate: brand.postDate || "Not set",
      briefContract: brand.briefContract || "None",
      notes: brand.notes || "None"
    }));
  }
  
  // Return default brand if no saved data
  return [
    {
      id: '1',
      brandName: 'Brand X',
      contact: 'contact@brandx.com',
      product: 'Beauty Products',
      status: 'Pitched',
      deliverables: '3 Posts + 1 Story',
      briefContract: 'None',
      rate: '$2,500',
      postDate: 'Not set',
      depositPaid: 'No',
      finalPaymentDueDate: 'Not set',
      invoiceSent: 'No',
      paymentReceived: 'Unpaid',
      notes: 'None',
    }
  ];
};

// Load columns from local storage with migration handling
export const loadColumns = (): TableColumn[] => {
  const savedColumns = getString(StorageKeys.collabColumns);
  if (!savedColumns) {
    return DEFAULT_COLUMNS;
  }
  
  const parsedColumns = JSON.parse(savedColumns);
  
  // Check for missing columns and add them if needed
  const columnsToCheck = [
    { key: 'briefContract', title: 'Brief/Contract Terms', afterKey: 'deliverables' },
    { key: 'postDate', title: 'Post Date', afterKey: 'rate' },
    { key: 'invoiceSent', title: 'Invoice Sent', afterKey: 'finalPaymentDueDate' },
    { key: 'paymentReceived', title: 'Payment Received', afterKey: 'invoiceSent' },
    { key: 'notes', title: 'Notes', afterKey: 'paymentReceived' }
  ];
  
  let newColumns = [...parsedColumns];
  let columnsUpdated = false;
  
  columnsToCheck.forEach(columnToCheck => {
    const { key, title, afterKey } = columnToCheck;
    const columnExists = newColumns.some((col: TableColumn) => col.key === key);
    
    if (!columnExists) {
      const afterIndex = newColumns.findIndex(
        (col: TableColumn) => col.key === afterKey
      );
      
      if (afterIndex !== -1) {
        newColumns.splice(afterIndex + 1, 0, { 
          key, 
          title, 
          editable: true 
        });
        columnsUpdated = true;
      }
    }
  });
  
  return columnsUpdated ? newColumns : parsedColumns;
};

// Save data to local storage
export const saveBrands = (brands: CollabBrand[]): void => {
  setString(StorageKeys.collabBrands, JSON.stringify(brands));
};

export const saveColumns = (columns: TableColumn[]): void => {
  setString(StorageKeys.collabColumns, JSON.stringify(columns));
};
