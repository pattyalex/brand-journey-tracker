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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, isBefore, addDays, addMonths, subMonths, addYears, subYears, isSameMonth, isSameYear } from "date-fns";
import {
  Plus,
  LayoutGrid,
  Table2,
  Search,
  Filter,
  DollarSign,
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  CheckCircle2,
  Upload,
  MoreHorizontal,
  FileText,
  Mail,
  Building2,
  Send,
  User,
  StickyNote,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  TrendingUp,
  Wallet,
  Target,
  Archive,
  Trash2,
  Diamond,
  Sparkles,
  Circle,
  ArrowUpRight,
  Coins,
  HandCoins,
  Banknote,
  PiggyBank,
  Trophy
} from "lucide-react";
import { getString, setString } from "@/lib/storage";
import { EVENTS, emit } from "@/lib/events";
import { toast } from "sonner";

// Types
type ContentType = 'tiktok' | 'instagram-post' | 'instagram-reel' | 'instagram-story' | 'youtube-video' | 'youtube-short' | 'blog-post' | 'other';
type DeliverableStatus = 'pending' | 'in-progress' | 'submitted' | 'revision-requested' | 'approved' | 'scheduled' | 'published';

interface Deliverable {
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
  isArchived?: boolean;
  archivedAt?: string;
}

