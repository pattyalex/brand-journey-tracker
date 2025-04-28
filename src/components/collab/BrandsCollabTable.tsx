
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
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
}

const BrandsCollabTable = ({
  brands,
  columns,
  handleUpdateBrand,
  handleAddBrand,
  handleDeleteBrand,
  handleUpdateColumnTitle,
}: BrandsCollabTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-medium">Brand Collaborations</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button onClick={handleAddBrand} size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Brand
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[400px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <EditableColumnHeader
                  key={column.key}
                  title={column.title}
                  onChange={(newTitle) => handleUpdateColumnTitle(index, newTitle)}
                />
              ))}
              <th className="w-[50px]">Actions</th>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
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
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteBrand(brand.id)} 
                    className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
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
  );
};

export default BrandsCollabTable;
