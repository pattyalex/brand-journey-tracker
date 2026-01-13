import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Columns } from "lucide-react";
import EditableTableCell from "@/components/collab/EditableTableCell";
import StatusBadge from "@/components/collab/StatusBadge";
import DepositPaidCell from "@/components/collab/DepositPaidCell";
import FinalPaymentDueDateCell from "@/components/collab/FinalPaymentDueDateCell";
import InvoiceSentCell from "@/components/collab/InvoiceSentCell";
import PaymentReceivedCell from "@/components/collab/PaymentReceivedCell";
import PostDateCell from "@/components/collab/PostDateCell";
import BriefContractCell from "@/components/collab/BriefContractCell";
import NotesCell from "@/components/collab/NotesCell";
import { CollabBrand, TableColumn } from "@/types/collab";
import EditableColumnHeader from "./EditableColumnHeader";
import { cn } from "@/lib/utils";

interface BrandsCollabTableProps {
  brands: CollabBrand[];
  columns: TableColumn[];
  handleUpdateBrand: (id: string, field: keyof CollabBrand, value: string) => void;
  handleAddBrand: () => void;
  handleDeleteBrand: (id: string) => void;
  handleUpdateColumnTitle: (index: number, newTitle: string) => void;
  handleAddColumn?: () => void;
  handleDeleteColumn?: (columnKey: string) => void;
}

const BrandsCollabTable = ({
  brands,
  columns,
  handleUpdateBrand,
  handleAddBrand,
  handleDeleteBrand,
  handleUpdateColumnTitle,
  handleAddColumn,
  handleDeleteColumn,
}: BrandsCollabTableProps) => {
  const isHeaderEditable = (columnKey: keyof CollabBrand): boolean => {
    const nonEditableKeys: (keyof CollabBrand)[] = [
      'brandName', 'contact', 'product', 'status', 'deliverables',
      'briefContract', 'rate', 'postDate', 'depositPaid',
      'finalPaymentDueDate', 'invoiceSent', 'paymentReceived'
    ];

    return !nonEditableKeys.includes(columnKey);
  };

  const canDeleteColumn = (columnKey: keyof CollabBrand): boolean => {
    // Only allow deletion from 'notes' column onwards or custom columns
    const notesIndex = columns.findIndex(col => col.key === 'notes');
    const currentIndex = columns.findIndex(col => col.key === columnKey);
    return currentIndex >= notesIndex;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="pl-12 pr-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-50/30 to-transparent">
          <h2 className="font-semibold text-gray-900 text-lg">Brand Collaborations</h2>
          {handleAddColumn && (
            <Button
              onClick={handleAddColumn}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
            >
              <Columns className="h-4 w-4" /> Add Column
            </Button>
          )}
        </div>

        <div className="overflow-x-auto">
          <ScrollArea className="h-[500px] overflow-x-auto">
            <div className="min-w-full w-max">
              <Table className="brand-collab-table" style={{ borderSpacing: 0 }}>
                <TableHeader className="bg-gray-50">
                  <TableRow className="border-b-2 border-gray-200">
                    {columns.map((column, index) => (
                      isHeaderEditable(column.key) ? (
                        <EditableColumnHeader
                          key={column.key}
                          title={column.title}
                          onChange={(newTitle) => handleUpdateColumnTitle(index, newTitle)}
                          canDelete={canDeleteColumn(column.key)}
                          onDelete={handleDeleteColumn ? () => handleDeleteColumn(String(column.key)) : undefined}
                          className={cn(
                            column.key === 'notes' ? 'notes-header' : '',
                            index === 0 ? "min-w-[150px] pl-12 pr-4" : "min-w-[150px] px-4"
                          )}
                        />
                      ) : (
                        <TableHead
                          key={column.key}
                          data-key={column.key}
                          className={cn(
                            column.key === 'notes' ? 'notes-header' : '',
                            column.key === 'depositPaid' ? 'deposit-paid' : '',
                            index === 0 ? "min-w-[150px] pl-12 pr-4" : "min-w-[150px] px-4"
                          )}
                        >
                          {column.title}
                        </TableHead>
                      )
                    ))}
                    <TableHead className="w-[60px] text-right pr-6 align-middle"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow
                      key={brand.id}
                      className="group hover:bg-indigo-50/30 transition-colors duration-200 border-b border-gray-100"
                    >
                      {columns.map((column, index) => (
                        <TableCell
                          key={`${brand.id}-${column.key}`}
                          className={cn(
                            index === 0 ? "min-w-[150px] text-left pl-12 pr-4" : "min-w-[150px] text-left px-4"
                          )}
                          data-key={column.key}
                        >
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
                              value={brand[column.key]} 
                              onChange={(value) => handleUpdateBrand(brand.id, column.key, value)}
                            />
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="w-[60px] text-right pr-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                          aria-label={`Delete ${brand.brandName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {brands.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="space-y-1">
                            <p className="text-gray-700 font-medium">No partnerships yet</p>
                            <p className="text-sm text-gray-500">Click "Add Brand" to track your first collaboration</p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default BrandsCollabTable;