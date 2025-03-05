
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const Documents = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Documents</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center gap-3">
                <FileText className="h-6 w-6 text-primary" />
                <CardTitle className="text-lg">Document {i + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Sample document content description. Click to view details.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Documents;
