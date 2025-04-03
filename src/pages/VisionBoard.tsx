
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface VisionItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}

const VisionBoard = () => {
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  
  useEffect(() => {
    const savedItems = localStorage.getItem("visionBoardItems");
    if (savedItems) {
      try {
        setVisionItems(JSON.parse(savedItems));
      } catch (error) {
        console.error("Error parsing saved vision items:", error);
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem("visionBoardItems", JSON.stringify(visionItems));
  }, [visionItems]);

  // Placeholder function for adding a new vision item
  // In a real implementation, this would open a dialog with form fields
  const handleAddItem = () => {
    const newItem: VisionItem = {
      id: Date.now().toString(),
      title: "New Vision",
      imageUrl: "https://placehold.co/600x400/e2e8f0/64748b?text=Add+Image",
      description: "Describe your vision here"
    };
    
    setVisionItems([...visionItems, newItem]);
    toast.success("New vision item added!");
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vision Board</h1>
            <p className="text-muted-foreground mt-1">
              Visualize your goals and aspirations
            </p>
          </div>
          
          <Button 
            onClick={handleAddItem}
            className="bg-[#8B6B4E] hover:bg-[#6D5540]"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Vision
          </Button>
        </div>

        {visionItems.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">Your Vision Board is Empty</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Add images and notes that represent your goals, dreams, and aspirations.
              </p>
              <Button 
                onClick={handleAddItem}
                className="bg-[#8B6B4E] hover:bg-[#6D5540]"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Vision
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visionItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video relative">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default VisionBoard;
