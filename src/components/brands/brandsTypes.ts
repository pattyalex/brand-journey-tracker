// Types
export type ContentType = 'tiktok' | 'instagram-post' | 'instagram-reel' | 'instagram-story' | 'youtube-video' | 'youtube-short' | 'blog-post' | 'other';
export type DeliverableStatus = 'pending' | 'in-progress' | 'submitted' | 'revision-requested' | 'approved' | 'scheduled' | 'published';

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
  status: 'inbound' | 'negotiating' | 'signed' | 'in-progress' | 'completed' | 'other';
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

export const contentTypeConfig: Record<ContentType, { label: string; short: string }> = {
  'tiktok': { label: 'TikTok Video', short: 'TikTok' },
  'instagram-post': { label: 'Instagram Post', short: 'IG Post' },
  'instagram-reel': { label: 'Instagram Reel', short: 'Reel' },
  'instagram-story': { label: 'Instagram Story', short: 'Story' },
  'youtube-video': { label: 'YouTube Video', short: 'YT Video' },
  'youtube-short': { label: 'YouTube Short', short: 'YT Short' },
  'blog-post': { label: 'Blog Post', short: 'Blog' },
  'other': { label: 'Other', short: 'Other' },
};

export const deliverableStatusConfig: Record<DeliverableStatus, { label: string; color: string }> = {
  'pending': { label: 'Pending', color: 'bg-stone-100 text-stone-600' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-50 text-blue-600' },
  'submitted': { label: 'Submitted for Approval', color: 'bg-amber-50 text-amber-600' },
  'revision-requested': { label: 'Revision Requested', color: 'bg-orange-50 text-orange-600' },
  'approved': { label: 'Approved', color: 'bg-emerald-50 text-emerald-600' },
  'scheduled': { label: 'Scheduled', color: 'bg-violet-50 text-violet-600' },
  'published': { label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
};

export const statusConfig: Record<string, { label: string; color: string }> = {
  'inbound': { label: 'Inbound', color: 'bg-stone-100 text-stone-700 border-stone-200' },
  'negotiating': { label: 'Negotiating', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'signed': { label: 'Signed', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  'in-progress': { label: 'In Progress', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  'completed': { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'other': { label: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export const statusOrder: BrandDeal['status'][] = ['inbound', 'negotiating', 'signed', 'in-progress', 'completed', 'other'];
