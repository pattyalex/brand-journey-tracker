import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBrandDeals } from "@/hooks/useBrandDeals";
import { EVENTS, emit } from "@/lib/events";
import { getString } from "@/lib/storage";
import { toast } from "sonner";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, isBefore, addDays, isSameMonth, isSameYear } from "date-fns";
import { BrandDeal, statusOrder } from "./brandsTypes";

export function useBrandsPage() {
  const { user } = useAuth();
  const { deals, isLoading: dealsLoading, addDeal, updateDeal, deleteDeal, archiveDeal, unarchiveDeal } = useBrandDeals();
  const isReady = !dealsLoading;
  const migrationRanRef = useRef(false);
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

  // Emit event for Dashboard whenever deals change
  useEffect(() => {
    emit(window, EVENTS.brandDealsUpdated, deals);
  }, [deals]);

  // One-time migration: lift localStorage data to Supabase if Supabase is empty
  useEffect(() => {
    if (migrationRanRef.current || dealsLoading || deals.length > 0 || !user?.id) return;
    migrationRanRef.current = true;
    const localData = getString('brandDeals');
    if (!localData) return;
    try {
      const localDeals: BrandDeal[] = JSON.parse(localData);
      if (localDeals.length === 0) return;
      localDeals.forEach(({ id: _id, createdAt: _createdAt, ...rest }) => {
        addDeal(rest as Omit<BrandDeal, 'id' | 'createdAt'>);
      });
    } catch {
      // ignore malformed data
    }
  }, [dealsLoading, deals.length, user?.id]);

  // Dashboard metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const yearStart = startOfYear(selectedMonth);
    const yearEnd = endOfYear(selectedMonth);

    // Calculate earnings from deposits and deliverable payments for selected month
    const monthlyEarningsCalc = deals.reduce((sum, d) => {
      let dealTotal = 0;
      const totalDeliverables = d.deliverables?.length || 1;
      const balanceAfterDeposit = d.totalFee ? d.totalFee - (d.depositAmount || 0) : 0;
      const perDeliverableAmount = Math.round(balanceAfterDeposit / totalDeliverables);

      const deliverablesInMonth = d.deliverables?.filter(del => {
        const submitInMonth = del.submissionDeadline && isSameMonth(parseISO(del.submissionDeadline), selectedMonth);
        const publishInMonth = del.publishDeadline && isSameMonth(parseISO(del.publishDeadline), selectedMonth);
        return submitInMonth || publishInMonth;
      }) || [];

      const dealHasDeliverablesInMonth = deliverablesInMonth.length > 0;

      if (d.depositPaid && d.depositAmount && dealHasDeliverablesInMonth) {
        dealTotal += d.depositAmount;
      }

      deliverablesInMonth.forEach(del => {
        if (del.isPaid) {
          const effectiveAmount = del.paymentAmount || perDeliverableAmount;
          dealTotal += effectiveAmount;
        }
      });

      return sum + dealTotal;
    }, 0);

    const selectedYear = selectedMonth.getFullYear();

    const yearlyEarningsCalc = deals.reduce((sum, d) => {
      let dealTotal = 0;
      const totalDeliverables = d.deliverables?.length || 1;
      const balanceAfterDeposit = d.totalFee ? d.totalFee - (d.depositAmount || 0) : 0;
      const perDeliverableAmount = Math.round(balanceAfterDeposit / totalDeliverables);

      const deliverablesInYear = d.deliverables?.filter(del => {
        const submitInYear = del.submissionDeadline && parseISO(del.submissionDeadline).getFullYear() === selectedYear;
        const publishInYear = del.publishDeadline && parseISO(del.publishDeadline).getFullYear() === selectedYear;
        return submitInYear || publishInYear;
      }) || [];

      const dealHasDeliverablesInYear = deliverablesInYear.length > 0;

      if (d.depositPaid && d.depositAmount && dealHasDeliverablesInYear) {
        dealTotal += d.depositAmount;
      }

      deliverablesInYear.forEach(del => {
        if (del.isPaid) {
          const effectiveAmount = del.paymentAmount || perDeliverableAmount;
          dealTotal += effectiveAmount;
        }
      });

      return sum + dealTotal;
    }, 0);

    const pendingAmount = deals.reduce((sum, d) => {
      if (!d.totalFee) return sum;

      const totalDeliverables = d.deliverables?.length || 1;
      const balanceAfterDep = d.totalFee - (d.depositAmount || 0);
      const perDelAmount = Math.round(balanceAfterDep / totalDeliverables);

      let paidTotal = 0;

      if (d.depositPaid && d.depositAmount) {
        paidTotal += d.depositAmount;
      }

      d.deliverables?.forEach(del => {
        if (del.isPaid) {
          paidTotal += del.paymentAmount || perDelAmount;
        }
      });

      const remaining = d.totalFee - paidTotal;
      return sum + Math.max(0, remaining);
    }, 0);

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

  // Count archived deals
  const archivedCount = useMemo(() => deals.filter(d => d.isArchived).length, [deals]);

  const filteredDeals = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const yearStart = startOfYear(selectedMonth);
    const yearEnd = endOfYear(selectedMonth);
    const selectedYear = selectedMonth.getFullYear();

    return deals.filter(deal => {
      const matchesArchive = showArchived ? deal.isArchived : !deal.isArchived;
      if (!matchesArchive) return false;

      const matchesSearch = !searchQuery ||
        deal.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.productCampaign.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;

      const isPaidInFull = (() => {
        const hasDeposit = deal.depositAmount && deal.depositAmount > 0;
        const depositPaid = hasDeposit ? deal.depositPaid : true;

        const deliverables = deal.deliverables || [];
        const allDeliverablesPaid = deliverables.length === 0 || deliverables.every(d => d.isPaid);

        const hasSomethingPaid = (hasDeposit && deal.depositPaid) || deliverables.some(d => d.isPaid);

        return depositPaid && allDeliverablesPaid && hasSomethingPaid;
      })();

      const matchesPayment = paymentFilter === 'all' ||
        (paymentFilter === 'paid' && isPaidInFull) ||
        (paymentFilter === 'unpaid' && !isPaidInFull);

      if (showArchived || searchQuery) {
        return matchesSearch && matchesStatus && matchesPayment;
      }

      if (isYearView) {
        const hasDeliverableInYear = deal.deliverables?.some(del => {
          const submitDate = del.submissionDeadline ? parseISO(del.submissionDeadline) : null;
          const publishDate = del.publishDeadline ? parseISO(del.publishDeadline) : null;
          return (submitDate && submitDate.getFullYear() === selectedYear) ||
                 (publishDate && publishDate.getFullYear() === selectedYear);
        });

        const campaignInYear = (deal.campaignStart && parseISO(deal.campaignStart).getFullYear() === selectedYear) ||
                               (deal.campaignEnd && parseISO(deal.campaignEnd).getFullYear() === selectedYear);

        const hasNoScheduledDates = !deal.deliverables?.some(del => del.submissionDeadline || del.publishDeadline) &&
                                     !deal.campaignStart && !deal.campaignEnd;
        const isCurrentYear = isSameYear(selectedMonth, new Date());
        const showUnscheduledInCurrentYear = hasNoScheduledDates && isCurrentYear;

        const matchesYear = hasDeliverableInYear || campaignInYear || showUnscheduledInCurrentYear;

        return matchesSearch && matchesStatus && matchesPayment && matchesYear;
      } else {
        const hasDeliverableInMonth = deal.deliverables?.some(del => {
          const submitDate = del.submissionDeadline ? parseISO(del.submissionDeadline) : null;
          const publishDate = del.publishDeadline ? parseISO(del.publishDeadline) : null;
          return (submitDate && isWithinInterval(submitDate, { start: monthStart, end: monthEnd })) ||
                 (publishDate && isWithinInterval(publishDate, { start: monthStart, end: monthEnd }));
        });

        const campaignInMonth = (deal.campaignStart && isWithinInterval(parseISO(deal.campaignStart), { start: monthStart, end: monthEnd })) ||
                                (deal.campaignEnd && isWithinInterval(parseISO(deal.campaignEnd), { start: monthStart, end: monthEnd }));

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
    const getEarliestDate = (deal: BrandDeal) => {
      const dates = deal.deliverables
        .map(d => d.submissionDeadline || d.publishDeadline)
        .filter(Boolean)
        .sort();
      return dates[0] || 'z';
    };
    const grouped: Record<string, BrandDeal[]> = {};
    statusOrder.forEach(status => {
      grouped[status] = filteredDeals
        .filter(d => d.status === status)
        .sort((a, b) => getEarliestDate(a).localeCompare(getEarliestDate(b)));
    });
    return grouped;
  }, [filteredDeals]);

  const handleAddDeal = async (deal: Omit<BrandDeal, 'id' | 'createdAt'>) => {
    const months = new Set<string>();
    deal.deliverables?.forEach(del => {
      if (del.submissionDeadline) months.add(format(parseISO(del.submissionDeadline), "MMMM yyyy"));
      if (del.publishDeadline) months.add(format(parseISO(del.publishDeadline), "MMMM yyyy"));
    });

    await addDeal(deal);
    setIsAddDialogOpen(false);

    if (months.size > 0) {
      const monthList = Array.from(months).join(", ");
      toast.success(`${deal.brandName} added`, {
        description: `Deliverables scheduled for ${monthList}`,
      });
    }
  };

  const handleUpdateDeal = async (id: string, updates: Partial<BrandDeal>) => {
    await updateDeal(id, updates);
    setEditingDeal(null);
  };

  const handleDeleteDeal = async (id: string) => {
    await deleteDeal(id);
  };

  const handleArchiveDeal = async (id: string) => {
    await archiveDeal(id);
  };

  const handleUnarchiveDeal = async (id: string) => {
    await unarchiveDeal(id);
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

  return {
    // State
    view,
    setView,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingDeal,
    setEditingDeal,
    selectedMonth,
    setSelectedMonth,
    isYearView,
    setIsYearView,
    showArchived,
    setShowArchived,
    // Derived
    isReady,
    metrics,
    archivedCount,
    filteredDeals,
    dealsByStatus,
    // Handlers
    handleAddDeal,
    handleUpdateDeal,
    handleDeleteDeal,
    handleArchiveDeal,
    handleUnarchiveDeal,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