const STORAGE_KEY = 'brandDeals';

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
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isYearView, setIsYearView] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Save to localStorage and emit event for Dashboard
  useEffect(() => {
    setString(STORAGE_KEY, JSON.stringify(deals));
    emit(window, EVENTS.brandDealsUpdated, deals);
  }, [deals]);

  // Dashboard metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const yearStart = startOfYear(selectedMonth);
    const yearEnd = endOfYear(selectedMonth);

    // Calculate earnings from deposits and deliverable payments for selected month
    // Attribution: payments count toward the month when the WORK is due, not when payment was received
    const monthlyEarningsCalc = deals.reduce((sum, d) => {
      let dealTotal = 0;
      const totalDeliverables = d.deliverables?.length || 1;
      // Balance after deposit (deposit is PART of totalFee, not in addition to it)
      const balanceAfterDeposit = d.totalFee ? d.totalFee - (d.depositAmount || 0) : 0;
      // Amount per deliverable when no specific amounts are entered
      const perDeliverableAmount = Math.round(balanceAfterDeposit / totalDeliverables);

      // Get deliverables that are due in the selected month
      const deliverablesInMonth = d.deliverables?.filter(del => {
        const submitInMonth = del.submissionDeadline && isSameMonth(parseISO(del.submissionDeadline), selectedMonth);
        const publishInMonth = del.publishDeadline && isSameMonth(parseISO(del.publishDeadline), selectedMonth);
        return submitInMonth || publishInMonth;
      }) || [];

      const dealHasDeliverablesInMonth = deliverablesInMonth.length > 0;

      // Add deposit if paid AND deal has deliverables in this month
      // The deposit counts toward the month when work is due, not when payment was received
      if (d.depositPaid && d.depositAmount && dealHasDeliverablesInMonth) {
        dealTotal += d.depositAmount;
      }

      // Add deliverable payments for deliverables due in this month
      // Use explicit paymentAmount if set, otherwise derive from balance after deposit
      deliverablesInMonth.forEach(del => {
        if (del.isPaid) {
          const effectiveAmount = del.paymentAmount || perDeliverableAmount;
          dealTotal += effectiveAmount;
        }
      });

      return sum + dealTotal;
    }, 0);

    const selectedYear = selectedMonth.getFullYear();

    // Calculate yearly earnings - payments count toward the year when work is due
    const yearlyEarningsCalc = deals.reduce((sum, d) => {
      let dealTotal = 0;
      const totalDeliverables = d.deliverables?.length || 1;
      // Balance after deposit (deposit is PART of totalFee, not in addition to it)
      const balanceAfterDeposit = d.totalFee ? d.totalFee - (d.depositAmount || 0) : 0;
      // Amount per deliverable when no specific amounts are entered
      const perDeliverableAmount = Math.round(balanceAfterDeposit / totalDeliverables);

      // Get deliverables that are due in the selected year
      const deliverablesInYear = d.deliverables?.filter(del => {
        const submitInYear = del.submissionDeadline && parseISO(del.submissionDeadline).getFullYear() === selectedYear;
        const publishInYear = del.publishDeadline && parseISO(del.publishDeadline).getFullYear() === selectedYear;
        return submitInYear || publishInYear;
      }) || [];

      const dealHasDeliverablesInYear = deliverablesInYear.length > 0;

      // Add deposit if paid AND deal has deliverables in this year
      if (d.depositPaid && d.depositAmount && dealHasDeliverablesInYear) {
        dealTotal += d.depositAmount;
      }

      // Add deliverable payments for deliverables due in this year
      // Use explicit paymentAmount if set, otherwise derive from balance after deposit
      deliverablesInYear.forEach(del => {
        if (del.isPaid) {
          const effectiveAmount = del.paymentAmount || perDeliverableAmount;
          dealTotal += effectiveAmount;
        }
      });

      return sum + dealTotal;
    }, 0);

    // PENDING: Total unpaid across ALL deals (not month-specific)
    // Auto-calculate based on deposit + deliverables paid status
    const pendingAmount = deals.reduce((sum, d) => {
      if (d.status === 'inbound' || !d.totalFee) return sum;

      const totalDeliverables = d.deliverables?.length || 1;
      const balanceAfterDep = d.totalFee - (d.depositAmount || 0);
      const perDelAmount = Math.round(balanceAfterDep / totalDeliverables);

      // Calculate what's been paid
      let paidTotal = 0;

      // Deposit
      if (d.depositPaid && d.depositAmount) {
        paidTotal += d.depositAmount;
      }

      // Deliverables - use explicit amount or calculated fallback
      d.deliverables?.forEach(del => {
        if (del.isPaid) {
          paidTotal += del.paymentAmount || perDelAmount;
        }
      });

      const remaining = d.totalFee - paidTotal;
      return sum + Math.max(0, remaining);
    }, 0);

    // Count deals that are not fully paid (auto-calculated)
    const pendingCount = deals.filter(d => {
      if (d.status === 'inbound' || !d.totalFee) return false;

      const hasDeposit = d.depositAmount && d.depositAmount > 0;
      const depositPaid = hasDeposit ? d.depositPaid : true;

      const deliverables = d.deliverables || [];
      const allDeliverablesPaid = deliverables.length === 0 || deliverables.every(del => del.isPaid);

      const hasSomethingPaid = (hasDeposit && d.depositPaid) || deliverables.some(del => del.isPaid);

      const isPaidInFull = depositPaid && allDeliverablesPaid && hasSomethingPaid;
      return !isPaidInFull;
    }).length;

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
      monthlyEarnings: monthlyEarningsCalc,
      yearlyEarnings: yearlyEarningsCalc,
      pendingAmount,
      pendingCount,
      upcomingDeadlines: upcomingDeadlines.length,
      activeDeals: deals.filter(d => !d.isArchived).length,
    };
  }, [deals, selectedMonth]);

  // Filtered deals
  // Count archived deals
  const archivedCount = useMemo(() => deals.filter(d => d.isArchived).length, [deals]);

  const filteredDeals = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const yearStart = startOfYear(selectedMonth);
    const yearEnd = endOfYear(selectedMonth);
    const selectedYear = selectedMonth.getFullYear();

    return deals.filter(deal => {
      // Filter by archive status
      const matchesArchive = showArchived ? deal.isArchived : !deal.isArchived;
      if (!matchesArchive) return false;

      const matchesSearch = !searchQuery ||
        deal.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.productCampaign.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;

      // Auto-calculate "Paid in Full" based on deposit + all deliverables paid
      const isPaidInFull = (() => {
        const hasDeposit = deal.depositAmount && deal.depositAmount > 0;
        const depositPaid = hasDeposit ? deal.depositPaid : true;

        const deliverables = deal.deliverables || [];
        const allDeliverablesPaid = deliverables.length === 0 || deliverables.every(d => d.isPaid);

        // Must have at least one payment made (deposit or deliverable)
        const hasSomethingPaid = (hasDeposit && deal.depositPaid) || deliverables.some(d => d.isPaid);

        return depositPaid && allDeliverablesPaid && hasSomethingPaid;
      })();

      const matchesPayment = paymentFilter === 'all' ||
        (paymentFilter === 'paid' && isPaidInFull) ||
        (paymentFilter === 'unpaid' && !isPaidInFull);

      // When showing archived or searching, don't filter by date
      if (showArchived || searchQuery) {
        return matchesSearch && matchesStatus && matchesPayment;
      }

      if (isYearView) {
        // Year view: check if any deliverable has dates in the selected year
        const hasDeliverableInYear = deal.deliverables?.some(del => {
          const submitDate = del.submissionDeadline ? parseISO(del.submissionDeadline) : null;
          const publishDate = del.publishDeadline ? parseISO(del.publishDeadline) : null;
          return (submitDate && submitDate.getFullYear() === selectedYear) ||
                 (publishDate && publishDate.getFullYear() === selectedYear);
        });

        // Also include deals with campaign dates in the selected year
        const campaignInYear = (deal.campaignStart && parseISO(deal.campaignStart).getFullYear() === selectedYear) ||
                               (deal.campaignEnd && parseISO(deal.campaignEnd).getFullYear() === selectedYear);

        // Check if deal has NO scheduled dates at all (show in current year so user can see it)
        const hasNoScheduledDates = !deal.deliverables?.some(del => del.submissionDeadline || del.publishDeadline) &&
                                     !deal.campaignStart && !deal.campaignEnd;
        const isCurrentYear = isSameYear(selectedMonth, new Date());
        const showUnscheduledInCurrentYear = hasNoScheduledDates && isCurrentYear;

        const matchesYear = hasDeliverableInYear || campaignInYear || showUnscheduledInCurrentYear;

        return matchesSearch && matchesStatus && matchesPayment && matchesYear;
      } else {
        // Month view: check if any deliverable has dates in the selected month
        const hasDeliverableInMonth = deal.deliverables?.some(del => {
          const submitDate = del.submissionDeadline ? parseISO(del.submissionDeadline) : null;
          const publishDate = del.publishDeadline ? parseISO(del.publishDeadline) : null;
          return (submitDate && isWithinInterval(submitDate, { start: monthStart, end: monthEnd })) ||
                 (publishDate && isWithinInterval(publishDate, { start: monthStart, end: monthEnd }));
        });

        // Also include deals with campaign dates in the selected month
        const campaignInMonth = (deal.campaignStart && isWithinInterval(parseISO(deal.campaignStart), { start: monthStart, end: monthEnd })) ||
                                (deal.campaignEnd && isWithinInterval(parseISO(deal.campaignEnd), { start: monthStart, end: monthEnd }));

        // Check if deal has NO scheduled dates at all (show in current month so user can see it)
        const hasNoScheduledDates = !deal.deliverables?.some(del => del.submissionDeadline || del.publishDeadline) &&
                                     !deal.campaignStart && !deal.campaignEnd;
        const isCurrentMonth = isSameMonth(selectedMonth, new Date());
        const showUnscheduledInCurrentMonth = hasNoScheduledDates && isCurrentMonth;

        const matchesMonth = hasDeliverableInMonth || campaignInMonth || showUnscheduledInCurrentMonth;

        return matchesSearch && matchesStatus && matchesPayment && matchesMonth;
      }
    });
  }, [deals, searchQuery, statusFilter, paymentFilter, selectedMonth, showArchived, isYearView]);

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

    // Calculate which months this deal spans
    const months = new Set<string>();
    newDeal.deliverables?.forEach(del => {
      if (del.submissionDeadline) {
        months.add(format(parseISO(del.submissionDeadline), "MMMM yyyy"));
      }
      if (del.publishDeadline) {
        months.add(format(parseISO(del.publishDeadline), "MMMM yyyy"));
      }
    });

    if (months.size > 0) {
      const monthList = Array.from(months).join(", ");
      toast.success(`${newDeal.brandName} added`, {
        description: `Deliverables scheduled for ${monthList}`,
      });
    } else {
      toast.success(`${newDeal.brandName} added`);
    }
  };

  const handleUpdateDeal = (id: string, updates: Partial<BrandDeal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    setEditingDeal(null);
  };

  const handleDeleteDeal = (id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  };

  const handleArchiveDeal = (id: string) => {
    setDeals(prev => prev.map(d =>
      d.id === id ? { ...d, isArchived: true, archivedAt: new Date().toISOString() } : d
    ));
    toast.success("Deal archived", {
      description: "You can view archived deals from the Active Deals card",
    });
  };

  const handleUnarchiveDeal = (id: string) => {
    setDeals(prev => prev.map(d =>
      d.id === id ? { ...d, isArchived: false, archivedAt: undefined } : d
    ));
    toast.success("Deal restored");
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
      <div className="min-h-screen bg-gradient-to-br from-[#F0EAED] via-[#F8F6F6] to-[#FFFAF3]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="p-6 lg:p-10">
            {/* Month Picker / Archive Header */}
            {showArchived ? (
              <div className="flex items-center justify-center gap-4 mb-10">
                <button
                  onClick={() => setShowArchived(false)}
                  className="p-2.5 rounded-xl bg-white/60 backdrop-blur-sm border border-[#8B7082]/10 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-[#8B7082] hover:text-[#612a4f]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <Archive className="w-6 h-6 text-[#612a4f]" />
                  <h2 className="text-3xl text-[#612a4f] tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Archive
                  </h2>
                  <span className="text-sm text-[#8B7082]" style={{ fontFamily: "'DM Sans', sans-serif" }}>({archivedCount} deals)</span>
                </div>
                <div className="w-11" /> {/* Spacer for alignment */}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-8 mb-10">
                <button
                  onClick={() => setSelectedMonth(prev => isYearView ? subYears(prev, 1) : subMonths(prev, 1))}
                  className="text-[#612a4f] hover:text-[#612a4f]/80 transition-colors duration-200"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-medium text-[#612a4f] min-w-[240px] text-center tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500 }}>
                    {isYearView ? format(selectedMonth, "yyyy") : format(selectedMonth, "MMMM yyyy")}
                  </h2>
                  {(isYearView ? !isSameYear(selectedMonth, new Date()) : !isSameMonth(selectedMonth, new Date())) && (
                    <button
                      onClick={() => setSelectedMonth(new Date())}
                      className="text-xs text-[#8B7082] hover:text-[#612a4f] underline tracking-wide uppercase"
                    >
                      Today
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setSelectedMonth(prev => isYearView ? addYears(prev, 1) : addMonths(prev, 1))}
                  className="text-[#612a4f] hover:text-[#612a4f]/80 transition-colors duration-200"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                </button>
                {/* Year View Toggle */}
                <button
                  onClick={() => setIsYearView(prev => !prev)}
                  className={cn(
                    "ml-4 px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-200",
                    isYearView
                      ? "bg-[#612a4f] text-white border-[#612a4f]"
                      : "bg-white text-[#612a4f] border-[#E8E4E6] hover:border-[#612a4f]/30"
                  )}
                >
                  {isYearView ? "By Month" : `All ${format(selectedMonth, "yyyy")} Deals`}
                </button>
              </div>
            )}

            {/* Dashboard Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <Card className="group p-6 bg-white border border-[#E8E4E6] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-[#8B7082]" strokeWidth={1.5} />
                  <p className="text-[10px] text-[#8B7082] font-medium uppercase tracking-[0.08em]">
                    {isYearView ? `${format(selectedMonth, "yyyy")} EARNINGS` : `${format(selectedMonth, "MMMM").toUpperCase()} EARNINGS`}
                  </p>
                </div>
                <p className="text-[32px] font-normal text-[#612a4f] tracking-[-0.02em] leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                  ${isYearView ? metrics.yearlyEarnings.toLocaleString() : metrics.monthlyEarnings.toLocaleString()}
                </p>
              </Card>
              <Card className="group p-6 bg-white border border-[#E8E4E6] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpRight className="w-4 h-4 text-[#8B7082]" />
                  <p className="text-[10px] text-[#8B7082] font-medium uppercase tracking-[0.08em]">
                    {isYearView ? "TOTAL DEALS" : `${format(selectedMonth, "yyyy")} EARNINGS`}
                  </p>
                </div>
                <p className="text-[32px] font-normal text-[#612a4f] tracking-[-0.02em] leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {isYearView ? filteredDeals.length : `$${metrics.yearlyEarnings.toLocaleString()}`}
                </p>
              </Card>
              <Card className="group p-6 bg-white border border-[#E8E4E6] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-[#8B7082]" strokeWidth={1.5} />
                  <p className="text-[10px] text-[#8B7082] font-medium uppercase tracking-[0.08em]">EXPECTED PAYMENTS</p>
                </div>
                <p className="text-[32px] font-normal text-[#612a4f] tracking-[-0.02em] leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>${metrics.pendingAmount.toLocaleString()}</p>
              </Card>
              <Card className="group p-6 bg-white border border-[#E8E4E6] rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.05),0_1px_4px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-[#8B7082]" viewBox="0 0 24 24" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" /></svg>
                  <p className="text-[10px] text-[#8B7082] font-medium uppercase tracking-[0.08em]">ACTIVE DEALS</p>
                </div>
                <p className="text-[32px] font-normal text-[#612a4f] tracking-[-0.02em] leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>{metrics.activeDeals}</p>
              </Card>
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center mb-8">
              {/* Active filter pills - left side */}
              <div className="flex items-center gap-1.5">
                {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || showArchived) ? (
                  <>
                    {searchQuery && (
                      <span className="px-2 py-1 bg-[#F8F6F5] text-[#612a4f] text-xs rounded-full flex items-center gap-1">
                        "{searchQuery}"
                        <X className="w-3 h-3 cursor-pointer hover:text-[#612a4f]/70" onClick={() => setSearchQuery('')} />
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className="px-2 py-1 bg-[#F8F6F5] text-[#612a4f] text-xs rounded-full flex items-center gap-1">
                        {statusConfig[statusFilter as keyof typeof statusConfig]?.label}
                        <X className="w-3 h-3 cursor-pointer hover:text-[#612a4f]/70" onClick={() => setStatusFilter('all')} />
                      </span>
                    )}
                    {paymentFilter !== 'all' && (
                      <span className="px-2 py-1 bg-[#F8F6F5] text-[#612a4f] text-xs rounded-full flex items-center gap-1">
                        {paymentFilter === 'paid' ? 'Paid in Full' : 'Expected Payments'}
                        <X className="w-3 h-3 cursor-pointer hover:text-[#612a4f]/70" onClick={() => setPaymentFilter('all')} />
                      </span>
                    )}
                    {showArchived && (
                      <span className="px-2 py-1 bg-[#612a4f]/10 text-[#612a4f] text-xs rounded-full flex items-center gap-1">
                        Archive
                        <X className="w-3 h-3 cursor-pointer hover:text-[#612a4f]/70" onClick={() => setShowArchived(false)} />
                      </span>
                    )}
                  </>
                ) : (
                  <div />
                )}
              </div>

              {/* Right side - Filter button + Add Deal */}
              <div className="flex items-center gap-3">
                {/* Filter Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 relative",
                        "bg-white border border-[#E8E4E6] shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                        "hover:border-[#612a4f]/30 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
                        (searchQuery || statusFilter !== 'all' || paymentFilter !== 'all' || showArchived) && "border-[#612a4f]/40"
                      )}
                    >
                      <Search className="w-4 h-4 text-[#612a4f]" />
                      {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all') && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#612a4f] rounded-full" />
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 bg-white rounded-2xl" align="end" sideOffset={8}>
                    <div className="space-y-4">
                      {/* Search */}
                      <div>
                        <label className="text-xs font-medium text-[#8B7082] uppercase tracking-wide mb-1.5 block">Search</label>
                        <Input
                          placeholder="Search brands..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-9 bg-white border-[#E8E4E6] rounded-lg text-sm"
                        />
                      </div>
                      {/* Status */}
                      <div>
                        <label className="text-xs font-medium text-[#8B7082] uppercase tracking-wide mb-1.5 block">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="h-9 bg-white border-[#E8E4E6] rounded-lg text-sm">
                            <SelectValue placeholder="All Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {statusOrder.map(status => (
                              <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Payments */}
                      <div>
                        <label className="text-xs font-medium text-[#8B7082] uppercase tracking-wide mb-1.5 block">Payments</label>
                        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                          <SelectTrigger className="h-9 bg-white border-[#E8E4E6] rounded-lg text-sm">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="paid">Paid in Full</SelectItem>
                            <SelectItem value="unpaid">Expected Payments</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Archive Toggle */}
                      <div className="pt-2 border-t border-[#E8E4E6]">
                        <button
                          onClick={() => setShowArchived(!showArchived)}
                          className={cn(
                            "w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-200 text-sm text-[#612a4f]",
                            showArchived ? "bg-[#612a4f]/10" : "hover:bg-[#F8F6F5]"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Archive className="w-4 h-4" />
                            <span>{showArchived ? "Viewing Archive" : "View Archive"}</span>
                          </div>
                          {archivedCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-[#8B7082]/20 text-[#8B7082] text-xs rounded-full">
                              {archivedCount}
                            </span>
                          )}
                        </button>
                      </div>
                      {/* Clear Filters */}
                      {(searchQuery || statusFilter !== 'all' || paymentFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                            setPaymentFilter('all');
                          }}
                          className="w-full text-xs text-[#8B7082] hover:text-[#612a4f] transition-colors"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={() => setIsAddDialogOpen(true)}
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#612a4f] to-[#4d2140] hover:from-[#4d2140] hover:to-[#3a1830] text-white shadow-[0_4px_16px_rgba(97,42,79,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_24px_rgba(97,42,79,0.4)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deal
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <KanbanView
              dealsByStatus={dealsByStatus}
              selectedMonth={selectedMonth}
              isYearView={isYearView}
              showArchived={showArchived}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onEdit={setEditingDeal}
              onDelete={handleDeleteDeal}
              onArchive={handleArchiveDeal}
              onUnarchive={handleUnarchiveDeal}
              onQuickUpdate={handleUpdateDeal}
            />

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
  selectedMonth: Date;
  isYearView?: boolean;
  showArchived?: boolean;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (status: BrandDeal['status']) => void;
  onEdit: (deal: BrandDeal) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<BrandDeal>) => void;
}

const KanbanView = ({ dealsByStatus, selectedMonth, isYearView, showArchived, onDragStart, onDragOver, onDrop, onEdit, onDelete, onArchive, onUnarchive, onQuickUpdate }: KanbanViewProps) => {
  // Only show columns that have deals
  const activeStatuses = statusOrder.filter(status => dealsByStatus[status].length > 0);

  if (activeStatuses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-white/80 via-white/60 to-[#F8F6F5]/80 backdrop-blur-sm rounded-2xl border border-[#8B7082]/10 shadow-[0_4px_24px_rgba(97,42,79,0.04)]">
        {showArchived ? (
          <>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#8B7082]/10 to-[#8B7082]/5 mb-4">
              <Archive className="w-10 h-10 text-[#8B7082]/40" />
            </div>
            <p className="text-[#612a4f] font-medium text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>No archived deals</p>
            <p className="text-sm text-[#8B7082]/70 mt-1">Archived deals will appear here</p>
          </>
        ) : (
          <>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#8B7082]/10 to-[#8B7082]/5 mb-4">
              <Building2 className="w-10 h-10 text-[#8B7082]/40" />
            </div>
            <p className="text-[#612a4f] font-medium text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>No deliverables in {isYearView ? format(selectedMonth, "yyyy") : format(selectedMonth, "MMMM yyyy")}</p>
            <p className="text-sm text-[#8B7082]/70 mt-1">Try navigating to another {isYearView ? "year" : "month"} or add a new deal</p>
          </>
        )}
      </div>
    );
  }

  // Flatten all deals into a single array for grid layout
  const allDeals = activeStatuses.flatMap(status => dealsByStatus[status]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {allDeals.map(deal => (
        <DealCard
          key={deal.id}
          deal={deal}
          selectedMonth={selectedMonth}
          isYearView={isYearView}
          showArchived={showArchived}
          onDragStart={onDragStart}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onQuickUpdate={onQuickUpdate}
        />
      ))}
    </div>
  );
};

// Deal Card Component
interface DealCardProps {
  deal: BrandDeal;
  selectedMonth: Date;
  isYearView?: boolean;
  showArchived?: boolean;
  onDragStart: (id: string) => void;
  onEdit: (deal: BrandDeal) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<BrandDeal>) => void;
}

