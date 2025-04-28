
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { TableColumn } from "@/types/collab";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ColumnManagerProps {
  columns: TableColumn[];
  onAddColumn: (columnName: string) => void;
  onDeleteColumn: (columnId: string) => void;
}

const ColumnManager = ({
  columns,
  onAddColumn,
  onDeleteColumn,
}: ColumnManagerProps) => {
  const [newColumnName, setNewColumnName] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColumnName.trim()) {
      onAddColumn(newColumnName.trim());
      setNewColumnName("");
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Plus className="h-4 w-4" /> Manage Columns
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Table Columns</DialogTitle>
          <DialogDescription>
            Add or remove columns from your collaboration table.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-2 mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Add New Column</label>
              <Input
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name"
              />
            </div>
            <Button type="submit" disabled={!newColumnName.trim()}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </form>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium mb-1">Current Columns</h3>
            <div className="max-h-[200px] overflow-auto border rounded-md">
              {columns.map((column) => (
                <div 
                  key={column.id} 
                  className="flex justify-between items-center p-2 hover:bg-gray-50 border-b last:border-b-0"
                >
                  <span>{column.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteColumn(column.id)}
                    className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnManager;
