
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Columns } from "lucide-react";
import EditableTableCell from "@/components/collab/EditableTableCell";
import StatusBadge from "@/components/collab/StatusBadge";
import { CollabBrand, TableColumn } from "@/types/collab";
import EditableColumnHeader from "./EditableColumnHeader";

interface BrandsCollabTableProps {
  brands: CollabBrand[];
  columns: TableColumn[];
  handleUpdateBrand: (id: string, field: keyof CollabBrand, value: string) => void;
  handleAddBrand: () => void;
  handleDeleteBrand: (id: string) => void;
  handleUpdateColumnTitle: (index: number, newTitle: string) => void;
  handleAddColumn?: () => void; // Add this new prop
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
              <Button onClick={handleAddColumn} size="sm" className="flex items-center gap-1">
                <Columns className="h-4 w-4" /> Add Column
              </Button>
            )}
          </div>
        </div>
        
        {/* Table content */}
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Empty header cell for the trash icon column */}
                <TableHead className="w-12"></TableHead>
                {columns.map((column, index) => (
                  <EditableColumnHeader
                    key={column.key}
                    title={column.title}
                    onChange={(newTitle) => handleUpdateColumnTitle(index, newTitle)}
                  />
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow 
                  key={brand.id} 
                  className="group hover:bg-gray-50 transition-colors duration-200"
                >
                  {/* Trash icon cell as the first cell in the row */}
                  <TableCell className="w-12 p-0 text-center">
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
                  
                  {/* Regular data cells */}
                  {columns.map((column) => (
                    <TableCell key={`${brand.id}-${column.key}`}>
                      {column.key === 'status' ? (
                        <StatusBadge 
                          status={brand[column.key]} 
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
        </ScrollArea>
      </div>
    </div>
  );
};

export default BrandsCollabTable;
