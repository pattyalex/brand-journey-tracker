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
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-medium">Brand Collaborations</h2>
          <div className="flex flex-col gap-2 md:flex-row md:gap-2"> {/* Changed to flex-col for mobile */}
            <Button onClick={handleAddBrand} size="sm" className="flex items-center gap-1">
              <Plus className="h-4 w-4" /> Add Brand
            </Button>
            {handleAddColumn && (
              <Button 
                onClick={handleAddColumn} 
                size="sm" 
                variant="outline"
                className="flex items-center gap-1 text-gray-500 border-gray-200 hover:bg-gray-50"
              >
                <Columns className="h-4 w-4" /> Add Column
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <ScrollArea className="h-[400px] overflow-x-auto"> {/* Added overflow-x-auto */}
            <div className="min-w-full w-max">
              <Table className="brand-collab-table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1.5 sticky left-0 z-10 bg-white p-0"></TableHead>
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
                            "min-w-[120px]" // Set minimum width for all columns
                          )}
                        />
                      ) : (
                        <TableHead 
                          key={column.key}
                          data-key={column.key}
                          className={cn(
                            column.key === 'notes' ? 'notes-header' : '',
                            column.key === 'depositPaid' ? 'deposit-paid' : '',
                            "min-w-[120px]" // Set minimum width for all columns
                          )}
                        >
                          {column.title}
                        </TableHead>
                      )
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.map((brand) => (
                    <TableRow 
                      key={brand.id} 
                      className="group hover:bg-gray-50 transition-colors duration-200"
                    >
                      <TableCell className="w-1.5 p-0 sticky left-0 z-10 bg-white">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteBrand(brand.id)} 
                          className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          aria-label={`Delete ${brand.brandName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>

                      {columns.map((column) => (
                        <TableCell 
                          key={`${brand.id}-${column.key}`} 
                          className={cn(
                            "min-w-[120px] px-1 text-left" // Reduced padding from px-3 to px-1
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
                    </TableRow>
                  ))}
                  {brands.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="text-center py-8 text-gray-500">
                        No brands found. Add your first brand to get started.
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