const DealCard = ({ deal, selectedMonth, isYearView, showArchived, onDragStart, onEdit, onDelete, onArchive, onUnarchive, onQuickUpdate }: DealCardProps) => {
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);
  const now = new Date();
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const selectedYear = selectedMonth.getFullYear();

  // Helper to check if a deliverable is in the selected period (month or year)
  const isDeliverableInPeriod = (d: Deliverable) => {
    const submitDate = d.submissionDeadline ? parseISO(d.submissionDeadline) : null;
    const publishDate = d.publishDeadline ? parseISO(d.publishDeadline) : null;
    if (isYearView) {
      return (submitDate && submitDate.getFullYear() === selectedYear) ||
             (publishDate && publishDate.getFullYear() === selectedYear);
    }
    return (submitDate && isWithinInterval(submitDate, { start: monthStart, end: monthEnd })) ||
           (publishDate && isWithinInterval(publishDate, { start: monthStart, end: monthEnd }));
  };

  // Get deliverables that are in this period (for auto-selection)
  const deliverablesInPeriod = deal.deliverables?.filter(isDeliverableInPeriod) || [];

  // All deliverables for display
  const allDeliverables = deal.deliverables || [];

  // Get the selected deliverable - prefer one in the current period
  const selectedDeliverable = selectedDeliverableId
    ? allDeliverables.find(d => d.id === selectedDeliverableId)
    : null;

  // Auto-select: if selected is not in current period, default to first one in period
  // Otherwise show first with pending work in this period, or just the first one in period
  const displayDeliverable = (selectedDeliverable && isDeliverableInPeriod(selectedDeliverable))
    ? selectedDeliverable
    : deliverablesInPeriod.find(d => (!d.isSubmitted && d.submissionDeadline) || (!d.isPublished && d.publishDeadline))
      || deliverablesInPeriod[0]
      || selectedDeliverable
      || allDeliverables[0];

  const displaySubmitDate = displayDeliverable?.submissionDeadline;
  const displayPublishDate = displayDeliverable?.publishDeadline;
  const isSubmitDone = displayDeliverable?.isSubmitted || false;
  const isPublishDone = displayDeliverable?.isPublished || false;

  const isSubmitPastDue = displaySubmitDate && !isSubmitDone && isBefore(parseISO(displaySubmitDate), now);
  const isPublishPastDue = displayPublishDate && !isPublishDone && isBefore(parseISO(displayPublishDate), now);
  // Progress bar shows TOTAL deliverables (across all months)
  const totalPublishedCount = deal.deliverables?.filter(d => d.isPublished).length || 0;
  const totalDeliverablesCount = deal.deliverables?.length || 0;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(deal.id)}
      onClick={() => onEdit(deal)}
      className="group bg-gradient-to-br from-white via-white to-[#FAF9F8] rounded-xl p-4 shadow-[0_6px_20px_rgba(0,0,0,0.06),0_2px_6px_rgba(0,0,0,0.03)] border border-[#E8E4E6] cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.08),0_3px_8px_rgba(0,0,0,0.04)] transition-shadow duration-200 min-h-[300px] flex flex-col"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1 mr-2">
          <h3 className="text-lg font-bold text-[#612a4f] tracking-[-0.02em] truncate" style={{ fontFamily: "'Playfair Display', serif" }}>{deal.brandName}</h3>
          <p className="text-xs text-[#8B7082] min-h-[16px] mt-0.5 truncate">{deal.productCampaign || '\u00A0'}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1 hover:bg-[#8B7082]/10 rounded-lg text-[#8B7082] hover:text-[#612a4f] transition-all duration-200 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} className="rounded-xl">
            {showArchived ? (
              <DropdownMenuItem
                onClick={() => onUnarchive(deal.id)}
                className="text-[#612a4f]"
              >
                <Archive className="w-4 h-4 mr-2" />
                Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => onArchive(deal.id)}
                className="text-[#8B7082]"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(deal.id)}
              className="text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Fee */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[22px] font-semibold text-[#612a4f] tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', serif" }}>${deal.totalFee.toLocaleString()}</span>
        <div className="flex gap-1.5">
          {deal.depositPaid && (
            <span className="px-3 py-1 bg-[#E8F0E8] text-[#5A8A5A] text-[10px] font-medium rounded-full border border-[#C5D9C5]/40 flex items-center gap-1">
              <span>Deposit Paid</span>
              {deal.depositAmount ? <span className="font-semibold">${deal.depositAmount.toLocaleString()}</span> : null}
            </span>
          )}
          {displayDeliverable?.isPaid && (
            <span className="px-3 py-1 bg-[#E8F0E8] text-[#5A8A5A] text-[10px] font-medium rounded-full border border-[#C5D9C5]/40">
              Content Paid
            </span>
          )}
        </div>
      </div>

      {/* Deliverables Summary */}
      {allDeliverables.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-2 text-xs text-[#8B7082]">
            <span>{totalPublishedCount}/{totalDeliverablesCount} delivered</span>
            <div className="flex-1 h-1.5 bg-[#F5F3F4] rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-[#5A8A5A] to-[#6B9B6B] rounded-full transition-all shadow-[0_0_8px_rgba(90,138,90,0.4)]"
                style={{ width: `${(totalPublishedCount / totalDeliverablesCount) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex gap-1 mt-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {allDeliverables.map(d => {
              const inThisPeriod = isDeliverableInPeriod(d);
              const isSelected = displayDeliverable?.id === d.id;
              return (
                <button
                  key={d.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDeliverableId(d.id);
                  }}
                  className={cn(
                    "px-1.5 py-0.5 text-[9px] font-semibold rounded transition-all duration-200 flex-shrink-0",
                    isSelected
                      ? "bg-gradient-to-r from-[#612a4f] to-[#7a3d65] text-white shadow-[0_2px_8px_rgba(97,42,79,0.3)]"
                      : inThisPeriod
                        ? "bg-gradient-to-r from-[#F5F0F3] to-[#F0EAF0] text-[#612a4f] border border-[#612a4f]/20 hover:border-[#612a4f]/40 hover:shadow-sm"
                        : "bg-[#F8F6F7] text-[#8B7082]/60 border border-transparent"
                  )}
                >
                  {d.contentType === 'other' && d.customContentType ? d.customContentType : contentTypeConfig[d.contentType].short}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col gap-1.5 pt-2.5 border-t border-[#F5F3F4] mt-auto">
        {displaySubmitDate && (
          <div className="flex items-center justify-between text-xs text-[#8B7082]">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-2.5 h-2.5" />
              <span className={cn(isSubmitDone && "opacity-50")}>
                Submit: {format(parseISO(displaySubmitDate), "MMM d")}
              </span>
            </div>
            <label className="flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSubmitDone}
                onCheckedChange={(checked) => {
                  if (displayDeliverable) {
                    const updatedDeliverables = deal.deliverables.map(d =>
                      d.id === displayDeliverable.id ? { ...d, isSubmitted: checked as boolean } : d
                    );
                    onQuickUpdate(deal.id, { deliverables: updatedDeliverables });
                  }
                }}
                className="h-4 w-4 rounded-full border-[#8B7082]/30 data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-[#6B9B6B] data-[state=checked]:to-[#4A7A4A] data-[state=checked]:border-[#4A7A4A] data-[state=checked]:shadow-[0_2px_8px_rgba(74,122,74,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
              />
            </label>
          </div>
        )}
        {displayPublishDate && (
          <div className="flex items-center justify-between text-xs font-medium text-[#612a4f]">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="w-2.5 h-2.5" />
              <span className={cn(isPublishDone && "opacity-50")}>
                Publish: {format(parseISO(displayPublishDate), "MMM d")}
              </span>
            </div>
            <label className="flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isPublishDone}
                onCheckedChange={(checked) => {
                  if (displayDeliverable) {
                    const updatedDeliverables = deal.deliverables.map(d =>
                      d.id === displayDeliverable.id ? { ...d, isPublished: checked as boolean } : d
                    );
                    onQuickUpdate(deal.id, { deliverables: updatedDeliverables });
                  }
                }}
                className="h-4 w-4 rounded-full border-[#8B7082]/30 data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-[#6B9B6B] data-[state=checked]:to-[#4A7A4A] data-[state=checked]:border-[#4A7A4A] data-[state=checked]:shadow-[0_2px_8px_rgba(74,122,74,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
              />
            </label>
          </div>
        )}
        {/* Paid checkbox - always visible for selected deliverable */}
        {displayDeliverable && (() => {
          // Calculate effective paid amount: use paymentAmount if set, otherwise derive from balance after deposit
          // Deposit is PART of totalFee, so deliverable payment = (totalFee - depositAmount) / numDeliverables
          const balanceAfterDeposit = deal.totalFee ? deal.totalFee - (deal.depositAmount || 0) : 0;
          const effectivePaidAmount = displayDeliverable.paymentAmount ||
            (displayDeliverable.isPaid ? Math.round(balanceAfterDeposit / (deal.deliverables?.length || 1)) : 0);

          return (
          <div className={cn(
            "flex items-center justify-between text-xs pt-1.5 mt-1 border-t border-[#F5F3F4] font-medium",
            displayDeliverable.isPaid ? "text-[#5A8A5A]" : "text-[#612a4f]"
          )}>
            <div className="flex items-center gap-1.5">
              <Diamond className="w-2.5 h-2.5 fill-current" />
              <span className="font-semibold">
                Content Paid{effectivePaidAmount > 0 ? ` $${effectivePaidAmount.toLocaleString()}` : ''}
              </span>
            </div>
            <label className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={displayDeliverable.isPaid || false}
                onCheckedChange={(checked) => {
                  const updatedDeliverables = deal.deliverables.map(d =>
                    d.id === displayDeliverable.id ? {
                      ...d,
                      isPaid: checked as boolean,
                      paidDate: checked ? new Date().toISOString() : undefined
                    } : d
                  );
                  onQuickUpdate(deal.id, { deliverables: updatedDeliverables });
                }}
                className="h-4 w-4 rounded-full border-[#8B7082]/30 data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-[#6B9B6B] data-[state=checked]:to-[#4A7A4A] data-[state=checked]:border-[#4A7A4A] data-[state=checked]:shadow-[0_2px_8px_rgba(74,122,74,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
              />
            </label>
          </div>
          );
        })()}
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
    <div className="bg-white rounded-xl border border-[#8B7082]/30 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAF9F7] border-b border-[#8B7082]/30">
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
                    <p className="font-medium text-[#612a4f] text-sm">{deal.brandName}</p>
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
                  <span className="font-semibold text-[#612a4f]">${deal.totalFee.toLocaleString()}</span>
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
                      <span className="text-sm text-[#612a4f] font-medium">
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
      contentType: '' as ContentType,
      status: '' as DeliverableStatus,
    };
    setFormData(prev => ({
      ...prev,
      deliverables: [newDeliverable, ...(prev.deliverables || [])]
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

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest('form') || e.currentTarget.closest('[role="dialog"]');
      if (!form) return;

      const focusableElements = form.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled])'
      );
      const currentIndex = Array.from(focusableElements).indexOf(e.currentTarget);
      const nextElement = focusableElements[currentIndex + 1];
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  const handleSubmit = () => {
    if (!formData.brandName) return;
    onSave(formData);
  };

  // Calculate fee mismatch for highlighting
  const deliverableTotal = formData.deliverables?.reduce((sum, del) => sum + (del.paymentAmount || 0), 0) || 0;
  const calculatedTotal = (formData.depositAmount || 0) + deliverableTotal;
  const hasMismatch = deliverableTotal > 0 && calculatedTotal !== (formData.totalFee || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#FAF9F8] via-[#F8F6F5] to-[#F5F3F2] border border-[#8B7082]/10" style={{ fontFamily: "'DM Sans', sans-serif", borderRadius: '20px', boxShadow: '0 24px 80px rgba(0,0,0,0.12)' }}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#612a4f] tracking-[-0.02em]" style={{ fontFamily: "'Playfair Display', serif" }}>{deal ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Partnership Details */}
          <div className="space-y-4 p-6 rounded-2xl bg-white border border-[#E8E4E6] shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(97,42,79,0.06)]">
            <h3 className="text-sm font-semibold text-[#612a4f] flex items-center gap-3 tracking-wide">
              <div className="w-9 h-9 rounded-lg bg-[#612a4f] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              Partnership Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Brand Name *</label>
                <Input
                  value={formData.brandName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  placeholder="e.g., Nike"
                  className="rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200"
                />
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Product/Campaign</label>
                <Input
                  value={formData.productCampaign}
                  onChange={(e) => setFormData(prev => ({ ...prev, productCampaign: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  placeholder="e.g., Summer Collection"
                  className="rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200"
                />
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Contact Person</label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  placeholder="e.g., Maria Smith"
                  className="rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200"
                />
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Contact Email</label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  placeholder="maria@brand.com"
                  className="rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200"
                />
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Project Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as BrandDeal['status'], customStatus: value === 'other' ? '' : undefined }))}>
                  <SelectTrigger className="rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)]">
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
                    className="rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] h-9 text-sm mt-2 transition-shadow duration-200"
                    autoFocus
                  />
                )}
              </div>
              <div>
                <label className="text-xs text-[#8B7082] mb-1 block">Contract</label>
                {formData.contractFile ? (
                  <div className="flex items-center gap-2 p-2 bg-[#FAF9F7] rounded-[10px] border border-[#E8E4E6]">
                    <FileText className="w-4 h-4 text-[#8B7082] flex-shrink-0" />
                    <span className="text-sm text-[#612a4f] flex-1 truncate">{formData.contractFile.name}</span>
                    <button
                      type="button"
                      onClick={() => window.open(formData.contractFile?.url, '_blank')}
                      className="text-xs text-[#8B7082] hover:text-[#612a4f]"
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
                    <div className="flex items-center justify-center gap-2 h-10 border border-[#E8E4E6] rounded-[10px] bg-[#F5F0F3] hover:bg-[#EDE6EB] hover:border-[#D5CDD2] transition-all duration-200">
                      <Upload className="w-4 h-4 text-[#612a4f]" />
                      <span className="text-sm text-[#612a4f] font-medium">Upload PDF</span>
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

          {/* Payment Details */}
          <div className="space-y-5 p-6 rounded-2xl bg-white border border-[#E8E4E6] shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(97,42,79,0.06)]">
            <h3 className="text-sm font-semibold text-[#612a4f] flex items-center gap-3 tracking-wide">
              <div className="w-9 h-9 rounded-lg bg-[#612a4f] flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              Payment Details
            </h3>

            {/* Total Fee - Prominent */}
            <div className="bg-white rounded-lg p-4">
              <label className="text-xs font-semibold text-[#612a4f] uppercase tracking-wide mb-2 block">Total Fee</label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[#612a4f]">$</span>
                <Input
                  type="text"
                  value={formData.totalFee ? formData.totalFee.toLocaleString() : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, '');
                    const numValue = parseFloat(rawValue) || 0;
                    setFormData(prev => ({ ...prev, totalFee: numValue }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  placeholder="0"
                  className={cn(
                    "text-2xl font-bold h-12 rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200",
                    hasMismatch && "bg-amber-50 border-amber-300"
                  )}
                />
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#8B7082]/10">
                <div className="flex-1">
                  <label className="text-xs text-[#8B7082] mb-1 block">Deposit</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#8B7082]">$</span>
                    <Input
                      type="number"
                      value={formData.depositAmount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 0 }))}
                      onKeyDown={handleEnterKey}
                      placeholder="0"
                      className={cn(
                        "h-8 text-sm rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200",
                        hasMismatch && "bg-amber-50 border-amber-300"
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#8B7082] mb-1 block">Due Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-8 text-sm justify-start text-left font-normal rounded-[10px] border-[#E8E4E6] hover:border-[#D5CDD2] hover:bg-[#F5F5F5] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200">
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-[#8B7082]" />
                        {formData.finalPaymentDueDate ? format(parseISO(formData.finalPaymentDueDate), "MMM d") : "Select"}
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
              </div>
            </div>

            {/* Payment Progress Tracker */}
            <div>
              <label className="text-xs font-semibold text-[#612a4f] uppercase tracking-wide mb-3 block">Payment Progress</label>
              <div className="flex items-center justify-between gap-2">
                {/* Invoice Sent */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, invoiceSent: !prev.invoiceSent, invoiceSentDate: !prev.invoiceSent ? new Date().toISOString() : undefined }))}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    formData.invoiceSent
                      ? "bg-[#612a4f] border-[#612a4f] text-white"
                      : "bg-white border-[#8B7082]/20 text-[#8B7082] hover:border-[#8B7082]/40"
                  )}
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-xs font-medium">Invoice Sent</span>
                  <div className={cn("w-4 h-4 rounded-full border-2", formData.invoiceSent ? "bg-white border-white" : "border-current")}>
                    {formData.invoiceSent && <CheckCircle2 className="w-full h-full text-[#612a4f]" />}
                  </div>
                </button>

                <div className="w-8 h-0.5 bg-[#8B7082]/20" />

                {/* Deposit Paid */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, depositPaid: !prev.depositPaid, depositPaidDate: !prev.depositPaid ? new Date().toISOString() : undefined }))}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    formData.depositPaid
                      ? "bg-[#612a4f] border-[#612a4f] text-white"
                      : "bg-white border-[#8B7082]/20 text-[#8B7082] hover:border-[#8B7082]/40"
                  )}
                >
                  <Wallet className="w-5 h-5" />
                  <span className="text-xs font-medium">Deposit Paid</span>
                  <div className={cn("w-4 h-4 rounded-full border-2", formData.depositPaid ? "bg-white border-white" : "border-current")}>
                    {formData.depositPaid && <CheckCircle2 className="w-full h-full text-[#612a4f]" />}
                  </div>
                </button>

                <div className="w-8 h-0.5 bg-[#8B7082]/20" />

                {/* Final Payment */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, paymentReceived: !prev.paymentReceived, paymentReceivedDate: !prev.paymentReceived ? new Date().toISOString() : undefined }))}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all",
                    formData.paymentReceived
                      ? "bg-[#612a4f] border-[#612a4f] text-white"
                      : "bg-white border-[#8B7082]/20 text-[#8B7082] hover:border-[#8B7082]/40"
                  )}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-xs font-medium">Fully Paid</span>
                  <div className={cn("w-4 h-4 rounded-full border-2", formData.paymentReceived ? "bg-white border-white" : "border-current")}>
                    {formData.paymentReceived && <CheckCircle2 className="w-full h-full text-[#612a4f]" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-4 p-6 rounded-2xl bg-white border border-[#E8E4E6] shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(97,42,79,0.06)]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#612a4f] flex items-center gap-3 tracking-wide">
                <div className="w-9 h-9 rounded-lg bg-[#612a4f] flex items-center justify-center">
                  <Send className="w-4 h-4 text-white" />
                </div>
                Deliverables
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDeliverable}
                className="bg-gradient-to-r from-[#612a4f] to-[#4d2140] text-white hover:from-[#4d2140] hover:to-[#3a1830] border-0 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Deliverable
              </Button>
            </div>

            {formData.deliverables?.length === 0 ? (
              <div className="text-center py-10 bg-gradient-to-br from-[#FAF9F8] to-[#F5F3F2] rounded-xl border border-dashed border-[#8B7082]/20">
                <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-[#8B7082]/10 to-[#8B7082]/5 flex items-center justify-center mb-3">
                  <Send className="w-6 h-6 text-[#8B7082]/40" />
                </div>
                <p className="text-sm text-[#612a4f] font-medium">No deliverables added yet</p>
                <p className="text-xs text-[#8B7082]/70 mt-1">Click "Add Deliverable" to add content pieces</p>
              </div>
            ) : (
              <div className="space-y-6">
                {formData.deliverables?.map((deliverable, index) => (
                  <div key={deliverable.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-sm font-semibold text-[#612a4f]">Deliverable {index + 1}</span>
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
                          value={deliverable.contentType || undefined}
                          onValueChange={(value) => updateDeliverable(deliverable.id, { contentType: value as ContentType, customContentType: value === 'other' ? '' : undefined })}
                        >
                          <SelectTrigger className="rounded-[10px] border-l-4 border-l-[#612a4f] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] bg-[#F5F0F3] h-9 transition-shadow duration-200">
                            <SelectValue placeholder="Select content">
                              {deliverable.contentType
                                ? (deliverable.contentType === 'other'
                                  ? (deliverable.customContentType || 'Other')
                                  : contentTypeConfig[deliverable.contentType]?.label)
                                : null}
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
                            className="rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] bg-[#F5F0F3] h-9 text-sm mt-2 transition-shadow duration-200"
                            autoFocus
                          />
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-xs text-[#8B7082] mb-1 block">Deliverable {index + 1} Status</label>
                        <Select
                          value={deliverable.status || undefined}
                          onValueChange={(value) => updateDeliverable(deliverable.id, { status: value as DeliverableStatus })}
                        >
                          <SelectTrigger className="rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] bg-white h-9 transition-shadow duration-200">
                            <SelectValue placeholder="Select status">
                              {deliverable.status ? deliverableStatusConfig[deliverable.status]?.label : null}
                            </SelectValue>
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
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs text-[#8B7082]">Submit for Approval</label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox
                              checked={deliverable.isSubmitted || false}
                              onCheckedChange={(checked) => updateDeliverable(deliverable.id, { isSubmitted: checked as boolean })}
                              className="h-4 w-4 rounded-full border-[#8B7082]/30 data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-[#6B9B6B] data-[state=checked]:to-[#4A7A4A] data-[state=checked]:border-[#4A7A4A] data-[state=checked]:shadow-[0_2px_8px_rgba(74,122,74,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
                            />
                            <span className="text-[10px] text-[#8B7082]">Done</span>
                          </label>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal rounded-[10px] border-[#E8E4E6] hover:border-[#D5CDD2] hover:bg-[#F5F5F5] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] bg-white h-9 text-sm transition-shadow duration-200">
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

                      {/* Publish Due Date */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs text-[#8B7082]">Publish Due Date</label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox
                              checked={deliverable.isPublished || false}
                              onCheckedChange={(checked) => updateDeliverable(deliverable.id, { isPublished: checked as boolean })}
                              className="h-4 w-4 rounded-full border-[#8B7082]/30 data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-[#6B9B6B] data-[state=checked]:to-[#4A7A4A] data-[state=checked]:border-[#4A7A4A] data-[state=checked]:shadow-[0_2px_8px_rgba(74,122,74,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
                            />
                            <span className="text-[10px] text-[#8B7082]">Done</span>
                          </label>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal rounded-[10px] border-l-4 border-l-[#8B7082] border-[#E8E4E6] hover:border-[#D5CDD2] hover:bg-[#EDE8EB] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] bg-[#F5F0F3] h-9 text-sm transition-shadow duration-200">
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
                        onKeyDown={handleEnterKey}
                        placeholder="Optional: Add a description..."
                        className="rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] bg-white h-9 text-sm transition-shadow duration-200"
                      />
                    </div>

                    {/* Paid Checkbox */}
                    <div className="mt-3 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-[#612a4f] font-semibold">
                          Payment for this deliverable
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Checkbox
                            checked={deliverable.isPaid || false}
                            onCheckedChange={(checked) => updateDeliverable(deliverable.id, {
                              isPaid: checked as boolean,
                              paidDate: checked ? new Date().toISOString() : undefined
                            })}
                            className="h-4 w-4 rounded-full border-[#8B7082]/30 data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-[#6B9B6B] data-[state=checked]:to-[#4A7A4A] data-[state=checked]:border-[#4A7A4A] data-[state=checked]:shadow-[0_2px_8px_rgba(74,122,74,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]"
                          />
                          <span className="text-[10px] text-[#8B7082]">Paid</span>
                        </label>
                      </div>
                      <div className="relative w-32">
                        <DollarSign className={cn(
                          "absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4",
                          hasMismatch ? "text-amber-600" : "text-[#8B7082]"
                        )} />
                        <Input
                          type="text"
                          value={deliverable.paymentAmount ? deliverable.paymentAmount.toLocaleString() : ''}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, '');
                            const numValue = parseFloat(rawValue) || 0;
                            updateDeliverable(deliverable.id, { paymentAmount: numValue });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          placeholder="0"
                          className={cn(
                            "rounded-[10px] border-[#E8E4E6] focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] bg-white h-9 text-sm pl-8 transition-shadow duration-200",
                            hasMismatch && "bg-amber-50 border-amber-300"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-4 p-6 rounded-2xl bg-white border border-[#E8E4E6] shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(97,42,79,0.06)]">
            <h3 className="text-sm font-semibold text-[#612a4f] flex items-center gap-3 tracking-wide">
              <div className="w-9 h-9 rounded-lg bg-[#612a4f] flex items-center justify-center">
                <StickyNote className="w-4 h-4 text-white" />
              </div>
              Notes
            </h3>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional details..."
              className="min-h-[100px] rounded-[10px] border-[#E8E4E6] bg-white focus:border-[#612a4f] focus:ring-0 focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-shadow duration-200"
            />
          </div>
        </div>

        {/* Fee Mismatch Warning - shown above save button */}
        {hasMismatch && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-amber-50/80 border border-amber-200/60 mx-6 mb-4 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">Fee mismatch</p>
              <p className="text-xs text-amber-700 mt-1">
                Deposit (${(formData.depositAmount || 0).toLocaleString()}) + Deliverables (${deliverableTotal.toLocaleString()}) = ${calculatedTotal.toLocaleString()}
              </p>
              <p className="text-xs text-amber-700">
                Total Fee entered: ${(formData.totalFee || 0).toLocaleString()} — Difference: {((formData.totalFee || 0) - calculatedTotal) > 0 ? '+' : ''}${((formData.totalFee || 0) - calculatedTotal).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[#612a4f]/20 rounded-xl hover:bg-[#612a4f]/10 hover:border-[#612a4f]/30 transition-all duration-200">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-gradient-to-r from-[#612a4f] to-[#4d2140] hover:from-[#4d2140] hover:to-[#3a1830] text-white rounded-xl shadow-[0_4px_16px_rgba(97,42,79,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_24px_rgba(97,42,79,0.4)] transition-all duration-200">
            {deal ? 'Save Changes' : 'Add Deal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Brands;
