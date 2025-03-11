
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Plus, X, Edit2, Check, Instagram, Youtube, Twitter, Facebook, Twitch, TikTok, Globe } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// Platform type definition
interface Platform {
  id: string;
  name: string;
  icon: string;
}

// Content item type definition
interface ContentItem {
  id: string;
  text: string;
  platformId: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
}

export const ContentSchedulePlanner = () => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<Platform[]>([
    { id: '1', name: 'Instagram', icon: 'instagram' },
    { id: '2', name: 'YouTube', icon: 'youtube' },
    { id: '3', name: 'Twitter', icon: 'twitter' }
  ]);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isAddingPlatform, setIsAddingPlatform] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState("");
  const [newPlatformIcon, setNewPlatformIcon] = useState("instagram");
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [addingContentDay, setAddingContentDay] = useState<string | null>(null);
  const [addingContentPlatform, setAddingContentPlatform] = useState<string | null>(null);
  const [newContentText, setNewContentText] = useState("");

  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  
  const availableIcons = [
    { name: 'Instagram', value: 'instagram' },
    { name: 'YouTube', value: 'youtube' },
    { name: 'Twitter', value: 'twitter' },
    { name: 'Facebook', value: 'facebook' },
    { name: 'Twitch', value: 'twitch' },
    { name: 'TikTok', value: 'tiktok' },
    { name: 'Other', value: 'globe' }
  ];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'instagram': return <Instagram className="h-5 w-5" />;
      case 'youtube': return <Youtube className="h-5 w-5" />;
      case 'twitter': return <Twitter className="h-5 w-5" />;
      case 'facebook': return <Facebook className="h-5 w-5" />;
      case 'twitch': return <Twitch className="h-5 w-5" />;
      case 'tiktok': return <TikTok className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  const handleAddPlatform = () => {
    if (newPlatformName.trim() === "") {
      toast({
        title: "Platform name required",
        description: "Please enter a name for the platform",
        variant: "destructive"
      });
      return;
    }

    const newPlatform: Platform = {
      id: Date.now().toString(),
      name: newPlatformName,
      icon: newPlatformIcon
    };

    setPlatforms([...platforms, newPlatform]);
    setNewPlatformName("");
    setNewPlatformIcon("instagram");
    setIsAddingPlatform(false);
    toast({
      title: "Platform added",
      description: `${newPlatformName} has been added to your platforms`
    });
  };

  const handleUpdatePlatform = () => {
    if (!editingPlatform) return;
    
    if (editingPlatform.name.trim() === "") {
      toast({
        title: "Platform name required",
        description: "Please enter a name for the platform",
        variant: "destructive"
      });
      return;
    }

    setPlatforms(platforms.map(p => 
      p.id === editingPlatform.id ? editingPlatform : p
    ));
    
    setEditingPlatform(null);
    toast({
      title: "Platform updated",
      description: `Platform has been updated`
    });
  };

  const handleDeletePlatform = (id: string) => {
    setPlatforms(platforms.filter(p => p.id !== id));
    setContentItems(contentItems.filter(item => item.platformId !== id));
    toast({
      title: "Platform removed",
      description: "Platform and its content have been removed"
    });
  };

  const handleAddContent = () => {
    if (!addingContentDay || !addingContentPlatform) return;
    
    if (newContentText.trim() === "") {
      toast({
        title: "Content required",
        description: "Please enter content for this schedule item",
        variant: "destructive"
      });
      return;
    }

    const newContent: ContentItem = {
      id: Date.now().toString(),
      text: newContentText,
      platformId: addingContentPlatform,
      day: addingContentDay as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
    };

    setContentItems([...contentItems, newContent]);
    setNewContentText("");
    setAddingContentDay(null);
    setAddingContentPlatform(null);
    toast({
      title: "Content scheduled",
      description: `Content has been scheduled for ${addingContentDay}`
    });
  };

  const handleDeleteContent = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
    toast({
      title: "Content removed",
      description: "Content has been removed from schedule"
    });
  };

  const getContentForDayAndPlatform = (day: string, platformId: string) => {
    return contentItems.filter(
      item => item.day === day && item.platformId === platformId
    );
  };

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0">
        <div className="flex items-center justify-between">
          <CardTitle>Content Creation Schedule</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingPlatform(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Platform
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        {/* Platform adding/editing UI */}
        {isAddingPlatform && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Add New Platform</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsAddingPlatform(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    {renderIcon(newPlatformIcon)}
                    <span>Select Icon</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {availableIcons.map(icon => (
                      <Button
                        key={icon.value}
                        variant="ghost"
                        size="sm"
                        className={`flex items-center justify-center p-2 ${newPlatformIcon === icon.value ? 'bg-primary/10' : ''}`}
                        onClick={() => setNewPlatformIcon(icon.value)}
                      >
                        {renderIcon(icon.value)}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Input
                placeholder="Platform name"
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                className="h-8"
              />
              <Button size="sm" onClick={handleAddPlatform}>Add</Button>
            </div>
          </div>
        )}

        {editingPlatform && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Edit Platform</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setEditingPlatform(null)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    {renderIcon(editingPlatform.icon)}
                    <span>Change Icon</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {availableIcons.map(icon => (
                      <Button
                        key={icon.value}
                        variant="ghost"
                        size="sm"
                        className={`flex items-center justify-center p-2 ${editingPlatform.icon === icon.value ? 'bg-primary/10' : ''}`}
                        onClick={() => setEditingPlatform({...editingPlatform, icon: icon.value})}
                      >
                        {renderIcon(icon.value)}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
              <Input
                placeholder="Platform name"
                value={editingPlatform.name}
                onChange={(e) => setEditingPlatform({...editingPlatform, name: e.target.value})}
                className="h-8"
              />
              <Button size="sm" onClick={handleUpdatePlatform}>Update</Button>
            </div>
          </div>
        )}

        {/* Add content UI */}
        {addingContentDay && addingContentPlatform && (
          <div className="mb-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">
                Add Content for {platforms.find(p => p.id === addingContentPlatform)?.name} 
                on {addingContentDay.charAt(0).toUpperCase() + addingContentDay.slice(1)}
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setAddingContentDay(null);
                  setAddingContentPlatform(null);
                  setNewContentText("");
                }}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Content description"
                value={newContentText}
                onChange={(e) => setNewContentText(e.target.value)}
                className="h-8"
              />
              <Button size="sm" onClick={handleAddContent}>Add</Button>
            </div>
          </div>
        )}

        {/* Weekly schedule grid */}
        <div className="grid grid-cols-6 gap-1 mt-4">
          {/* Left column - platforms */}
          <div className="col-span-1 bg-gray-50 rounded-l-lg p-2">
            <div className="font-medium text-sm mb-4 pl-2">Platforms</div>
            <ScrollArea className="h-[500px] pr-2">
              <div className="space-y-3">
                {platforms.map(platform => (
                  <div key={platform.id} className="flex flex-col items-center p-2 bg-white rounded-lg shadow-sm group relative">
                    <div className="absolute right-1 top-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => setEditingPlatform(platform)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-red-500" 
                        onClick={() => handleDeletePlatform(platform.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {renderIcon(platform.icon)}
                    </div>
                    <div className="text-xs font-medium mt-1 text-center">{platform.name}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Weekday columns */}
          {weekdays.map(day => (
            <div key={day} className="col-span-1 bg-white border rounded-lg">
              <div className="bg-gray-50 p-2 text-center rounded-t-lg">
                <div className="font-medium text-sm">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </div>
              </div>
              <ScrollArea className="h-[500px]">
                <div className="p-2 space-y-4">
                  {platforms.map(platform => (
                    <div key={`${day}-${platform.id}`} className="relative">
                      <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                        {renderIcon(platform.icon)}
                      </div>
                      <div className="border border-dashed border-gray-200 rounded-lg p-2 min-h-[100px] pl-3">
                        {getContentForDayAndPlatform(day, platform.id).map(content => (
                          <div key={content.id} className="text-sm bg-gray-50 p-2 rounded mb-2 group relative">
                            {content.text}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover:opacity-100"
                              onClick={() => handleDeleteContent(content.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-7 text-xs text-muted-foreground hover:text-primary"
                          onClick={() => {
                            setAddingContentDay(day);
                            setAddingContentPlatform(platform.id);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Add Content
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContentSchedulePlanner;
