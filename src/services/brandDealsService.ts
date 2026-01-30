import { supabase } from '@/lib/supabase';

/**
 * Brand Deals Service
 * Manages brand partnership deals and deliverables using Supabase
 */

// TypeScript Interfaces (matching Brands.tsx)
export type ContentType = 'tiktok' | 'instagram-post' | 'instagram-reel' | 'instagram-story' | 'youtube-video' | 'youtube-short' | 'blog-post' | 'other';
export type DeliverableStatus = 'pending' | 'in-progress' | 'submitted' | 'revision-requested' | 'approved' | 'scheduled' | 'published';
export type DealStatus = 'inbound' | 'negotiating' | 'signed' | 'in-progress' | 'completed' | 'other';

export interface Deliverable {
  id: string;
  title: string;
  contentType: ContentType;
  customContentType?: string;
  submissionDeadline?: string;
  publishDeadline?: string;
  status: DeliverableStatus;
  notes?: string;
  isSubmitted?: boolean;
  isPublished?: boolean;
  isPaid?: boolean;
  paymentAmount?: number;
  paidDate?: string;
}

export interface BrandDeal {
  id: string;
  brandName: string;
  productCampaign: string;
  contactPerson: string;
  contactEmail: string;
  status: DealStatus;
  customStatus?: string;
  deliverables: Deliverable[];
  contractFile?: { name: string; url: string };
  totalFee: number;
  depositAmount: number;
  depositPaid: boolean;
  depositPaidDate?: string;
  finalPaymentDueDate?: string;
  invoiceSent: boolean;
  invoiceSentDate?: string;
  paymentReceived: boolean;
  paymentReceivedDate?: string;
  campaignStart?: string;
  campaignEnd?: string;
  notes: string;
  createdAt: string;
  isArchived?: boolean;
  archivedAt?: string;
}

// Database row types (snake_case)
interface DbBrandDeal {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  brand_name: string;
  product_campaign: string | null;
  contact_person: string | null;
  contact_email: string | null;
  status: string;
  custom_status: string | null;
  contract_file: { name: string; url: string } | null;
  total_fee: number;
  deposit_amount: number;
  deposit_paid: boolean;
  deposit_paid_date: string | null;
  final_payment_due_date: string | null;
  invoice_sent: boolean;
  invoice_sent_date: string | null;
  payment_received: boolean;
  payment_received_date: string | null;
  campaign_start: string | null;
  campaign_end: string | null;
  notes: string | null;
  is_archived: boolean;
  archived_at: string | null;
}

interface DbDeliverable {
  id: string;
  brand_deal_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  content_type: string | null;
  custom_content_type: string | null;
  submission_deadline: string | null;
  publish_deadline: string | null;
  status: string;
  notes: string | null;
  is_submitted: boolean;
  is_published: boolean;
  is_paid: boolean;
  payment_amount: number | null;
  paid_date: string | null;
}

// =====================================================
// Data Transformation Helpers
// =====================================================

// Convert TypeScript BrandDeal to database format (for insert/update)
const brandDealToDb = (userId: string, deal: Omit<BrandDeal, 'id' | 'createdAt' | 'deliverables'>) => {
  return {
    user_id: userId,
    brand_name: deal.brandName,
    product_campaign: deal.productCampaign || null,
    contact_person: deal.contactPerson || null,
    contact_email: deal.contactEmail || null,
    status: deal.status,
    custom_status: deal.customStatus || null,
    contract_file: deal.contractFile || null,
    total_fee: deal.totalFee || 0,
    deposit_amount: deal.depositAmount || 0,
    deposit_paid: deal.depositPaid || false,
    deposit_paid_date: deal.depositPaidDate || null,
    final_payment_due_date: deal.finalPaymentDueDate || null,
    invoice_sent: deal.invoiceSent || false,
    invoice_sent_date: deal.invoiceSentDate || null,
    payment_received: deal.paymentReceived || false,
    payment_received_date: deal.paymentReceivedDate || null,
    campaign_start: deal.campaignStart || null,
    campaign_end: deal.campaignEnd || null,
    notes: deal.notes || null,
    is_archived: deal.isArchived || false,
    archived_at: deal.archivedAt || null,
  };
};

