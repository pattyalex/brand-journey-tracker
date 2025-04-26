
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChartBar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsFile {
  name: string;
  type: string;
}

const AnalyticsSection = () => {
  const [files, setFiles] = useState<AnalyticsFile[]>([]);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []).map(file => ({
      name: file.name,
      type: file.type
    }));
    
    setFiles(prev => [...prev, ...uploadedFiles]);
    toast({
      description: "Analytics files uploaded successfully",
    });
  };

  const generateReport = () => {
    toast({
      title: "Generating Report",
      description: "Your analytics report is being generated...",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ChartBar className="h-5 w-5" />
          Analytics Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
          <Input
            type="file"
            accept="image/*,.pdf,.xlsx,.csv"
            multiple
            onChange={handleFileUpload}
            className="cursor-pointer"
          />
        </div>
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Files:</h4>
            <ul className="text-sm space-y-1">
              {files.map((file, index) => (
                <li key={index} className="text-muted-foreground">
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Button onClick={generateReport} className="w-full">
          Generate Report
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalyticsSection;
