import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  FileText,
  Upload,
  Building2,
} from "lucide-react";
import { BrandDeal, contentTypeConfig, deliverableStatusConfig, statusConfig, statusOrder } from "./brandsTypes";

interface TableViewProps {
  deals: BrandDeal[];
  onEdit: (deal: BrandDeal) => void;
  onDelete: (id: string) => void;
  onQuickUpdate: (id: string, updates: Partial<BrandDeal>) => void;
}

const BrandsTable = ({ deals, onEdit, onDelete, onQuickUpdate }: TableViewProps) => {
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

export default BrandsTable;
