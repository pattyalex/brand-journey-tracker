import { fetchAll, createOne, updateOne, deleteOne, createMany } from './baseService';

/**
 * Collab Service
 * Manages collaboration table data using Supabase
 */

// TypeScript Interfaces
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
  notes: string;
  customData: Record<string, string>;
  displayOrder: number;
}

export interface CollabColumn {
  id: string;
  columnKey: string;
  title: string;
  editable: boolean;
  displayOrder: number;
}

// Database row types
interface DbCollabBrand {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  brand_name: string;
  contact: string | null;
  product: string | null;
  status: string | null;
  deliverables: string | null;
  brief_contract: string | null;
  rate: string | null;
  post_date: string | null;
  deposit_paid: string | null;
  final_payment_due_date: string | null;
  invoice_sent: string | null;
  payment_received: string | null;
  notes: string | null;
  custom_data: Record<string, string>;
  display_order: number;
}

interface DbCollabColumn {
  id: string;
  user_id: string;
  column_key: string;
  title: string;
  editable: boolean;
  display_order: number;
}

// Default columns
export const DEFAULT_COLUMNS: Omit<CollabColumn, 'id'>[] = [
  { columnKey: 'brandName', title: 'Brand Name', editable: true, displayOrder: 0 },
  { columnKey: 'product', title: 'Product', editable: true, displayOrder: 1 },
  { columnKey: 'contact', title: 'Contact', editable: true, displayOrder: 2 },
  { columnKey: 'status', title: 'Status', editable: true, displayOrder: 3 },
  { columnKey: 'deliverables', title: 'Deliverables', editable: true, displayOrder: 4 },
  { columnKey: 'briefContract', title: 'Brief/Contract Terms', editable: true, displayOrder: 5 },
  { columnKey: 'rate', title: 'Rate', editable: true, displayOrder: 6 },
  { columnKey: 'postDate', title: 'Post Date', editable: true, displayOrder: 7 },
  { columnKey: 'depositPaid', title: 'Deposit Paid', editable: true, displayOrder: 8 },
  { columnKey: 'finalPaymentDueDate', title: 'Final Payment Due Date', editable: true, displayOrder: 9 },
  { columnKey: 'invoiceSent', title: 'Invoice Sent', editable: true, displayOrder: 10 },
  { columnKey: 'paymentReceived', title: 'Payment Received', editable: true, displayOrder: 11 },
  { columnKey: 'notes', title: 'Notes', editable: true, displayOrder: 12 },
];

// Protected column keys that cannot be deleted
export const PROTECTED_COLUMNS = [
  'brandName', 'contact', 'product', 'status', 'deliverables',
  'briefContract', 'rate', 'postDate', 'depositPaid', 'finalPaymentDueDate',
  'invoiceSent', 'paymentReceived'
];

// =====================================================
// Data Transformation Helpers
// =====================================================

const dbToCollabBrand = (db: DbCollabBrand): CollabBrand => ({
  id: db.id,
  brandName: db.brand_name,
  contact: db.contact || '',
  product: db.product || '',
  status: db.status || '',
  deliverables: db.deliverables || '',
  briefContract: db.brief_contract || '',
  rate: db.rate || '',
  postDate: db.post_date || '',
  depositPaid: db.deposit_paid || '',
  finalPaymentDueDate: db.final_payment_due_date || '',
  invoiceSent: db.invoice_sent || '',
  paymentReceived: db.payment_received || '',
  notes: db.notes || '',
  customData: db.custom_data || {},
  displayOrder: db.display_order || 0,
});

const collabBrandToDb = (userId: string, brand: Omit<CollabBrand, 'id'>) => ({
  user_id: userId,
  brand_name: brand.brandName,
  contact: brand.contact || null,
  product: brand.product || null,
  status: brand.status || null,
  deliverables: brand.deliverables || null,
  brief_contract: brand.briefContract || null,
  rate: brand.rate || null,
  post_date: brand.postDate || null,
  deposit_paid: brand.depositPaid || null,
  final_payment_due_date: brand.finalPaymentDueDate || null,
  invoice_sent: brand.invoiceSent || null,
  payment_received: brand.paymentReceived || null,
  notes: brand.notes || null,
  custom_data: brand.customData || {},
  display_order: brand.displayOrder || 0,
});

const dbToCollabColumn = (db: DbCollabColumn): CollabColumn => ({
  id: db.id,
  columnKey: db.column_key,
  title: db.title,
  editable: db.editable,
  displayOrder: db.display_order || 0,
});

// =====================================================
// Collab Brands CRUD
// =====================================================

