import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface CollabFiltersProps {
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  paymentStatusFilter: string;
  setPaymentStatusFilter: (value: string) => void;
}

const CollabFilters = ({
  statusFilter,
  setStatusFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
}: CollabFiltersProps) => {
  return (
    <div className="flex gap-3 items-center flex-wrap">
      <span className="text-xs text-gray-500 font-medium">Filter by:</span>
      <Select value={statusFilter} onValueChange={setStatusFilter} defaultValue="Contract Signed">
        <SelectTrigger className="w-[160px] h-9 border border-gray-300 bg-white hover:border-indigo-400 focus:ring-1 focus:ring-indigo-300 text-sm">
          <SelectValue placeholder="Contract Signed" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="Pitched">Pitched</SelectItem>
          <SelectItem value="In Negotiation">In Negotiation</SelectItem>
          <SelectItem value="Contract Signed">Contract Signed</SelectItem>
          <SelectItem value="Content Submitted">Content Submitted</SelectItem>
          <SelectItem value="Posted">Posted</SelectItem>
        </SelectContent>
      </Select>

      <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
        <SelectTrigger className="w-[160px] h-9 border border-gray-300 bg-white hover:border-indigo-400 focus:ring-1 focus:ring-indigo-300 text-sm">
          <SelectValue placeholder="All Payments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Payments</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="unpaid">Unpaid</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CollabFilters;