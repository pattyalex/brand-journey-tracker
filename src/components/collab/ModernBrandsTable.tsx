import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Columns } from "lucide-react";
import { cn } from "@/lib/utils";
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
    },
    {
      id: '2',
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
      {/* Notification */}
      {showNotification && (
        <div className="absolute top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Column added successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Brand Partnerships</h2>
            <p className="text-sm text-gray-600 mt-0.5">Track and manage your brand collaborations</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleAddPartnership}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Partnership
            </Button>
            <Button
              onClick={handleAddColumn}
              variant="outline"
              className="border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
            >
              <Columns className="h-4 w-4 mr-2" /> Add Column
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
              {allColumns.map((column) => (
                column.editable ? (
                  <EditableColumnHeader
                    key={column.key}
                    title={column.title}
                    onChange={(newTitle) => handleUpdateColumnTitle(column.key, newTitle)}
                    canDelete={column.deletable}
                    onDelete={column.deletable ? () => handleDeleteColumn(column.key) : undefined}
                    className="font-semibold text-gray-800 py-4 px-8 text-sm uppercase tracking-wide whitespace-nowrap"
                  />
                ) : (
                  <TableHead
                    key={column.key}
                    className="font-semibold text-gray-800 py-4 px-8 text-sm uppercase tracking-wide whitespace-nowrap"
                  >
                    {column.title}
                  </TableHead>
                )
              ))}
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand, index) => (
              <TableRow
                key={brand.id}
                className={cn(
                  "group hover:bg-gradient-to-r hover:from-indigo-50/30 hover:to-purple-50/30 transition-all duration-200 border-b border-gray-200",
                  brand.id === '1' && "italic"
                )}
              >
                {allColumns.map((column, colIndex) => (
                  <TableCell
                    key={`${brand.id}-${column.key}`}
                    className="py-4 px-8 text-gray-700"
                  >
                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {colIndex === 0 && brand.id === '1' && (
                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                          EXAMPLE
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
                <TableCell className="py-4 px-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {brands.length === 0 && (
              <TableRow>
                <TableCell colSpan={allColumns.length + 1} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-700 font-medium">No partnerships yet</p>
                      <p className="text-sm text-gray-500">Click "Add Partnership" to get started</p>
                    </div>
                  </div>
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
