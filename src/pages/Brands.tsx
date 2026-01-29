import { useState, useEffect, useMemo } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, isBefore, addDays } from "date-fns";
import {
  Plus,
  LayoutGrid,
  Table2,
  Search,
  Filter,
  DollarSign,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Upload,
  MoreHorizontal,
  FileText,
  Mail,
  Building2,
  Package,
  User,
  StickyNote,
  ChevronDown,
  X,
  AlertCircle,
  TrendingUp,
  Wallet,
  Target
} from "lucide-react";
import { getString, setString } from "@/lib/storage";

// Types
type ContentType = 'tiktok' | 'instagram-post' | 'instagram-reel' | 'instagram-story' | 'youtube-video' | 'youtube-short' | 'blog-post' | 'other';
type DeliverableStatus = 'pending' | 'in-progress' | 'submitted' | 'revision-requested' | 'approved' | 'scheduled' | 'published';

interface Deliverable {
  id: string;
  title: string;
  contentType: ContentType;
  customContentType?: string; // Used when contentType is 'other'
  submissionDeadline?: string; // Date to submit for brand approval
  publishDeadline?: string; // Date content must go live
  status: DeliverableStatus;
  notes?: string;
}

interface BrandDeal {
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
}

const contentTypeConfig: Record<ContentType, { label: string; short: string }> = {
  'tiktok': { label: 'TikTok Video', short: 'TikTok' },
  'instagram-post': { label: 'Instagram Post', short: 'IG Post' },
  'instagram-reel': { label: 'Instagram Reel', short: 'Reel' },
  'instagram-story': { label: 'Instagram Story', short: 'Story' },
  'youtube-video': { label: 'YouTube Video', short: 'YT Video' },
  'youtube-short': { label: 'YouTube Short', short: 'YT Short' },
  'blog-post': { label: 'Blog Post', short: 'Blog' },
  'other': { label: 'Other', short: 'Other' },
};

const deliverableStatusConfig: Record<DeliverableStatus, { label: string; color: string }> = {
  'pending': { label: 'Pending', color: 'bg-stone-100 text-stone-600' },
  'in-progress': { label: 'In Progress', color: 'bg-blue-50 text-blue-600' },
  'submitted': { label: 'Submitted for Approval', color: 'bg-amber-50 text-amber-600' },
  'revision-requested': { label: 'Revision Requested', color: 'bg-orange-50 text-orange-600' },
  'approved': { label: 'Approved', color: 'bg-emerald-50 text-emerald-600' },
  'scheduled': { label: 'Scheduled', color: 'bg-violet-50 text-violet-600' },
  'published': { label: 'Published', color: 'bg-emerald-100 text-emerald-700' },
};

const STORAGE_KEY = 'brandDeals';

