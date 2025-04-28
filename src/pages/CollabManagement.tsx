
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2 } from "lucide-react";
import CampaignWorkspace from "@/components/collab/CampaignWorkspace";
import EditableTableCell from "@/components/collab/EditableTableCell";
import StatusBadge from "@/components/collab/StatusBadge";
import { useToast } from "@/hooks/use-toast";

interface CollabBrand {
  id: string;
  brandName: string;
  contact: string;
  lastFollowUp: string;
  status: string;
  deliverables: string;
  rate: string;
  nextReminder: string;
}

const CollabManagement = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [brands, setBrands] = useState<CollabBrand[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  
  useEffect(() => {
    // Load initial data or from localStorage
    const savedBrands = localStorage.getItem('collabBrands');
    if (savedBrands) {
      setBrands(JSON.parse(savedBrands));
    } else {
      // Set default brand if no saved data
      setBrands([
        {
          id: '1',
          brandName: 'Brand X',
          contact: 'contact@brandx.com',
          lastFollowUp: 'April 20, 2025',
          status: 'Negotiation',
          deliverables: '3 Posts + 1 Story',
          rate: '$2,500',
          nextReminder: 'April 25, 2025',
        }
      ]);
    }
  }, []);
  
  // Save brands to localStorage when they change
  useEffect(() => {
    localStorage.setItem('collabBrands', JSON.stringify(brands));
  }, [brands]);

  const handleUpdateBrand = (id: string, field: keyof CollabBrand, value: string) => {
    setBrands(brands.map(brand => 
      brand.id === id ? { ...brand, [field]: value } : brand
    ));
    
    toast({
      title: "Updated",
      description: "Brand information has been updated",
    });
  };
  
  const handleAddBrand = () => {
    const newBrand: CollabBrand = {
      id: Date.now().toString(),
      brandName: 'New Brand',
      contact: 'email@example.com',
      lastFollowUp: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      status: 'Sent',
      deliverables: 'TBD',
      rate: '$0',
      nextReminder: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
    
    setBrands([...brands, newBrand]);
    
    toast({
      title: "Brand added",
      description: "New brand has been added to the table",
    });
  };
  
  const handleDeleteBrand = (id: string) => {
    setBrands(brands.filter(brand => brand.id !== id));
    
    toast({
      title: "Brand deleted",
      description: "Brand has been removed from the table",
      variant: "destructive",
    });
  };

  const filteredBrands = brands.filter(brand => {
    if (statusFilter && statusFilter !== 'all' && brand.status !== statusFilter) return false;
    // We would implement payment status filter here if we had that field
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Collab & Brand Management</h1>
        
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Sent">Sent</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Accepted">Accepted</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

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
              {filteredBrands.map((brand) => (
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
              {filteredBrands.length === 0 && (
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

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Campaign Workspace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedCampaign(selectedCampaign === "Brand X Spring Launch" ? null : "Brand X Spring Launch")}
          >
            <AspectRatio ratio={16 / 9}>
              <img 
                src="/placeholder.svg" 
                alt="Campaign Thumbnail"
                className="object-cover w-full h-full"
              />
            </AspectRatio>
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Brand X Spring Launch</CardTitle>
              <p className="text-sm text-muted-foreground">Post Dates: May 1 - May 10</p>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                variant={selectedCampaign === "Brand X Spring Launch" ? "default" : "outline"}
              >
                {selectedCampaign === "Brand X Spring Launch" ? "Hide Workspace" : "View Workspace"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {selectedCampaign && (
        <CampaignWorkspace campaignName={selectedCampaign} />
      )}
    </div>
  );
};

export default CollabManagement;