// Convert database row to TypeScript BrandDeal
const dbToBrandDeal = (dbDeal: DbBrandDeal, deliverables: Deliverable[] = []): BrandDeal => {
  return {
    id: dbDeal.id,
    brandName: dbDeal.brand_name,
    productCampaign: dbDeal.product_campaign || '',
    contactPerson: dbDeal.contact_person || '',
    contactEmail: dbDeal.contact_email || '',
    status: dbDeal.status as DealStatus,
    customStatus: dbDeal.custom_status || undefined,
    deliverables,
    contractFile: dbDeal.contract_file || undefined,
    totalFee: dbDeal.total_fee || 0,
    depositAmount: dbDeal.deposit_amount || 0,
    depositPaid: dbDeal.deposit_paid || false,
    depositPaidDate: dbDeal.deposit_paid_date || undefined,
    finalPaymentDueDate: dbDeal.final_payment_due_date || undefined,
    invoiceSent: dbDeal.invoice_sent || false,
    invoiceSentDate: dbDeal.invoice_sent_date || undefined,
    paymentReceived: dbDeal.payment_received || false,
    paymentReceivedDate: dbDeal.payment_received_date || undefined,
    campaignStart: dbDeal.campaign_start || undefined,
    campaignEnd: dbDeal.campaign_end || undefined,
    notes: dbDeal.notes || '',
    createdAt: dbDeal.created_at,
    isArchived: dbDeal.is_archived || false,
    archivedAt: dbDeal.archived_at || undefined,
  };
};

// Convert TypeScript Deliverable to database format
const deliverableToDb = (brandDealId: string, del: Omit<Deliverable, 'id'>) => {
  return {
    brand_deal_id: brandDealId,
    title: del.title,
    content_type: del.contentType || null,
    custom_content_type: del.customContentType || null,
    submission_deadline: del.submissionDeadline || null,
    publish_deadline: del.publishDeadline || null,
    status: del.status || 'pending',
    notes: del.notes || null,
    is_submitted: del.isSubmitted || false,
    is_published: del.isPublished || false,
    is_paid: del.isPaid || false,
    payment_amount: del.paymentAmount || null,
    paid_date: del.paidDate || null,
  };
};

// Convert database row to TypeScript Deliverable
const dbToDeliverable = (dbDel: DbDeliverable): Deliverable => {
  return {
    id: dbDel.id,
    title: dbDel.title,
    contentType: (dbDel.content_type || 'other') as ContentType,
    customContentType: dbDel.custom_content_type || undefined,
    submissionDeadline: dbDel.submission_deadline || undefined,
    publishDeadline: dbDel.publish_deadline || undefined,
    status: (dbDel.status || 'pending') as DeliverableStatus,
    notes: dbDel.notes || undefined,
    isSubmitted: dbDel.is_submitted || false,
    isPublished: dbDel.is_published || false,
    isPaid: dbDel.is_paid || false,
    paymentAmount: dbDel.payment_amount || undefined,
    paidDate: dbDel.paid_date || undefined,
  };
};

// =====================================================
// Brand Deals CRUD Operations
// =====================================================

// Create a new brand deal with deliverables
export const createBrandDeal = async (
  userId: string,
  dealData: Omit<BrandDeal, 'id' | 'createdAt'>
): Promise<BrandDeal> => {
  const { deliverables, ...dealWithoutDeliverables } = dealData;
  const dbDeal = brandDealToDb(userId, dealWithoutDeliverables);

  // Insert the deal
  const { data: insertedDeal, error: dealError } = await supabase
    .from('brand_deals')
    .insert([dbDeal])
    .select()
    .single();

  if (dealError) {
    console.error('Error creating brand deal:', dealError);
    throw dealError;
  }

  // Insert deliverables if any
  let insertedDeliverables: Deliverable[] = [];
  if (deliverables && deliverables.length > 0) {
    const dbDeliverables = deliverables.map(del => deliverableToDb(insertedDeal.id, del));

    const { data: delData, error: delError } = await supabase
      .from('brand_deal_deliverables')
      .insert(dbDeliverables)
      .select();

    if (delError) {
      console.error('Error creating deliverables:', delError);
      throw delError;
    }

    insertedDeliverables = (delData || []).map(dbToDeliverable);
  }

  return dbToBrandDeal(insertedDeal as DbBrandDeal, insertedDeliverables);
};

