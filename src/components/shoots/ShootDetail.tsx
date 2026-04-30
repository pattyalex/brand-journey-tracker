import { useState } from 'react';
import { motion } from 'framer-motion';

import ShootHeader from './ShootHeader';
import LocationsBlock from './LocationsBlock';
import RouteMap from './RouteMap';
import RouteOptimizer from './RouteOptimizer';
import AIPlannerTimeline from './AIPlannerTimeline';
import OutfitsGearNotes from './OutfitsGearNotes';
import ShootPostsList from './ShootPostsList';
import AddPostsPanel from './AddPostsPanel';

import { Shoot, ShootLocation, AIPlan } from '@/types/shoots';
import { Post } from '@/types/posts';

interface ShootDetailProps {
  shoot: Shoot;
  posts: Post[];
  allPosts: Post[];
  onUpdate: (updates: Partial<Shoot>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBack: () => void;
  onAssignPosts: (postIds: string[]) => void;
  onRemovePost: (postId: string) => void;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
  getUnassignedPosts: () => Post[];
}

export default function ShootDetail({
  shoot,
  posts,
  allPosts,
  onUpdate,
  onDuplicate,
  onDelete,
  onBack,
  onAssignPosts,
  onRemovePost,
  onUpdatePost,
  getUnassignedPosts,
}: ShootDetailProps) {
  const [showAddPanel, setShowAddPanel] = useState(false);

  // --- Location handlers ---

  const handleAddLocation = (location: ShootLocation) => {
    onUpdate({ locations: [...(shoot.locations || []), location] });
  };

  const handleRemoveLocation = (locationId: string) => {
    onUpdate({
      locations: (shoot.locations || []).filter((loc) => loc.id !== locationId),
    });
  };

  const handleReorderLocations = (reordered: ShootLocation[]) => {
    onUpdate({ locations: reordered });
  };

  // --- Route handler ---

  const handleOptimizeRoute = (order: string[]) => {
    onUpdate({ optimized_route_order: order });
  };

  // --- AI Plan handler ---

  const handleUpdatePlan = (plan: AIPlan) => {
    onUpdate({ ai_plan: plan });
  };

  // --- Outfits / Gear / Notes handlers ---

  const handleUpdateOutfits = (outfits: string[]) => {
    onUpdate({ outfits });
  };

  const handleUpdateGear = (gear: string[]) => {
    onUpdate({ gear });
  };

  const handleUpdateNotes = (notes: string) => {
    onUpdate({ notes });
  };

  // --- Post handlers ---

  const handleRemovePost = (postId: string) => {
    onRemovePost(postId);
  };

  const handleMarkAsShot = (postId: string) => {
    onUpdatePost(postId, { status: 'Shot' });
  };

  const handleClickPost = (postId: string) => {
    console.log('Post clicked:', postId);
  };

  const handleAddPosts = (postIds: string[]) => {
    onAssignPosts(postIds);
    setShowAddPanel(false);
  };

  // --- Archive handler ---

  const handleArchive = () => {
    onUpdate({ status: 'Archived' });
  };

  return (
    <motion.div
      className="h-full overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8 lg:px-10 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,380px] gap-8">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <ShootHeader
              shoot={shoot}
              onUpdate={onUpdate}
              onDuplicate={onDuplicate}
              onArchive={handleArchive}
              onDelete={onDelete}
              onBack={onBack}
            />

            <LocationsBlock
              locations={shoot.locations || []}
              onAddLocation={handleAddLocation}
              onRemoveLocation={handleRemoveLocation}
              onReorderLocations={handleReorderLocations}
            />

            <RouteMap
              locations={shoot.locations || []}
              optimizedOrder={shoot.optimized_route_order || []}
            />

            <RouteOptimizer
              locations={shoot.locations || []}
              onOptimize={handleOptimizeRoute}
            />

            <AIPlannerTimeline
              shoot={shoot}
              posts={posts}
              onUpdatePlan={handleUpdatePlan}
            />

            <OutfitsGearNotes
              outfits={shoot.outfits || []}
              gear={shoot.gear || []}
              notes={shoot.notes || ''}
              onUpdateOutfits={handleUpdateOutfits}
              onUpdateGear={handleUpdateGear}
              onUpdateNotes={handleUpdateNotes}
            />
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 md:sticky md:top-6">
            <ShootPostsList
              posts={posts}
              onRemovePost={handleRemovePost}
              onMarkAsShot={handleMarkAsShot}
              onClickPost={(post: Post) => handleClickPost(post.id)}
              onAddPosts={() => setShowAddPanel(true)}
            />

            <AddPostsPanel
              open={showAddPanel}
              onClose={() => setShowAddPanel(false)}
              unassignedPosts={getUnassignedPosts()}
              onAddPosts={handleAddPosts}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
