
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, File } from "lucide-react";

interface BriefContractCellProps {
  value: string;
  onChange: (value: string) => void;
}

interface UploadedFile {
  name: string;
  url: string; // This would be a data URL in our case
}

const BriefContractCell = ({ value, onChange }: BriefContractCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  // Parse the stored JSON string to get uploaded files
  const files: UploadedFile[] = value && value !== "None" ? JSON.parse(value) : [];
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || []);
    if (uploadedFiles.length === 0) return;
    
    // Process each file and create data URLs
    const newFiles: UploadedFile[] = [];
    const filePromises = uploadedFiles.map(file => {
      return new Promise<UploadedFile>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          resolve({
            name: file.name,
            url
          });
        };
        reader.readAsDataURL(file);
      });
    });
    
    // When all files are processed
    Promise.all(filePromises).then(processedFiles => {
      // Combine with existing files
      const updatedFiles = [...files, ...processedFiles];
      // Store as JSON string
      onChange(JSON.stringify(updatedFiles));
      
      toast({
        description: `${processedFiles.length} file(s) uploaded successfully`,
      });
    });
  };
  
  const handleRemoveFile = (index: number) => {
    const updatedFiles = [...files];
    updatedFiles.splice(index, 1);
    
    if (updatedFiles.length === 0) {
      onChange("None");
    } else {
      onChange(JSON.stringify(updatedFiles));
    }
    
    toast({
      description: "File removed",
      variant: "destructive",
    });
  };
  
  const handleViewFile = (file: UploadedFile) => {
    // Create a temporary anchor to open the data URL
    const a = document.createElement('a');
    a.href = file.url;
    a.target = '_blank';
    a.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-full justify-start text-left font-normal"
        >
          <div className="flex items-center">
            <FileText size={16} className="text-blue-500 mr-2" />
            <span className={`truncate ${files.length === 0 ? 'text-gray-400' : ''}`}>
              {files.length === 1 ? files[0].name : files.length > 1 ? `${files.length} file(s)` : "None"}
            </span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Brief & Contract Documents</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* File upload section */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4">
            <Input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              multiple
              className="cursor-pointer"
            />
          </div>
          
          {/* Uploaded files list */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Uploaded Files:</h4>
              <ScrollArea className="h-[200px] rounded-md border">
                <div className="p-4">
                  <ul className="space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{file.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewFile(file)}
                            className="h-7 px-2 text-xs"
                          >
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            className="h-7 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-start">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BriefContractCell;