// Get all brand deals for a user with their deliverables
export const getUserBrandDeals = async (userId: string): Promise<BrandDeal[]> => {
  // Fetch deals
  const { data: deals, error: dealsError } = await supabase
    .from('brand_deals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (dealsError) {
    console.error('Error fetching brand deals:', dealsError);
    throw dealsError;
  }

  if (!deals || deals.length === 0) {
    return [];
  }

  // Fetch all deliverables for these deals
  const dealIds = deals.map(d => d.id);
  const { data: deliverables, error: delError } = await supabase
    .from('brand_deal_deliverables')
    .select('*')
    .in('brand_deal_id', dealIds)
    .order('created_at', { ascending: true });

  if (delError) {
    console.error('Error fetching deliverables:', delError);
    throw delError;
  }

  // Group deliverables by deal
  const deliverablesByDeal: Record<string, Deliverable[]> = {};
  (deliverables || []).forEach(del => {
    if (!deliverablesByDeal[del.brand_deal_id]) {
      deliverablesByDeal[del.brand_deal_id] = [];
    }
    deliverablesByDeal[del.brand_deal_id].push(dbToDeliverable(del as DbDeliverable));
  });

  // Combine deals with their deliverables
  return deals.map(deal => dbToBrandDeal(deal as DbBrandDeal, deliverablesByDeal[deal.id] || []));
};

// Get a single brand deal by ID
export const getBrandDealById = async (dealId: string): Promise<BrandDeal | null> => {
  const { data: deal, error: dealError } = await supabase
    .from('brand_deals')
    .select('*')
    .eq('id', dealId)
    .single();

  if (dealError) {
    if (dealError.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching brand deal:', dealError);
    throw dealError;
  }

  // Fetch deliverables
  const { data: deliverables, error: delError } = await supabase
    .from('brand_deal_deliverables')
    .select('*')
    .eq('brand_deal_id', dealId)
    .order('created_at', { ascending: true });

  if (delError) {
    console.error('Error fetching deliverables:', delError);
    throw delError;
  }

  return dbToBrandDeal(
    deal as DbBrandDeal,
    (deliverables || []).map(del => dbToDeliverable(del as DbDeliverable))
  );
};

// Update a brand deal (without deliverables - those are updated separately)
export const updateBrandDeal = async (
  dealId: string,
  updates: Partial<Omit<BrandDeal, 'id' | 'createdAt' | 'deliverables'>>
): Promise<BrandDeal> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.brandName !== undefined) dbUpdates.brand_name = updates.brandName;
  if (updates.productCampaign !== undefined) dbUpdates.product_campaign = updates.productCampaign;
  if (updates.contactPerson !== undefined) dbUpdates.contact_person = updates.contactPerson;
  if (updates.contactEmail !== undefined) dbUpdates.contact_email = updates.contactEmail;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.customStatus !== undefined) dbUpdates.custom_status = updates.customStatus;
  if (updates.contractFile !== undefined) dbUpdates.contract_file = updates.contractFile;
  if (updates.totalFee !== undefined) dbUpdates.total_fee = updates.totalFee;
  if (updates.depositAmount !== undefined) dbUpdates.deposit_amount = updates.depositAmount;
  if (updates.depositPaid !== undefined) dbUpdates.deposit_paid = updates.depositPaid;
  if (updates.depositPaidDate !== undefined) dbUpdates.deposit_paid_date = updates.depositPaidDate;
  if (updates.finalPaymentDueDate !== undefined) dbUpdates.final_payment_due_date = updates.finalPaymentDueDate;
  if (updates.invoiceSent !== undefined) dbUpdates.invoice_sent = updates.invoiceSent;
  if (updates.invoiceSentDate !== undefined) dbUpdates.invoice_sent_date = updates.invoiceSentDate;
  if (updates.paymentReceived !== undefined) dbUpdates.payment_received = updates.paymentReceived;
  if (updates.paymentReceivedDate !== undefined) dbUpdates.payment_received_date = updates.paymentReceivedDate;
  if (updates.campaignStart !== undefined) dbUpdates.campaign_start = updates.campaignStart;
  if (updates.campaignEnd !== undefined) dbUpdates.campaign_end = updates.campaignEnd;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.isArchived !== undefined) dbUpdates.is_archived = updates.isArchived;
  if (updates.archivedAt !== undefined) dbUpdates.archived_at = updates.archivedAt;

  const { data: updatedDeal, error } = await supabase
    .from('brand_deals')
    .update(dbUpdates)
    .eq('id', dealId)
    .select()
    .single();

  if (error) {
    console.error('Error updating brand deal:', error);
    throw error;
  }

  // Fetch current deliverables
  const { data: deliverables } = await supabase
    .from('brand_deal_deliverables')
    .select('*')
    .eq('brand_deal_id', dealId)
    .order('created_at', { ascending: true });

  return dbToBrandDeal(
    updatedDeal as DbBrandDeal,
    (deliverables || []).map(del => dbToDeliverable(del as DbDeliverable))
  );
};

