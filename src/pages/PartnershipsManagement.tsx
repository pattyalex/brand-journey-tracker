import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, Save, Handshake } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Partnership {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  status: "Active" | "Pending" | "Completed" | "Inactive";
  description: string;
  date: string;
}

const PartnershipsManagement = () => {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPartner, setNewPartner] = useState<Omit<Partnership, 'id' | 'date'>>({
    name: "",
    contactPerson: "",
    email: "",
    status: "Pending",
    description: ""
  });

  useEffect(() => {
    const savedPartnerships = localStorage.getItem("partnerships");
    if (savedPartnerships) {
      try {
        setPartnerships(JSON.parse(savedPartnerships));
      } catch (error) {
        console.error("Error parsing saved partnerships:", error);
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem("partnerships", JSON.stringify(partnerships));
  }, [partnerships]);

  const handleAddPartnership = () => {
    if (!newPartner.name.trim()) {
      toast.error("Please enter a partner name");
      return;
    }
    
    const newPartnership: Partnership = {
      id: Date.now().toString(),
      name: newPartner.name,
      contactPerson: newPartner.contactPerson,
      email: newPartner.email,
      status: newPartner.status,
      description: newPartner.description,
      date: new Date().toISOString(),
    };
    
    setPartnerships([...partnerships, newPartnership]);
    setNewPartner({
      name: "",
      contactPerson: "",
      email: "",
      status: "Pending",
      description: ""
    });
    setIsCreating(false);
    toast.success("Partnership added successfully");
  };

  const handleDeletePartnership = (id: string) => {
    setPartnerships(partnerships.filter(partner => partner.id !== id));
    toast.success("Partnership deleted");
  };

  const handleUpdatePartnership = (id: string, updates: Partial<Partnership>) => {
    setPartnerships(
      partnerships.map(partner => 
        partner.id === id ? { ...partner, ...updates } : partner
      )
    );
    setEditingId(null);
    toast.success("Partnership updated");
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partnerships Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage your collaborations, brand deals, and business relationships
            </p>
          </div>
          
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            disabled={isCreating}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Partnership
          </Button>
        </div>

        {isCreating && (
          <Card>
            <CardHeader>
              <CardTitle>New Partnership</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Partner Name</label>
                <Input
                  id="name"
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({...newPartner, name: e.target.value})}
                  placeholder="Enter partner name or company"
                />
              </div>
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium mb-1">Contact Person</label>
                <Input
                  id="contactPerson"
                  value={newPartner.contactPerson}
                  onChange={(e) => setNewPartner({...newPartner, contactPerson: e.target.value})}
                  placeholder="Name of contact person"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={newPartner.email}
                  onChange={(e) => setNewPartner({...newPartner, email: e.target.value})}
                  placeholder="Contact email"
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
                <select
                  id="status"
                  value={newPartner.status}
                  onChange={(e) => setNewPartner({...newPartner, status: e.target.value as Partnership["status"]})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  id="description"
                  value={newPartner.description}
                  onChange={(e) => setNewPartner({...newPartner, description: e.target.value})}
                  placeholder="Details about partnership, goals, terms, etc."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPartnership} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {partnerships.length === 0 && !isCreating ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Handshake className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">No Partnerships Yet</h2>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Add partnerships to track your collaborations, brand deals, and business relationships.
              </p>
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Partnership
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {partnerships.map((partner) => (
              <Card key={partner.id}>
                <CardHeader>
                  {editingId === partner.id ? (
                    <Input
                      value={partner.name}
                      onChange={(e) => 
                        handleUpdatePartnership(partner.id, { name: e.target.value })
                      }
                      className="font-bold text-lg"
                    />
                  ) : (
                    <CardTitle className="flex justify-between items-center">
                      <span>{partner.name}</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingId(partner.id)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletePartnership(partner.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardTitle>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      partner.status === "Active" ? "bg-green-100 text-green-800" :
                      partner.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                      partner.status === "Completed" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {partner.status}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Added: {new Date(partner.date).toLocaleDateString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  {editingId === partner.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Contact Person</label>
                        <Input
                          value={partner.contactPerson}
                          onChange={(e) => 
                            handleUpdatePartnership(partner.id, { contactPerson: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <Input
                          type="email"
                          value={partner.email}
                          onChange={(e) => 
                            handleUpdatePartnership(partner.id, { email: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                          value={partner.status}
                          onChange={(e) => 
                            handleUpdatePartnership(partner.id, { status: e.target.value as Partnership["status"] })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <Textarea
                          value={partner.description}
                          onChange={(e) => 
                            handleUpdatePartnership(partner.id, { description: e.target.value })
                          }
                          className="min-h-[100px]"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          onClick={() => setEditingId(null)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {partner.contactPerson && (
                        <div className="mb-2">
                          <span className="font-medium">Contact:</span> {partner.contactPerson}
                        </div>
                      )}
                      {partner.email && (
                        <div className="mb-4">
                          <span className="font-medium">Email:</span> {partner.email}
                        </div>
                      )}
                      {partner.description && (
                        <div className="mt-2 whitespace-pre-wrap">
                          <span className="font-medium">Details:</span>
                          <p className="mt-1">{partner.description}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PartnershipsManagement;
