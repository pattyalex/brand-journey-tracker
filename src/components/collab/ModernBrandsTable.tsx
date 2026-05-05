import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Columns, X, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import EditableTableCell from "@/components/collab/EditableTableCell";
import StatusBadge from "@/components/collab/StatusBadge";
import DepositPaidCell from "@/components/collab/DepositPaidCell";
import PostDateCell from "@/components/collab/PostDateCell";
import FinalPaymentDueDateCell from "@/components/collab/FinalPaymentDueDateCell";
import InvoiceSentCell from "@/components/collab/InvoiceSentCell";
import PaymentReceivedCell from "@/components/collab/PaymentReceivedCell";
import BriefContractCell from "@/components/collab/BriefContractCell";
import NotesCell from "@/components/collab/NotesCell";
import EditableColumnHeader from "@/components/collab/EditableColumnHeader";

interface ModernBrandsTableProps {
  // Add props as needed
}

const ModernBrandsTable = ({}: ModernBrandsTableProps) => {
  const defaultColumns = [
    { key: 'brandName', title: 'Brand Name', editable: false, deletable: false },
    { key: 'product', title: 'Product', editable: false, deletable: false },
    { key: 'contact', title: 'Contact', editable: false, deletable: false },
    { key: 'status', title: 'Status', editable: false, deletable: false },
    { key: 'deliverables', title: 'Deliverables', editable: false, deletable: false },
    { key: 'briefContract', title: 'Brief/Contract Terms', editable: false, deletable: false },
    { key: 'rate', title: 'Rate', editable: false, deletable: false },
    { key: 'postDate', title: 'Post Date', editable: false, deletable: false },
    { key: 'depositPaid', title: 'Deposit Paid', editable: false, deletable: false },
    { key: 'finalPaymentDueDate', title: 'Final Payment Due Date', editable: false, deletable: false },
    { key: 'invoiceSent', title: 'Invoice Sent', editable: false, deletable: false },
    { key: 'paymentReceived', title: 'Payment Received', editable: false, deletable: false },
    { key: 'notes', title: 'Notes', editable: false, deletable: false },
  ];

  const [customColumns, setCustomColumns] = useState<Array<{ key: string; title: string; editable: boolean; deletable: boolean }>>([]);
  const [allColumns, setAllColumns] = useState(defaultColumns);
  const [showNotification, setShowNotification] = useState(false);
  const [showExampleRow, setShowExampleRow] = useState(true);

  // Sample data with state
  const [brands, setBrands] = useState([
    {
      id: '1',
      brandName: 'Brand X',
      product: 'Coffee Beans',
      contact: 'contact@example.com',
      status: 'Contract Signed',
      deliverables: '3 Posts + 1 Story',
      briefContract: JSON.stringify([{ name: 'example.pdf', url: '#' }]),
      rate: '$2,500',
      postDate: '2026-01-15T00:00:00.000Z',
      depositPaid: 'Yes',
      finalPaymentDueDate: '2026-02-01T00:00:00.000Z',
      invoiceSent: 'Yes',
      paymentReceived: 'Paid',
      notes: 'Sample notes'
    }
  ]);

  const handleUpdateBrand = (id: string, field: string, value: string) => {
    setBrands(brands.map(brand =>
      brand.id === id ? { ...brand, [field]: value } : brand
    ));
  };

  const handleDeleteBrand = (id: string) => {
    setBrands(brands.filter(brand => brand.id !== id));
  };

  const handleAddColumn = () => {
    const newColumnKey = `custom_${Date.now()}`;
    const newColumn = {
      key: newColumnKey,
      title: 'New Column',
      editable: true,
      deletable: true
    };

    setCustomColumns([...customColumns, newColumn]);
    setAllColumns([...allColumns, newColumn]);

    // Add empty value for this column to all brands
    setBrands(brands.map(brand => ({
      ...brand,
      [newColumnKey]: ''
    })));

    // Show notification
    setShowNotification(true);
  };

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  const handleDeleteColumn = (columnKey: string) => {
    setCustomColumns(customColumns.filter(col => col.key !== columnKey));
    setAllColumns(allColumns.filter(col => col.key !== columnKey));

    // Remove this column from all brands
    setBrands(brands.map(brand => {
      const { [columnKey]: removed, ...rest } = brand as any;
      return rest;
    }));
  };

  const handleUpdateColumnTitle = (columnKey: string, newTitle: string) => {
    setCustomColumns(customColumns.map(col =>
      col.key === columnKey ? { ...col, title: newTitle } : col
    ));
    setAllColumns(allColumns.map(col =>
      col.key === columnKey ? { ...col, title: newTitle } : col
    ));
  };

  const handleAddPartnership = () => {
    const newBrand: any = {
      id: `brand_${Date.now()}`,
      brandName: '',
      product: '',
      contact: '',
      status: 'Inbound',
      deliverables: '',
      briefContract: '',
      rate: '',
      postDate: '',
      depositPaid: 'No',
      finalPaymentDueDate: '',
      invoiceSent: 'No',
      paymentReceived: 'Unpaid',
      notes: ''
    };

    // Add empty values for custom columns
    customColumns.forEach(col => {
      newBrand[col.key] = '';
    });

    setBrands([...brands, newBrand]);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_2px_4px_rgba(0,0,0,0.03)] overflow-hidden relative">
      {/* Notification */}
      {showNotification && (
        <div className="absolute top-3 right-3 z-50 bg-[#612A4F] text-white px-3.5 py-2 rounded-lg shadow-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300 text-[13px]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Column added</span>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Brand Partnerships</h2>
            <p className="text-xs text-gray-400 mt-0.5">Track and manage your brand collaborations</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddPartnership}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium bg-[#612A4F] text-white hover:bg-[#4d2240] transition-colors duration-200 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Partnership
            </button>
            <button
              onClick={handleAddColumn}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-gray-500 hover:text-[#612A4F] hover:bg-[#612A4F]/5 border border-gray-200 hover:border-[#612A4F]/20 transition-all duration-200"
            >
              <Columns className="h-3.5 w-3.5" />
              Add Column
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100">
              <TableHead className="w-10 sticky left-0 z-10 bg-white"></TableHead>
              {allColumns.map((column) => (
                column.editable ? (
                  <EditableColumnHeader
                    key={column.key}
                    title={column.title}
                    onChange={(newTitle) => handleUpdateColumnTitle(column.key, newTitle)}
                    canDelete={column.deletable}
                    onDelete={column.deletable ? () => handleDeleteColumn(column.key) : undefined}
                    className="text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4 whitespace-nowrap"
                  />
                ) : (
                  <TableHead
                    key={column.key}
                    className="text-xs font-medium text-gray-400 uppercase tracking-wider py-3 px-4 whitespace-nowrap"
                  >
                    {column.title}
                  </TableHead>
                )
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.filter(brand => brand.id !== '1' || showExampleRow).map((brand, index) => (
              <TableRow
                key={brand.id}
                className={cn(
                  "group hover:bg-gray-50/60 transition-colors duration-150 border-b border-gray-50",
                  brand.id === '1' && "bg-[#612A4F]/[0.015]"
                )}
              >
                <TableCell className="w-10 sticky left-0 z-10 bg-white group-hover:bg-gray-50/60 text-center transition-colors duration-150">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="h-7 w-7 text-gray-300 hover:text-red-400 hover:bg-red-50/80 opacity-0 group-hover:opacity-100 transition-all duration-150"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
                {allColumns.map((column, colIndex) => (
                  <TableCell
                    key={`${brand.id}-${column.key}`}
                    className="py-3 px-4 text-sm text-gray-700"
                  >
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {column.key === 'brandName' && brand.id === '1' && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#612A4F] bg-[#612A4F]/[0.06] pl-1.5 pr-0.5 py-0.5 rounded whitespace-nowrap tracking-wide">
                          EXAMPLE
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowExampleRow(false);
                            }}
                            className="ml-0.5 p-0.5 hover:bg-[#612A4F]/10 rounded transition-colors duration-150"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </span>
                      )}
                      <div className="whitespace-nowrap">
                        {column.key === 'status' ? (
                      <StatusBadge
                        status={brand[column.key]}
                        onChange={(value) => handleUpdateBrand(brand.id, column.key, value)}
                      />
                    ) : column.key === 'depositPaid' ? (
                      <DepositPaidCell
                        value={brand[column.key]}
                        onChange={(value) => handleUpdateBrand(brand.id, column.key, value)}
                      />
                    ) : column.key === 'finalPaymentDueDate' ? (
                      <FinalPaymentDueDateCell
                        value={brand[column.key]}
                        onChange={(value) => handleUpdateBrand(brand.id, column.key, value)}
                      />
                    ) : column.key === 'postDate' ? (
                      <PostDateCell
                        value={brand[column.key]}
                        onChange={(value) => handleUpdateBrand(brand.id, column.key, value)}
                      />
                    ) : column.key === 'invoiceSent' ? (
                      <InvoiceSentCell
                        value={brand[column.key]}
                        onChange={(value) => handleUpdateBrand(brand.id, column.key, value)}
                      />
                    ) : column.key === 'paymentReceived' ? (
                      <PaymentReceivedCell
                        value={brand[column.key]}
                        onChange={(value) => handleUpdateBrand(brand.id, column.key, value)}
                      />
                    ) : column.key === 'briefContract' ? (
                      <BriefContractCell
                        value={brand[column.key]}
                        onChange={(value) => handleUpdateBrand(brand.id, column.key, value)}
                      />
                    ) : column.key === 'notes' ? (
                      <NotesCell
                        value={brand[column.key]}
                        onChange={(value) => handleUpdateBrand(brand.id, column.key, value)}
                      />
                    ) : (
                      <EditableTableCell
                        value={brand[column.key as keyof typeof brand]}
                        onChange={(value) => handleUpdateBrand(brand.id, column.key, value)}
                      />
                    )}
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {brands.length === 0 && (
              <TableRow>
                <TableCell colSpan={allColumns.length + 1} className="p-0">
                  <EmptyState
                    icon={Users}
                    title="No collaborations yet"
                    description="Track your partnerships and collaborations with other creators and brands."
                    actionLabel="Add Collaboration"
                    onAction={handleAddPartnership}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ModernBrandsTable;