// Update a brand deal with its deliverables (full update)
export const updateBrandDealWithDeliverables = async (
  dealId: string,
  updates: Partial<Omit<BrandDeal, 'id' | 'createdAt'>>
): Promise<BrandDeal> => {
  const { deliverables, ...dealUpdates } = updates;

  // Update the deal itself
  const updatedDeal = await updateBrandDeal(dealId, dealUpdates);

  // If deliverables are provided, sync them
  if (deliverables !== undefined) {
    // Delete existing deliverables
    const { error: deleteError } = await supabase
      .from('brand_deal_deliverables')
      .delete()
      .eq('brand_deal_id', dealId);

    if (deleteError) {
      console.error('Error deleting old deliverables:', deleteError);
      throw deleteError;
    }

    // Insert new deliverables
    if (deliverables.length > 0) {
      const dbDeliverables = deliverables.map(del => deliverableToDb(dealId, del));

      const { data: newDeliverables, error: insertError } = await supabase
        .from('brand_deal_deliverables')
        .insert(dbDeliverables)
        .select();

      if (insertError) {
        console.error('Error inserting new deliverables:', insertError);
        throw insertError;
      }

      return {
        ...updatedDeal,
        deliverables: (newDeliverables || []).map(del => dbToDeliverable(del as DbDeliverable)),
      };
    }

    return { ...updatedDeal, deliverables: [] };
  }

  return updatedDeal;
};

// Delete a brand deal (deliverables are cascade deleted)
export const deleteBrandDeal = async (dealId: string): Promise<void> => {
  const { error } = await supabase
    .from('brand_deals')
    .delete()
    .eq('id', dealId);

  if (error) {
    console.error('Error deleting brand deal:', error);
    throw error;
  }
};

// Archive a brand deal
export const archiveBrandDeal = async (dealId: string): Promise<BrandDeal> => {
  return updateBrandDeal(dealId, {
    isArchived: true,
    archivedAt: new Date().toISOString(),
  });
};

// Unarchive a brand deal
export const unarchiveBrandDeal = async (dealId: string): Promise<BrandDeal> => {
  return updateBrandDeal(dealId, {
    isArchived: false,
    archivedAt: undefined,
  });
};

// =====================================================
// Deliverables CRUD Operations
// =====================================================

// Add a deliverable to a deal
export const addDeliverable = async (
  brandDealId: string,
  deliverable: Omit<Deliverable, 'id'>
): Promise<Deliverable> => {
  const dbDeliverable = deliverableToDb(brandDealId, deliverable);

  const { data, error } = await supabase
    .from('brand_deal_deliverables')
    .insert([dbDeliverable])
    .select()
    .single();

  if (error) {
    console.error('Error adding deliverable:', error);
    throw error;
  }

  return dbToDeliverable(data as DbDeliverable);
};

// Update a deliverable
export const updateDeliverable = async (
  deliverableId: string,
  updates: Partial<Omit<Deliverable, 'id'>>
): Promise<Deliverable> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.contentType !== undefined) dbUpdates.content_type = updates.contentType;
  if (updates.customContentType !== undefined) dbUpdates.custom_content_type = updates.customContentType;
  if (updates.submissionDeadline !== undefined) dbUpdates.submission_deadline = updates.submissionDeadline;
  if (updates.publishDeadline !== undefined) dbUpdates.publish_deadline = updates.publishDeadline;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.isSubmitted !== undefined) dbUpdates.is_submitted = updates.isSubmitted;
  if (updates.isPublished !== undefined) dbUpdates.is_published = updates.isPublished;
  if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
  if (updates.paymentAmount !== undefined) dbUpdates.payment_amount = updates.paymentAmount;
  if (updates.paidDate !== undefined) dbUpdates.paid_date = updates.paidDate;

  const { data, error } = await supabase
    .from('brand_deal_deliverables')
    .update(dbUpdates)
    .eq('id', deliverableId)
    .select()
    .single();

  if (error) {
    console.error('Error updating deliverable:', error);
    throw error;
  }

  return dbToDeliverable(data as DbDeliverable);
};

