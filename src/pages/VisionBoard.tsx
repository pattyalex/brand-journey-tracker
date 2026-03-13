
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Image as ImageIcon, Image } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserVisionBoardItems,
  createVisionBoardItem,
  deleteVisionBoardItem,
  type VisionBoardItem
} from "@/services/visionBoardService";

interface VisionItem {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
}

const VisionBoard = () => {
  const { user } = useAuth();
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVisionItems();
  }, [user]);

  const loadVisionItems = async () => {
    if (!user?.id) {
      setVisionItems([]);
      setIsLoading(false);
      return;
    }

    try {
      const data = await getUserVisionBoardItems(user.id);
      const formattedItems = data.map(item => ({
        id: item.id,
        title: item.title,
        imageUrl: item.image_url || "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image",
        description: item.description || ""
      }));
      setVisionItems(formattedItems);
    } catch (error) {
      console.error("Error loading vision items:", error);
      toast.error("Failed to load vision board");
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder function for adding a new vision item
  // In a real implementation, this would open a dialog with form fields
  const handleAddItem = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to add vision items");
      return;
    }

    try {
      const newItem = await createVisionBoardItem(user.id, {
        title: "New Vision",
        image_url: "https://placehold.co/600x400/e2e8f0/64748b?text=Add+Image",
        description: "Describe your vision here",
        display_order: visionItems.length
      });

      setVisionItems([...visionItems, {
        id: newItem.id,
        title: newItem.title,
        imageUrl: newItem.image_url || "",
        description: newItem.description || ""
      }]);
      toast.success("New vision item added!");
    } catch (error) {
      console.error("Error adding vision item:", error);
      toast.error("Failed to add vision item");
    }
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

        {isLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading vision board...</p>
          </div>
        ) : visionItems.length === 0 ? (
          <EmptyState
            icon={Image}
            title="Your vision board is empty"
            description="Add images, quotes, and goals to your vision board to keep your dreams front and center."
            actionLabel="Add Item"
            onAction={handleAddItem}
          />
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
