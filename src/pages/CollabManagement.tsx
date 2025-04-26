
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ScrollArea } from "@/components/ui/scroll-area";

const CollabManagement = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-semibold">Collab & Brand Management</h1>
        
        <div className="flex gap-4">
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow-sm border">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Brand X</TableCell>
                <TableCell>contact@brandx.com</TableCell>
                <TableCell>April 20, 2025</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800">
                    Negotiation
                  </span>
                </TableCell>
                <TableCell>3 Posts + 1 Story</TableCell>
                <TableCell>$2,500</TableCell>
                <TableCell>April 25, 2025</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Campaign Workspace</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
              <Button className="w-full" variant="outline">View Workspace</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Brand X Spring Launch - Workspace</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Brand Brief", description: "PDF/Notes upload area" },
            { title: "Moodboard", description: "Image uploads here" },
            { title: "Content Drafts", description: "Upload videos, captions, thumbnails" },
            { title: "Comments & Feedback", description: "Notes and approvals area" },
            { title: "Analytics Upload", description: "Upload screenshots + auto-generate report" }
          ].map((item, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CollabManagement;