// Delete a deliverable
export const deleteDeliverable = async (deliverableId: string): Promise<void> => {
  const { error } = await supabase
    .from('brand_deal_deliverables')
    .delete()
    .eq('id', deliverableId);

  if (error) {
    console.error('Error deleting deliverable:', error);
    throw error;
  }
};

// =====================================================
// Query Helpers
// =====================================================

// Get active deals (not archived, status is signed or in-progress)
export const getActiveBrandDeals = async (userId: string): Promise<BrandDeal[]> => {
  const { data: deals, error } = await supabase
    .from('brand_deals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .in('status', ['signed', 'in-progress'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active deals:', error);
    throw error;
  }

  if (!deals || deals.length === 0) {
    return [];
  }

  // Fetch deliverables
  const dealIds = deals.map(d => d.id);
  const { data: deliverables } = await supabase
    .from('brand_deal_deliverables')
    .select('*')
    .in('brand_deal_id', dealIds);

  const deliverablesByDeal: Record<string, Deliverable[]> = {};
  (deliverables || []).forEach(del => {
    if (!deliverablesByDeal[del.brand_deal_id]) {
      deliverablesByDeal[del.brand_deal_id] = [];
    }
    deliverablesByDeal[del.brand_deal_id].push(dbToDeliverable(del as DbDeliverable));
  });

  return deals.map(deal => dbToBrandDeal(deal as DbBrandDeal, deliverablesByDeal[deal.id] || []));
};

// Get archived deals
export const getArchivedBrandDeals = async (userId: string): Promise<BrandDeal[]> => {
  const { data: deals, error } = await supabase
    .from('brand_deals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', true)
    .order('archived_at', { ascending: false });

  if (error) {
    console.error('Error fetching archived deals:', error);
    throw error;
  }

  if (!deals || deals.length === 0) {
    return [];
  }

  const dealIds = deals.map(d => d.id);
  const { data: deliverables } = await supabase
    .from('brand_deal_deliverables')
    .select('*')
    .in('brand_deal_id', dealIds);

  const deliverablesByDeal: Record<string, Deliverable[]> = {};
  (deliverables || []).forEach(del => {
    if (!deliverablesByDeal[del.brand_deal_id]) {
      deliverablesByDeal[del.brand_deal_id] = [];
    }
    deliverablesByDeal[del.brand_deal_id].push(dbToDeliverable(del as DbDeliverable));
  });

  return deals.map(deal => dbToBrandDeal(deal as DbBrandDeal, deliverablesByDeal[deal.id] || []));
};

// Get deals by status
export const getBrandDealsByStatus = async (userId: string, status: DealStatus): Promise<BrandDeal[]> => {
  const { data: deals, error } = await supabase
    .from('brand_deals')
    .select('*')
    .eq('user_id', userId)
    .eq('status', status)
    .eq('is_archived', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deals by status:', error);
    throw error;
  }

  if (!deals || deals.length === 0) {
    return [];
  }

  const dealIds = deals.map(d => d.id);
  const { data: deliverables } = await supabase
    .from('brand_deal_deliverables')
    .select('*')
    .in('brand_deal_id', dealIds);

  const deliverablesByDeal: Record<string, Deliverable[]> = {};
  (deliverables || []).forEach(del => {
    if (!deliverablesByDeal[del.brand_deal_id]) {
      deliverablesByDeal[del.brand_deal_id] = [];
    }
    deliverablesByDeal[del.brand_deal_id].push(dbToDeliverable(del as DbDeliverable));
  });

  return deals.map(deal => dbToBrandDeal(deal as DbBrandDeal, deliverablesByDeal[deal.id] || []));
};

// =====================================================
// Migration Helper
// =====================================================

// Batch create brand deals from localStorage migration
export const batchCreateBrandDeals = async (
  userId: string,
  deals: Omit<BrandDeal, 'id' | 'createdAt'>[]
): Promise<BrandDeal[]> => {
  const results: BrandDeal[] = [];

  for (const deal of deals) {
    const created = await createBrandDeal(userId, deal);
    results.push(created);
  }

  return results;
};
