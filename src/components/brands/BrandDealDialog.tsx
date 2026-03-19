import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  Plus,
  DollarSign,
  Calendar as CalendarIcon,
  CheckCircle2,
  Upload,
  FileText,
  Mail,
  Building2,
  Send,
  StickyNote,
  X,
  AlertCircle,
  Wallet,
} from "lucide-react";
import {
  BrandDeal,
  Deliverable,
  ContentType,
  DeliverableStatus,
  contentTypeConfig,
  deliverableStatusConfig,
  statusConfig,
  statusOrder,
} from "./brandsTypes";

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: BrandDeal | null;
  onSave: (deal: Partial<BrandDeal>) => void;
}

const BrandDealDialog = ({ open, onOpenChange, deal, onSave }: DealDialogProps) => {
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

export default BrandDealDialog;
