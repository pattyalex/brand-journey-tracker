
import Layout from "@/components/Layout";
import { useContentPlanning } from "@/hooks/useContentPlanning";
import SearchBar from "@/components/content/planning/SearchBar";
import StatusFilter from "@/components/content/planning/StatusFilter";
import ContentTable from "@/components/content/planning/ContentTable";

const ContentPlanning = () => {
  const {
    filteredIdeas,
    searchTerm,
    setSearchTerm,
    editingItemId,
    setEditingItemId,
    statusFilter,
    setStatusFilter,
    handleScheduleItem,
    handleStatusChange,
    handleDelete
  } = useContentPlanning();

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6 fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Content Planning</h1>
            <p className="text-muted-foreground">Schedule and manage your finalized content ideas</p>
          </div>
          
          <div className="flex items-center gap-2">
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
            />
            <StatusFilter 
              statusFilter={statusFilter} 
              setStatusFilter={setStatusFilter} 
            />
          </div>
        </div>
        
        <ContentTable 
          filteredIdeas={filteredIdeas}
          editingItemId={editingItemId}
          setEditingItemId={setEditingItemId}
          handleScheduleItem={handleScheduleItem}
          handleStatusChange={handleStatusChange}
          handleDelete={handleDelete}
        />
      </div>
    </Layout>
  );
};

export default ContentPlanning;