// Get all collab brands for a user
export const getUserCollabBrands = async (userId: string): Promise<CollabBrand[]> => {
  const data = await fetchAll<DbCollabBrand>('collab_brands', {
    userId,
    orderBy: 'display_order',
    ascending: true,
  });
  return data.map(dbToCollabBrand);
};

// Create a collab brand
export const createCollabBrand = async (
  userId: string,
  brand: Omit<CollabBrand, 'id'>
): Promise<CollabBrand> => {
  const dbBrand = collabBrandToDb(userId, brand);
  const data = await createOne<DbCollabBrand>('collab_brands', dbBrand);
  return dbToCollabBrand(data);
};

// Update a collab brand
export const updateCollabBrand = async (
  brandId: string,
  updates: Partial<Omit<CollabBrand, 'id'>>
): Promise<CollabBrand> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.brandName !== undefined) dbUpdates.brand_name = updates.brandName;
  if (updates.contact !== undefined) dbUpdates.contact = updates.contact;
  if (updates.product !== undefined) dbUpdates.product = updates.product;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.deliverables !== undefined) dbUpdates.deliverables = updates.deliverables;
  if (updates.briefContract !== undefined) dbUpdates.brief_contract = updates.briefContract;
  if (updates.rate !== undefined) dbUpdates.rate = updates.rate;
  if (updates.postDate !== undefined) dbUpdates.post_date = updates.postDate;
  if (updates.depositPaid !== undefined) dbUpdates.deposit_paid = updates.depositPaid;
  if (updates.finalPaymentDueDate !== undefined) dbUpdates.final_payment_due_date = updates.finalPaymentDueDate;
  if (updates.invoiceSent !== undefined) dbUpdates.invoice_sent = updates.invoiceSent;
  if (updates.paymentReceived !== undefined) dbUpdates.payment_received = updates.paymentReceived;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.customData !== undefined) dbUpdates.custom_data = updates.customData;
  if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder;

  const data = await updateOne<DbCollabBrand>('collab_brands', brandId, dbUpdates);
  return dbToCollabBrand(data);
};

// Delete a collab brand
export const deleteCollabBrand = async (brandId: string): Promise<void> => {
  await deleteOne('collab_brands', brandId);
};

// =====================================================
// Collab Columns CRUD
// =====================================================

// Get columns for a user (or create defaults)
export const getUserCollabColumns = async (userId: string): Promise<CollabColumn[]> => {
  const data = await fetchAll<DbCollabColumn>('collab_columns', {
    userId,
    orderBy: 'display_order',
    ascending: true,
  });

  // If no columns exist, create defaults
  if (data.length === 0) {
    return initializeDefaultColumns(userId);
  }

  return data.map(dbToCollabColumn);
};

// Initialize default columns for a user
export const initializeDefaultColumns = async (userId: string): Promise<CollabColumn[]> => {
  const columnsToInsert = DEFAULT_COLUMNS.map(col => ({
    user_id: userId,
    column_key: col.columnKey,
    title: col.title,
    editable: col.editable,
    display_order: col.displayOrder,
  }));

  const data = await createMany<DbCollabColumn>('collab_columns', columnsToInsert);
  return data.map(dbToCollabColumn);
};

// Add a custom column
export const addCollabColumn = async (
  userId: string,
  column: { columnKey: string; title: string; displayOrder?: number }
): Promise<CollabColumn> => {
  const data = await createOne<DbCollabColumn>('collab_columns', {
    user_id: userId,
    column_key: column.columnKey,
    title: column.title,
    editable: true,
    display_order: column.displayOrder || 0,
  });
  return dbToCollabColumn(data);
};

// Update a column
export const updateCollabColumn = async (
  columnId: string,
  updates: { title?: string; displayOrder?: number }
): Promise<CollabColumn> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder;

  const data = await updateOne<DbCollabColumn>('collab_columns', columnId, dbUpdates);
  return dbToCollabColumn(data);
};

// Delete a column (only if not protected)
export const deleteCollabColumn = async (columnId: string, columnKey: string): Promise<void> => {
  if (PROTECTED_COLUMNS.includes(columnKey)) {
    throw new Error('Cannot delete protected column');
  }

  await deleteOne('collab_columns', columnId);
};

// =====================================================
// Migration Helpers
// =====================================================

// Batch create collab brands
export const batchCreateCollabBrands = async (
  userId: string,
  brands: Array<Omit<CollabBrand, 'id'>>
): Promise<CollabBrand[]> => {
  if (brands.length === 0) return [];
  const dbBrands = brands.map(brand => collabBrandToDb(userId, brand));
  const data = await createMany<DbCollabBrand>('collab_brands', dbBrands);
  return data.map(dbToCollabBrand);
};
