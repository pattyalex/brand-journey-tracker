
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import EditableTableCell from "@/components/collab/EditableTableCell";
import StatusBadge from "@/components/collab/StatusBadge";
import { CollabBrand } from "@/types/collab";

interface BrandsCollabTableProps {
  brands: CollabBrand[];
  handleUpdateBrand: (id: string, field: keyof CollabBrand, value: string) => void;
  handleAddBrand: () => void;
  handleDeleteBrand: (id: string) => void;
}

const BrandsCollabTable = ({
  brands,
  handleUpdateBrand,
  handleAddBrand,
  handleDeleteBrand,
}: BrandsCollabTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-medium">Brand Collaborations</h2>
        <Button onClick={handleAddBrand} size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </div>
      <ScrollArea className="h-[400px] w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Last Follow-Up</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deliverables</TableHead>
              <TableHead>Rate</TableHead>
              <TableHead>Next Reminder</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell>
                  <EditableTableCell 
                    value={brand.brandName} 
                    onChange={(value) => handleUpdateBrand(brand.id, 'brandName', value)} 
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell 
                    value={brand.contact} 
                    onChange={(value) => handleUpdateBrand(brand.id, 'contact', value)} 
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell 
                    value={brand.lastFollowUp} 
                    onChange={(value) => handleUpdateBrand(brand.id, 'lastFollowUp', value)} 
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge 
                    status={brand.status} 
                    onChange={(value) => handleUpdateBrand(brand.id, 'status', value)} 
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell 
                    value={brand.deliverables} 
                    onChange={(value) => handleUpdateBrand(brand.id, 'deliverables', value)} 
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell 
                    value={brand.rate} 
                    onChange={(value) => handleUpdateBrand(brand.id, 'rate', value)} 
                  />
                </TableCell>
                <TableCell>
                  <EditableTableCell 
                    value={brand.nextReminder} 
                    onChange={(value) => handleUpdateBrand(brand.id, 'nextReminder', value)} 
                  />
                </TableCell>
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
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