const statusConfig: Record<string, { label: string; color: string }> = {
  'inbound': { label: 'Inbound', color: 'bg-stone-100 text-stone-700 border-stone-200' },
  'negotiating': { label: 'Negotiating', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'signed': { label: 'Signed', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  'in-progress': { label: 'In Progress', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  'completed': { label: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'other': { label: 'Other', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const statusOrder: BrandDeal['status'][] = ['inbound', 'negotiating', 'signed', 'in-progress', 'completed', 'other'];

const Brands = () => {
  const [deals, setDeals] = useState<BrandDeal[]>(() => {
    const saved = getString(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'table' | 'kanban'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<BrandDeal | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    setString(STORAGE_KEY, JSON.stringify(deals));
  }, [deals]);

  // Dashboard metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);

    const completedThisMonth = deals.filter(d =>
      d.paymentReceived && d.paymentReceivedDate &&
      isWithinInterval(parseISO(d.paymentReceivedDate), { start: monthStart, end: monthEnd })
    );
    const completedThisYear = deals.filter(d =>
      d.paymentReceived && d.paymentReceivedDate &&
      isWithinInterval(parseISO(d.paymentReceivedDate), { start: yearStart, end: yearEnd })
    );

    const pendingPayments = deals.filter(d => !d.paymentReceived && d.status !== 'inbound');
    const pendingAmount = pendingPayments.reduce((sum, d) => {
      const remaining = d.totalFee - (d.depositPaid ? d.depositAmount : 0);
      return sum + remaining;
    }, 0);

    const upcomingDeadlines = deals.filter(d => {
      if (d.status === 'completed' || !d.deliverables?.length) return false;
      return d.deliverables.some(del => {
        if (del.status === 'published') return false;
        const submissionDue = del.submissionDeadline ? parseISO(del.submissionDeadline) : null;
        const publishDue = del.publishDeadline ? parseISO(del.publishDeadline) : null;
        return (submissionDue && isWithinInterval(submissionDue, { start: now, end: addDays(now, 14) })) ||
               (publishDue && isWithinInterval(publishDue, { start: now, end: addDays(now, 14) }));
      });
    });

    return {
      monthlyEarnings: completedThisMonth.reduce((sum, d) => sum + d.totalFee, 0),
      yearlyEarnings: completedThisYear.reduce((sum, d) => sum + d.totalFee, 0),
      pendingAmount,
      pendingCount: pendingPayments.length,
      upcomingDeadlines: upcomingDeadlines.length,
      activeDeals: deals.filter(d => ['signed', 'in-progress'].includes(d.status)).length,
    };
  }, [deals]);

  // Filtered deals
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const matchesSearch = !searchQuery ||
        deal.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.productCampaign.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;

      const matchesPayment = paymentFilter === 'all' ||
        (paymentFilter === 'paid' && deal.paymentReceived) ||
        (paymentFilter === 'unpaid' && !deal.paymentReceived);

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [deals, searchQuery, statusFilter, paymentFilter]);

  // Grouped by status for Kanban
  const dealsByStatus = useMemo(() => {
    const grouped: Record<string, BrandDeal[]> = {};
    statusOrder.forEach(status => {
      grouped[status] = filteredDeals.filter(d => d.status === status);
    });
    return grouped;
  }, [filteredDeals]);

  const handleAddDeal = (deal: Omit<BrandDeal, 'id' | 'createdAt'>) => {
    const newDeal: BrandDeal = {
      ...deal,
      id: `deal_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDeals(prev => [...prev, newDeal]);
    setIsAddDialogOpen(false);
  };

  const handleUpdateDeal = (id: string, updates: Partial<BrandDeal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    setEditingDeal(null);
  };

  const handleDeleteDeal = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  const handleDragStart = (dealId: string) => {
    setDraggedDeal(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: BrandDeal['status']) => {
    if (draggedDeal) {
      handleUpdateDeal(draggedDeal, { status });
      setDraggedDeal(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#FAF9F7]">
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#4A3542]">Brand Partnerships</h1>
              <p className="text-[#8B7082] mt-1">Track and manage your brand deals and sponsorships</p>
            </div>

            {/* Dashboard Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="p-4 bg-white border-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8B7082] font-medium">This Month</p>
                    <p className="text-xl font-bold text-[#4A3542]">${metrics.monthlyEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white border-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-50">
                    <TrendingUp className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8B7082] font-medium">This Year</p>
                    <p className="text-xl font-bold text-[#4A3542]">${metrics.yearlyEarnings.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white border-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50">
                    <Wallet className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8B7082] font-medium">Pending</p>
                    <p className="text-xl font-bold text-[#4A3542]">${metrics.pendingAmount.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white border-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-rose-50">
                    <Target className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-xs text-[#8B7082] font-medium">Active Deals</p>
                    <p className="text-xl font-bold text-[#4A3542]">{metrics.activeDeals}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 flex gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7082]" />
                  <Input
                    placeholder="Search brands..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white border-[#E8E4E6] focus:border-[#8B7082] focus:ring-[#8B7082]/20"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-white border-[#E8E4E6]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statusOrder.map(status => (
                      <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-[140px] bg-white border-[#E8E4E6]">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <div className="flex bg-white rounded-lg border border-[#E8E4E6] p-1">
                  <button
                    onClick={() => setView('kanban')}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      view === 'kanban' ? "bg-[#4A3542] text-white" : "text-[#8B7082] hover:text-[#4A3542]"
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView('table')}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      view === 'table' ? "bg-[#4A3542] text-white" : "text-[#8B7082] hover:text-[#4A3542]"
                    )}
                  >
                    <Table2 className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="bg-[#4A3542] hover:bg-[#3a2a34] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deal
                </Button>
              </div>
            </div>

            {/* Main Content */}
            {view === 'kanban' ? (
              <KanbanView
                dealsByStatus={dealsByStatus}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onEdit={setEditingDeal}
                onDelete={handleDeleteDeal}
                onQuickUpdate={handleUpdateDeal}
              />
            ) : (
              <TableView
                deals={filteredDeals}
                onEdit={setEditingDeal}
                onDelete={handleDeleteDeal}
                onQuickUpdate={handleUpdateDeal}
              />
            )}

            {/* Add/Edit Dialog */}
            <DealDialog
              open={isAddDialogOpen || !!editingDeal}
              onOpenChange={(open) => {
                if (!open) {
                  setIsAddDialogOpen(false);
                  setEditingDeal(null);
                }
              }}
              deal={editingDeal}
              onSave={(deal) => {
                if (editingDeal) {
                  handleUpdateDeal(editingDeal.id, deal);
                } else {
                  handleAddDeal(deal as Omit<BrandDeal, 'id' | 'createdAt'>);
                }
              }}
            />
        </div>
      </div>
    </Layout>
  );
};

// Kanban View Component
interface KanbanViewProps {
  dealsByStatus: Record<string, BrandDeal[]>;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (status: BrandDeal['status']) => void;
  onEdit: (deal: BrandDeal) => void;
  onDelete: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<BrandDeal>) => void;
}

const KanbanView = ({ dealsByStatus, onDragStart, onDragOver, onDrop, onEdit, onDelete, onQuickUpdate }: KanbanViewProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusOrder.map(status => (
        <div
          key={status}
          className="flex-shrink-0 w-72"
          onDragOver={onDragOver}
          onDrop={() => onDrop(status)}
        >
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium border",
              statusConfig[status].color
            )}>
              {status === 'other' ? 'Other' : statusConfig[status].label}
            </span>
            <span className="text-xs text-[#8B7082]">{dealsByStatus[status].length}</span>
          </div>
          <div className="space-y-3 min-h-[200px] p-2 rounded-xl bg-[#F5F3F4]">
            {dealsByStatus[status].map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
                onDragStart={onDragStart}
                onEdit={onEdit}
                onDelete={onDelete}
                onQuickUpdate={onQuickUpdate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Deal Card Component
interface DealCardProps {
  deal: BrandDeal;
  onDragStart: (id: string) => void;
  onEdit: (deal: BrandDeal) => void;
  onDelete: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<BrandDeal>) => void;
}

const DealCard = ({ deal, onDragStart, onEdit, onDelete, onQuickUpdate }: DealCardProps) => {
  // Find next upcoming deadline
  const now = new Date();
  const nextDeadline = deal.deliverables
    ?.filter(d => d.status !== 'published')
    .map(d => ({
      date: d.submissionDeadline || d.publishDeadline,
      type: d.submissionDeadline ? 'submit' : 'publish'
    }))
    .filter(d => d.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())[0];

  const isPastDue = nextDeadline?.date && isBefore(parseISO(nextDeadline.date), now);
  const publishedCount = deal.deliverables?.filter(d => d.status === 'published').length || 0;
  const totalDeliverables = deal.deliverables?.length || 0;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(deal.id)}
      className="bg-white rounded-lg p-4 shadow-sm border border-[#E8E4E6] cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-[#4A3542] text-sm">{deal.brandName}</h3>
          <p className="text-xs text-[#8B7082]">{deal.productCampaign}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-[#F5F3F4] rounded">
              <MoreHorizontal className="w-4 h-4 text-[#8B7082]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit(deal)}>
              Edit Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickUpdate(deal.id, { invoiceSent: !deal.invoiceSent, invoiceSentDate: !deal.invoiceSent ? new Date().toISOString() : undefined })}>
              {deal.invoiceSent ? 'Mark Invoice Unsent' : 'Mark Invoice Sent'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickUpdate(deal.id, { paymentReceived: !deal.paymentReceived, paymentReceivedDate: !deal.paymentReceived ? new Date().toISOString() : undefined })}>
              {deal.paymentReceived ? 'Mark Unpaid' : 'Mark as Paid'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(deal.id)} className="text-red-600">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Fee */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg font-bold text-[#4A3542]">${deal.totalFee.toLocaleString()}</span>
        <div className="flex gap-1">
          {deal.depositPaid && (
            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded">
              Deposit
            </span>
          )}
          {deal.paymentReceived && (
            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded">
              Paid
            </span>
          )}
        </div>
      </div>

      {/* Deliverables Summary */}
      {totalDeliverables > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs text-[#8B7082]">
            <span>{publishedCount}/{totalDeliverables} delivered</span>
            <div className="flex-1 h-1.5 bg-[#F5F3F4] rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(publishedCount / totalDeliverables) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {deal.deliverables.slice(0, 3).map(d => (
              <span key={d.id} className={cn("px-1.5 py-0.5 text-[10px] font-medium rounded", deliverableStatusConfig[d.status].color)}>
                {d.contentType === 'other' && d.customContentType ? d.customContentType : contentTypeConfig[d.contentType].short}
              </span>
            ))}
            {deal.deliverables.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-[#8B7082]">+{deal.deliverables.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[#F5F3F4]">
        <div className="flex items-center gap-1 text-xs text-[#8B7082]">
          {nextDeadline?.date && (
            <>
              <CalendarIcon className={cn("w-3 h-3", isPastDue && "text-red-500")} />
              <span className={cn(isPastDue && "text-red-500 font-medium")}>
                {nextDeadline.type === 'submit' ? 'Submit' : 'Publish'}: {format(parseISO(nextDeadline.date), "MMM d")}
              </span>
            </>
          )}
        </div>
        <div className="flex gap-1">
          {deal.contractFile && (
            <FileText className="w-3.5 h-3.5 text-[#8B7082]" />
          )}
          {deal.invoiceSent && (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          )}
        </div>
      </div>
    </div>
  );
};

// Table View Component
interface TableViewProps {
  deals: BrandDeal[];
  onEdit: (deal: BrandDeal) => void;
  onDelete: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<BrandDeal>) => void;
}

const TableView = ({ deals, onEdit, onDelete, onQuickUpdate }: TableViewProps) => {
  return (
    <div className="bg-white rounded-xl border border-[#E8E4E6] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAF9F7] border-b border-[#E8E4E6]">
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#8B7082] uppercase tracking-wide">Brand</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#8B7082] uppercase tracking-wide">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#8B7082] uppercase tracking-wide">Fee</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#8B7082] uppercase tracking-wide">Deposit</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#8B7082] uppercase tracking-wide">Invoice</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#8B7082] uppercase tracking-wide">Paid</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#8B7082] uppercase tracking-wide">Deliverables</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-[#8B7082] uppercase tracking-wide">Contract</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {deals.map(deal => (
              <tr key={deal.id} className="border-b border-[#F5F3F4] hover:bg-[#FAF9F7]/50 transition-colors group">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-[#4A3542] text-sm">{deal.brandName}</p>
                    <p className="text-xs text-[#8B7082]">{deal.productCampaign}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Select
                    value={deal.status}
                    onValueChange={(value) => onQuickUpdate(deal.id, { status: value as BrandDeal['status'] })}
                  >
                    <SelectTrigger className="h-7 w-[120px] border-0 bg-transparent p-0">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium border",
                        statusConfig[deal.status].color
                      )}>
                        {deal.status === 'other' && deal.customStatus ? deal.customStatus : statusConfig[deal.status].label}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOrder.map(status => (
                        <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-[#4A3542]">${deal.totalFee.toLocaleString()}</span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onQuickUpdate(deal.id, { depositPaid: !deal.depositPaid, depositPaidDate: !deal.depositPaid ? new Date().toISOString() : undefined })}
                    className="text-lg"
                  >
                    {deal.depositPaid ? <span className="text-emerald-500">✓</span> : <span className="text-gray-300">—</span>}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onQuickUpdate(deal.id, { invoiceSent: !deal.invoiceSent, invoiceSentDate: !deal.invoiceSent ? new Date().toISOString() : undefined })}
                    className="text-lg"
                  >
                    {deal.invoiceSent ? <span className="text-emerald-500">✓</span> : <span className="text-gray-300">—</span>}
                  </button>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onQuickUpdate(deal.id, { paymentReceived: !deal.paymentReceived, paymentReceivedDate: !deal.paymentReceived ? new Date().toISOString() : undefined })}
                    className="text-lg"
                  >
                    {deal.paymentReceived ? <span className="text-emerald-500">✓</span> : <span className="text-gray-300">—</span>}
                  </button>
                </td>
                <td className="py-3 px-4">
                  {deal.deliverables?.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#4A3542] font-medium">
                        {deal.deliverables.filter(d => d.status === 'published').length}/{deal.deliverables.length}
                      </span>
                      <div className="flex gap-0.5">
                        {deal.deliverables.slice(0, 4).map(d => (
                          <div
                            key={d.id}
                            className={cn("w-2 h-2 rounded-full", d.status === 'published' ? 'bg-emerald-500' : 'bg-gray-200')}
                            title={`${d.contentType === 'other' && d.customContentType ? d.customContentType : contentTypeConfig[d.contentType].label}: ${deliverableStatusConfig[d.status].label}`}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {deal.contractFile ? (
                    <FileText className="w-4 h-4 text-[#8B7082]" />
                  ) : (
                    <Upload className="w-4 h-4 text-gray-300" />
                  )}
                </td>
                <td className="py-3 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 hover:bg-[#F5F3F4] rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="w-4 h-4 text-[#8B7082]" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(deal)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(deal.id)} className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
            {deals.length === 0 && (
              <tr>
                <td colSpan={9} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="w-12 h-12 text-[#E8E4E6]" />
                    <p className="text-[#8B7082]">No brand deals yet</p>
                    <p className="text-xs text-[#8B7082]/60">Click "Add Deal" to get started</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Deal Dialog Component
interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: BrandDeal | null;
  onSave: (deal: Partial<BrandDeal>) => void;
}

const DealDialog = ({ open, onOpenChange, deal, onSave }: DealDialogProps) => {
  const [formData, setFormData] = useState<Partial<BrandDeal>>({
    brandName: '',
    productCampaign: '',
    contactPerson: '',
    contactEmail: '',
    status: 'inbound',
    deliverables: [],
    totalFee: 0,
    depositAmount: 0,
    depositPaid: false,
    invoiceSent: false,
    paymentReceived: false,
    notes: '',
  });

  useEffect(() => {
    if (deal) {
      setFormData({ ...deal, deliverables: deal.deliverables || [] });
    } else {
      setFormData({
        brandName: '',
        productCampaign: '',
        contactPerson: '',
        contactEmail: '',
        status: 'inbound',
        deliverables: [],
        totalFee: 0,
        depositAmount: 0,
        depositPaid: false,
        invoiceSent: false,
        paymentReceived: false,
        notes: '',
      });
    }
  }, [deal, open]);

  const addDeliverable = () => {
    const newDeliverable: Deliverable = {
      id: `del_${Date.now()}`,
      title: '',
      contentType: 'instagram-post',
      status: 'pending',
    };
    setFormData(prev => ({
      ...prev,
      deliverables: [...(prev.deliverables || []), newDeliverable]
    }));
  };

  const updateDeliverable = (id: string, updates: Partial<Deliverable>) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables?.map(d => d.id === id ? { ...d, ...updates } : d) || []
    }));
  };

  const removeDeliverable = (id: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables?.filter(d => d.id !== id) || []
    }));
  };

  const handleSubmit = () => {
    if (!formData.brandName) return;
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#4A3542]">{deal ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Partnership Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#4A3542] flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Partnership Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Brand Name *</label>
                <Input
                  value={formData.brandName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                  placeholder="e.g., Nike"
                  className="border-[#E8E4E6] focus:border-[#8B7082]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Product/Campaign</label>
                <Input
                  value={formData.productCampaign}
                  onChange={(e) => setFormData(prev => ({ ...prev, productCampaign: e.target.value }))}
                  placeholder="e.g., Summer Collection"
                  className="border-[#E8E4E6] focus:border-[#8B7082]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Contact Person</label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  placeholder="e.g., John Smith"
                  className="border-[#E8E4E6] focus:border-[#8B7082]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Contact Email</label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  placeholder="john@brand.com"
                  className="border-[#E8E4E6] focus:border-[#8B7082]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as BrandDeal['status'], customStatus: value === 'other' ? '' : undefined }))}>
                  <SelectTrigger className="border-[#E8E4E6]">
                    <SelectValue>
                      {formData.status === 'other'
                        ? (formData.customStatus || 'Other')
                        : statusConfig[formData.status || 'inbound'].label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statusOrder.map(status => (
                      <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.status === 'other' && !formData.customStatus && (
                  <Input
                    defaultValue=""
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        setFormData(prev => ({ ...prev, customStatus: e.target.value.trim() }));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                        setFormData(prev => ({ ...prev, customStatus: (e.target as HTMLInputElement).value.trim() }));
                      }
                    }}
                    placeholder="Specify status..."
                    className="border-[#E8E4E6] h-9 text-sm mt-2"
                    autoFocus
                  />
                )}
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Contract</label>
                {formData.contractFile ? (
                  <div className="flex items-center gap-2 p-2 bg-[#FAF9F7] rounded-lg border border-[#E8E4E6]">
                    <FileText className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                    <span className="text-sm text-[#4A3542] flex-1 truncate">{formData.contractFile.name}</span>
                    <button
                      type="button"
                      onClick={() => window.open(formData.contractFile?.url, '_blank')}
                      className="text-xs text-[#8B7082] hover:text-[#4A3542]"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, contractFile: undefined }))}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="flex items-center justify-center gap-2 p-2 border border-dashed border-[#E8E4E6] rounded-lg hover:border-[#8B7082] hover:bg-[#FAF9F7] transition-colors h-10">
                      <Upload className="w-4 h-4 text-[#8B7082]" />
                      <span className="text-sm text-[#8B7082]">Upload PDF</span>
                    </div>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setFormData(prev => ({
                              ...prev,
                              contractFile: {
                                name: file.name,
                                url: event.target?.result as string
                              }
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Payment Tracking */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#4A3542] flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Payment Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Total Fee ($)</label>
                <Input
                  type="number"
                  value={formData.totalFee || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalFee: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="border-[#E8E4E6] focus:border-[#8B7082]"
                />
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Deposit Amount ($)</label>
                <Input
                  type="number"
                  value={formData.depositAmount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="border-[#E8E4E6] focus:border-[#8B7082]"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.depositPaid}
                    onChange={(e) => setFormData(prev => ({ ...prev, depositPaid: e.target.checked, depositPaidDate: e.target.checked ? new Date().toISOString() : undefined }))}
                    className="w-4 h-4 rounded border-[#E8E4E6] text-[#4A3542] focus:ring-[#8B7082]"
                  />
                  <span className="text-sm text-[#4A3542]">Deposit Paid</span>
                </label>
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Final Payment Due</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-[#E8E4E6]">
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#8B7082]" />
                      {formData.finalPaymentDueDate ? format(parseISO(formData.finalPaymentDueDate), "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" sideOffset={5}>
                    <Calendar
                      mode="single"
                      selected={formData.finalPaymentDueDate ? parseISO(formData.finalPaymentDueDate) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, finalPaymentDueDate: date?.toISOString() }))}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.invoiceSent}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceSent: e.target.checked, invoiceSentDate: e.target.checked ? new Date().toISOString() : undefined }))}
                    className="w-4 h-4 rounded border-[#E8E4E6] text-[#4A3542] focus:ring-[#8B7082]"
                  />
                  <span className="text-sm text-[#4A3542]">Invoice Sent</span>
                </label>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.paymentReceived}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentReceived: e.target.checked, paymentReceivedDate: e.target.checked ? new Date().toISOString() : undefined }))}
                    className="w-4 h-4 rounded border-[#E8E4E6] text-[#4A3542] focus:ring-[#8B7082]"
                  />
                  <span className="text-sm text-[#4A3542]">Payment Received</span>
                </label>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#4A3542] flex items-center gap-2">
                <Package className="w-4 h-4" />
                Deliverables
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDeliverable}
                className="border-[#E8E4E6] text-[#4A3542] hover:bg-[#F5F3F4]"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Deliverable
              </Button>
            </div>

            {formData.deliverables?.length === 0 ? (
              <div className="text-center py-8 bg-[#FAF9F7] rounded-lg border border-dashed border-[#E8E4E6]">
                <Package className="w-8 h-8 mx-auto text-[#E8E4E6] mb-2" />
                <p className="text-sm text-[#8B7082]">No deliverables added yet</p>
                <p className="text-xs text-[#8B7082]/60 mt-1">Click "Add Deliverable" to add content pieces</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.deliverables?.map((deliverable, index) => (
                  <div key={deliverable.id} className="p-4 bg-[#FAF9F7] rounded-lg border border-[#E8E4E6]">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-medium text-[#8B7082]">Deliverable {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeDeliverable(deliverable.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Content Type */}
                      <div>
                        <label className="text-xs text-[#8B7082] mb-1 block">Content Type</label>
                        <Select
                          value={deliverable.contentType}
                          onValueChange={(value) => updateDeliverable(deliverable.id, { contentType: value as ContentType, customContentType: value === 'other' ? '' : undefined })}
                        >
                          <SelectTrigger className="border-[#E8E4E6] bg-white h-9">
                            <SelectValue>
                              {deliverable.contentType === 'other'
                                ? (deliverable.customContentType || 'Other')
                                : contentTypeConfig[deliverable.contentType].label}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(contentTypeConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {deliverable.contentType === 'other' && !deliverable.customContentType && (
                          <Input
                            key={`custom-${deliverable.id}`}
                            defaultValue=""
                            onBlur={(e) => {
                              if (e.target.value.trim()) {
                                updateDeliverable(deliverable.id, { customContentType: e.target.value.trim() });
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                                updateDeliverable(deliverable.id, { customContentType: (e.target as HTMLInputElement).value.trim() });
                              }
                            }}
                            placeholder="Specify content type..."
                            className="border-[#E8E4E6] bg-white h-9 text-sm mt-2"
                            autoFocus
                          />
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-xs text-[#8B7082] mb-1 block">Status</label>
                        <Select
                          value={deliverable.status}
                          onValueChange={(value) => updateDeliverable(deliverable.id, { status: value as DeliverableStatus })}
                        >
                          <SelectTrigger className="border-[#E8E4E6] bg-white h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(deliverableStatusConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>{config.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Submit for Approval Date */}
                      <div>
                        <label className="text-xs text-[#8B7082] mb-1 block">Submit for Approval</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal border-[#E8E4E6] bg-white h-9 text-sm">
                              <CalendarIcon className="mr-2 h-3.5 w-3.5 text-[#8B7082]" />
                              {deliverable.submissionDeadline ? format(parseISO(deliverable.submissionDeadline), "MMM d, yyyy") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[9999]" sideOffset={5}>
                            <Calendar
                              mode="single"
                              selected={deliverable.submissionDeadline ? parseISO(deliverable.submissionDeadline) : undefined}
                              onSelect={(date) => updateDeliverable(deliverable.id, { submissionDeadline: date?.toISOString() })}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Publish By Date */}
                      <div>
                        <label className="text-xs text-[#8B7082] mb-1 block">Publish</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal border-[#E8E4E6] bg-white h-9 text-sm">
                              <CalendarIcon className="mr-2 h-3.5 w-3.5 text-[#8B7082]" />
                              {deliverable.publishDeadline ? format(parseISO(deliverable.publishDeadline), "MMM d, yyyy") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[9999]" sideOffset={5}>
                            <Calendar
                              mode="single"
                              selected={deliverable.publishDeadline ? parseISO(deliverable.publishDeadline) : undefined}
                              onSelect={(date) => updateDeliverable(deliverable.id, { publishDeadline: date?.toISOString() })}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Title/Description (optional) */}
                    <div className="mt-3">
                      <Input
                        value={deliverable.title}
                        onChange={(e) => updateDeliverable(deliverable.id, { title: e.target.value })}
                        placeholder="Optional: Add a description..."
                        className="border-[#E8E4E6] bg-white h-9 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campaign Dates */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#4A3542] flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Campaign Period
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Campaign Start</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-[#E8E4E6]">
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#8B7082]" />
                      {formData.campaignStart ? format(parseISO(formData.campaignStart), "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" sideOffset={5}>
                    <Calendar
                      mode="single"
                      selected={formData.campaignStart ? parseISO(formData.campaignStart) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, campaignStart: date?.toISOString() }))}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Campaign End</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal border-[#E8E4E6]">
                      <CalendarIcon className="mr-2 h-4 w-4 text-[#8B7082]" />
                      {formData.campaignEnd ? format(parseISO(formData.campaignEnd), "MMM d, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[9999]" sideOffset={5}>
                    <Calendar
                      mode="single"
                      selected={formData.campaignEnd ? parseISO(formData.campaignEnd) : undefined}
                      onSelect={(date) => setFormData(prev => ({ ...prev, campaignEnd: date?.toISOString() }))}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-[#4A3542] flex items-center gap-2">
              <StickyNote className="w-4 h-4" />
              Notes
            </h3>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional details..."
              className="min-h-[100px] border-[#E8E4E6] focus:border-[#8B7082]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#E8E4E6]">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#4A3542] hover:bg-[#3a2a34] text-white">
            {deal ? 'Save Changes' : 'Add Deal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Brands;
