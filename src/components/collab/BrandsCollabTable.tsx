
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
}

const BrandsCollabTable = ({
  brands,
  columns,
  handleUpdateBrand,
  handleAddBrand,
  handleDeleteBrand,
  handleUpdateColumnTitle,
  handleAddColumn,
}: BrandsCollabTableProps) => {
  // Function to determine if a column header should be editable
  const isHeaderEditable = (columnKey: string): boolean => {
    const nonEditableKeys = [
      'brandName', 'contact', 'product', 'status', 'deliverables',
      'briefContract', 'rate', 'postDate', 'depositPaid',
      'finalPaymentDueDate', 'invoiceSent', 'paymentReceived'
    ];
    
    return !nonEditableKeys.includes(columnKey);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-medium">Brand Collaborations</h2>
          <div className="flex gap-2">
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
          <ScrollArea className="h-[400px]">
            <div className="min-w-full w-max">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 sticky left-0 z-10 bg-white"></TableHead>
                    {columns.map((column, index) => (
                      isHeaderEditable(column.key) ? (
                        <EditableColumnHeader
                          key={column.key}
                          title={column.title}
                          onChange={(newTitle) => handleUpdateColumnTitle(index, newTitle)}
                          className={cn(
                            column.key === 'notes' ? 'notes-header' : '',
                            column.key === 'depositPaid' ? 'deposit-paid' : ''
                          )}
                        />
                      ) : (
                        <TableHead 
                          key={column.key}
                          className={cn(
                            column.key === 'notes' ? 'notes-header' : '',
                            column.key === 'depositPaid' ? 'deposit-paid' : ''
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
                      <TableCell className="w-12 p-0 text-center sticky left-0 z-10 bg-white">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteBrand(brand.id)} 
                          className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          aria-label={`Delete ${brand.brandName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      
                      {columns.map((column) => (
                        <TableCell 
                          key={`${brand.id}-${column.key}`} 
                          className={cn(
                            "min-w-[150px]",
                            column.key === 'depositPaid' ? 'deposit-paid' : ''
                          )}
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
