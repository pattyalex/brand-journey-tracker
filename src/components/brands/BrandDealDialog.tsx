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
  onQuickUpdate?: (id: string, updates: Partial<BrandDeal>) => void;
}

const BrandDealDialog = ({ open, onOpenChange, deal, onSave, onQuickUpdate }: DealDialogProps) => {
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

  const inputClass = "rounded-lg border-gray-200 focus:border-[#612a4f]/30 focus:ring-0 focus:shadow-[0_0_0_2px_rgba(97,42,79,0.08)] transition-shadow duration-150";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold text-gray-800">{deal ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-3">
          {/* Partnership Details */}
          <div className="space-y-3 p-5 rounded-lg bg-white border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-xs font-semibold text-gray-800 flex items-center gap-2.5 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-md bg-[#612a4f] flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5 text-white" />
              </div>
              Partnership Details
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Brand Name *</label>
                <Input
                  value={formData.brandName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  placeholder="e.g., Nike"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Product/Campaign</label>
                <Input
                  value={formData.productCampaign}
                  onChange={(e) => setFormData(prev => ({ ...prev, productCampaign: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  placeholder="e.g., Summer Collection"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Contact Person</label>
                <Input
                  value={formData.contactPerson}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  placeholder="e.g., Maria Smith"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Contact Email</label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  onKeyDown={handleEnterKey}
                  placeholder="maria@brand.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Project Status</label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as BrandDeal['status'], customStatus: value === 'other' ? '' : undefined }))}>
                  <SelectTrigger className={cn(inputClass, "h-10")}>
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
                    className={cn(inputClass, "h-9 text-sm mt-2")}
                    autoFocus
                  />
                )}
              </div>
              <div>
                <label className="text-[11px] text-gray-400 mb-1 block">Contract</label>
                {formData.contractFile ? (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                    <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">{formData.contractFile.name}</span>
                    <button
                      type="button"
                      onClick={() => window.open(formData.contractFile?.url, '_blank')}
                      className="text-xs text-gray-400 hover:text-[#612a4f] transition-colors"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, contractFile: undefined }))}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <div className="flex items-center justify-center gap-2 h-10 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all duration-150">
                      <Upload className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-sm text-gray-500 font-medium">Upload PDF</span>
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
          <div className="space-y-4 p-5 rounded-lg bg-white border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-xs font-semibold text-gray-800 flex items-center gap-2.5 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-md bg-[#612a4f] flex items-center justify-center">
                <DollarSign className="w-3.5 h-3.5 text-white" />
              </div>
              Payment Details
            </h3>

            {/* Total Fee */}
            <div className="bg-gray-50/50 rounded-lg p-4">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 block">Total Fee</label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-gray-800">$</span>
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
                    "text-xl font-semibold h-11",
                    inputClass,
                    hasMismatch && "bg-amber-50 border-amber-300"
                  )}
                />
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                <div className="flex-1">
                  <label className="text-[11px] text-gray-400 mb-1 block">Deposit</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">$</span>
                    <Input
                      type="number"
                      value={formData.depositAmount || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, depositAmount: parseFloat(e.target.value) || 0 }))}
                      onKeyDown={handleEnterKey}
                      placeholder="0"
                      className={cn(
                        "h-8 text-sm",
                        inputClass,
                        hasMismatch && "bg-amber-50 border-amber-300"
                      )}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 mb-1 block">Due Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("h-8 text-sm justify-start text-left font-normal", inputClass)}>
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400" />
                        {formData.finalPaymentDueDate ? format(parseISO(formData.finalPaymentDueDate), "MMM d") : "Select"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[10200]" sideOffset={5}>
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
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Payment Progress</label>
              <div className="flex items-center justify-between gap-2">
                {/* Invoice Sent */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, invoiceSent: !prev.invoiceSent, invoiceSentDate: !prev.invoiceSent ? new Date().toISOString() : undefined }))}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200",
                    formData.invoiceSent
                      ? "bg-[#612a4f] border-[#612a4f] text-white"
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500"
                  )}
                >
                  <Mail className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Invoice Sent</span>
                  <div className={cn("w-3.5 h-3.5 rounded-full border-2", formData.invoiceSent ? "bg-white border-white" : "border-current")}>
                    {formData.invoiceSent && <CheckCircle2 className="w-full h-full text-[#612a4f]" />}
                  </div>
                </button>

                <div className="w-6 h-px bg-gray-200" />

                {/* Deposit Paid */}
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, depositPaid: !prev.depositPaid, depositPaidDate: !prev.depositPaid ? new Date().toISOString() : undefined }))}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200",
                    formData.depositPaid
                      ? "bg-[#612a4f] border-[#612a4f] text-white"
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500"
                  )}
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Deposit Paid</span>
                  <div className={cn("w-3.5 h-3.5 rounded-full border-2", formData.depositPaid ? "bg-white border-white" : "border-current")}>
                    {formData.depositPaid && <CheckCircle2 className="w-full h-full text-[#612a4f]" />}
                  </div>
                </button>

                <div className="w-6 h-px bg-gray-200" />

                {/* Final Payment */}
                <button
                  type="button"
                  onClick={() => {
                    const newPaymentReceived = !formData.paymentReceived;
                    const updated = {
                      ...formData,
                      paymentReceived: newPaymentReceived,
                      paymentReceivedDate: newPaymentReceived ? new Date().toISOString() : undefined,
                      deliverables: (formData.deliverables || []).map(d => ({
                        ...d,
                        isPaid: newPaymentReceived,
                        paidDate: newPaymentReceived ? (d.paidDate || new Date().toISOString()) : undefined,
                      })),
                    };
                    setFormData(updated);
                    if (deal && onQuickUpdate) onQuickUpdate(deal.id, updated);
                  }}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all duration-200",
                    formData.paymentReceived
                      ? "bg-[#612a4f] border-[#612a4f] text-white"
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Fully Paid</span>
                  <div className={cn("w-3.5 h-3.5 rounded-full border-2", formData.paymentReceived ? "bg-white border-white" : "border-current")}>
                    {formData.paymentReceived && <CheckCircle2 className="w-full h-full text-[#612a4f]" />}
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Deliverables */}
          <div className="space-y-3 p-5 rounded-lg bg-white border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-800 flex items-center gap-2.5 uppercase tracking-wider">
                <div className="w-7 h-7 rounded-md bg-[#612a4f] flex items-center justify-center">
                  <Send className="w-3.5 h-3.5 text-white" />
                </div>
                Deliverables
              </h3>
              <button
                type="button"
                onClick={addDeliverable}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-[#612a4f] text-white hover:bg-[#4d2240] transition-colors duration-150"
              >
                <Plus className="w-3 h-3" />
                Add
              </button>
            </div>

            {formData.deliverables?.length === 0 ? (
              <div className="text-center py-10 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#612a4f]/[0.06] flex items-center justify-center mb-3">
                  <Send className="w-4 h-4 text-[#612a4f]/30" />
                </div>
                <p className="text-sm font-medium text-gray-500">No deliverables added yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Click "Add" to add content pieces</p>
              </div>
            ) : (
              <div className="space-y-5">
                {formData.deliverables?.map((deliverable, index) => (
                  <div key={deliverable.id} className="p-4 rounded-lg border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-600">Deliverable {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeDeliverable(deliverable.id)}
                        className="p-1 text-gray-300 hover:text-red-400 hover:bg-red-50/80 rounded transition-colors duration-150"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Content Type */}
                      <div>
                        <label className="text-[11px] text-gray-400 mb-1 block">Content Type</label>
                        <Select
                          value={deliverable.contentType || undefined}
                          onValueChange={(value) => updateDeliverable(deliverable.id, { contentType: value as ContentType, customContentType: value === 'other' ? '' : undefined })}
                        >
                          <SelectTrigger className={cn(inputClass, "border-l-2 border-l-[#612a4f] bg-[#612a4f]/[0.02] h-9")}>
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
                            className={cn(inputClass, "h-9 text-sm mt-2")}
                            autoFocus
                          />
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-[11px] text-gray-400 mb-1 block">Deliverable {index + 1} Status</label>
                        <Select
                          value={deliverable.status || undefined}
                          onValueChange={(value) => updateDeliverable(deliverable.id, { status: value as DeliverableStatus })}
                        >
                          <SelectTrigger className={cn(inputClass, "bg-white h-9")}>
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
                          <label className="text-[11px] text-gray-400">Submit for Approval</label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox
                              checked={deliverable.isSubmitted || false}
                              onCheckedChange={(checked) => updateDeliverable(deliverable.id, { isSubmitted: checked as boolean })}
                              className="h-3.5 w-3.5 rounded-full border-gray-300 data-[state=checked]:bg-[#612a4f] data-[state=checked]:border-[#612a4f]"
                            />
                            <span className="text-[10px] text-gray-400">Done</span>
                          </label>
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-white h-9 text-sm", inputClass)}>
                              <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400" />
                              {deliverable.submissionDeadline ? format(parseISO(deliverable.submissionDeadline), "MMM d, yyyy") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[10200]" sideOffset={5}>
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
                          <label className="text-[11px] text-gray-400">Publish Due Date</label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox
                              checked={deliverable.isPublished || false}
                              onCheckedChange={(checked) => updateDeliverable(deliverable.id, { isPublished: checked as boolean })}
                              className="h-3.5 w-3.5 rounded-full border-gray-300 data-[state=checked]:bg-[#612a4f] data-[state=checked]:border-[#612a4f]"
                            />
                            <span className="text-[10px] text-gray-400">Done</span>
                          </label>
                        </div>
                        <Popover modal={true}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal border-l-2 border-l-gray-400 bg-gray-50/50 h-9 text-sm", inputClass)}>
                              <CalendarIcon className="mr-2 h-3.5 w-3.5 text-gray-400" />
                              {deliverable.publishDeadline ? format(parseISO(deliverable.publishDeadline), "MMM d, yyyy") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 z-[10200]" side="bottom" sideOffset={5}>
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
                        className={cn(inputClass, "bg-white h-9 text-sm")}
                      />
                    </div>

                    {/* Paid Checkbox */}
                    <div className="mt-3 mb-1">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs text-gray-600 font-semibold">
                          Payment for this deliverable
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <Checkbox
                            checked={deliverable.isPaid || false}
                            onCheckedChange={(checked) => updateDeliverable(deliverable.id, {
                              isPaid: checked as boolean,
                              paidDate: checked ? new Date().toISOString() : undefined
                            })}
                            className="h-3.5 w-3.5 rounded-full border-gray-300 data-[state=checked]:bg-[#612a4f] data-[state=checked]:border-[#612a4f]"
                          />
                          <span className="text-[10px] text-gray-400">Paid</span>
                        </label>
                      </div>
                      <div className="relative w-32">
                        <DollarSign className={cn(
                          "absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5",
                          hasMismatch ? "text-amber-600" : "text-gray-400"
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
                            inputClass,
                            "bg-white h-9 text-sm pl-7",
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
          <div className="space-y-3 p-5 rounded-lg bg-white border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <h3 className="text-xs font-semibold text-gray-800 flex items-center gap-2.5 uppercase tracking-wider">
              <div className="w-7 h-7 rounded-md bg-[#612a4f] flex items-center justify-center">
                <StickyNote className="w-3.5 h-3.5 text-white" />
              </div>
              Notes
            </h3>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional details..."
              className={cn(inputClass, "min-h-[100px] bg-white")}
            />
          </div>
        </div>

        {/* Fee Mismatch Warning */}
        {hasMismatch && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-amber-50 border border-amber-200/60 mx-1 mb-3">
            <div className="w-7 h-7 rounded-md bg-amber-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-amber-800">Fee mismatch</p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Deposit (${(formData.depositAmount || 0).toLocaleString()}) + Deliverables (${deliverableTotal.toLocaleString()}) = ${calculatedTotal.toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-700">
                Total Fee entered: ${(formData.totalFee || 0).toLocaleString()} — Difference: {((formData.totalFee || 0) - calculatedTotal) > 0 ? '+' : ''}${((formData.totalFee || 0) - calculatedTotal).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-sm">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#612a4f] hover:bg-[#4d2240] text-white rounded-lg shadow-sm transition-colors duration-150 text-sm">
            {deal ? 'Save Changes' : 'Add Deal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BrandDealDialog;
