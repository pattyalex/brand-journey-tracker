import { supabase } from '@/lib/supabase';

/**
 * Production Service
 * Manages production kanban cards using Supabase
 */

// TypeScript Interfaces (matching production/types.ts)
export interface StoryboardScene {
  id: string;
  order: number;
  title: string;
  visualNotes: string;
  color: 'amber' | 'teal' | 'rose' | 'violet' | 'sky' | 'lime' | 'fuchsia' | 'cyan';
  highlightStart: number;
  highlightEnd: number;
  selectedShotTemplateId?: string;
  scriptExcerpt?: string;
}

export type EditingStatus = 'to-start-editing' | 'needs-more-editing' | 'ready-to-schedule';
export type SchedulingStatus = 'to-schedule' | 'scheduled';
export type CardStatus = 'to-start' | 'needs-work' | 'ready' | null;
export type CardAddedFrom = 'calendar' | 'quick-idea' | 'ai-generated' | 'bank-of-ideas' | 'repurposed' | 'idea-expander';
export type ScheduledColor = 'indigo' | 'rose' | 'amber' | 'emerald' | 'sky' | 'violet' | 'orange' | 'cyan' | 'sage';

export interface EditingChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  isExample?: boolean;
}

export interface EditingChecklist {
  items: EditingChecklistItem[];
  notes: string;
  externalLinks: Array<{ id: string; label: string; url: string }>;
  status: EditingStatus | null;
}

export interface ProductionCard {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  isCompleted?: boolean;
  isNew?: boolean;
  addedFrom?: CardAddedFrom;
  platforms?: string[];
  formats?: string[];
  script?: string;
  hook?: string;
  locationChecked?: boolean;
  locationText?: string;
  outfitChecked?: boolean;
  outfitText?: string;
  propsChecked?: boolean;
  propsText?: string;
  filmingNotes?: string;
  status?: CardStatus;
  isPinned?: boolean;
  storyboard?: StoryboardScene[];
  editingChecklist?: EditingChecklist;
  customVideoFormats?: string[];
  customPhotoFormats?: string[];
  schedulingStatus?: SchedulingStatus | null;
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  scheduledColor?: ScheduledColor;
  fromCalendar?: boolean;
  plannedDate?: string;
  plannedColor?: ScheduledColor;
  plannedStartTime?: string;
  plannedEndTime?: string;
  brainDumpHandledText?: string;
  calendarOnly?: boolean;
  displayOrder: number;
}

// Database row type
interface DbProductionCard {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  column_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  is_new: boolean;
  added_from: string | null;
  platforms: string[];
  formats: string[];
  script: string | null;
  hook: string | null;
  location_checked: boolean;
  location_text: string | null;
  outfit_checked: boolean;
  outfit_text: string | null;
  props_checked: boolean;
  props_text: string | null;
  filming_notes: string | null;
  status: string | null;
  is_pinned: boolean;
  storyboard: StoryboardScene[] | null;
  editing_checklist: EditingChecklist | null;
  custom_video_formats: string[];
  custom_photo_formats: string[];
  scheduling_status: string | null;
  scheduled_date: string | null;
  scheduled_start_time: string | null;
  scheduled_end_time: string | null;
  scheduled_color: string | null;
  planned_date: string | null;
  planned_start_time: string | null;
  planned_end_time: string | null;
  planned_color: string | null;
  from_calendar: boolean;
  brain_dump_handled_text: string | null;
  calendar_only: boolean;
  display_order: number;
}

// =====================================================
// Data Transformation Helpers
// =====================================================

const dbToProductionCard = (db: DbProductionCard): ProductionCard => ({
  id: db.id,
  columnId: db.column_id,
  title: db.title,
  description: db.description || undefined,
  isCompleted: db.is_completed || false,
  isNew: db.is_new || false,
  addedFrom: db.added_from as CardAddedFrom | undefined,
  platforms: db.platforms || [],
  formats: db.formats || [],
  script: db.script || undefined,
  hook: db.hook || undefined,
  locationChecked: db.location_checked || false,
  locationText: db.location_text || undefined,
  outfitChecked: db.outfit_checked || false,
  outfitText: db.outfit_text || undefined,
  propsChecked: db.props_checked || false,
  propsText: db.props_text || undefined,
  filmingNotes: db.filming_notes || undefined,
  status: db.status as CardStatus,
  isPinned: db.is_pinned || false,
  storyboard: db.storyboard || undefined,
  editingChecklist: db.editing_checklist || undefined,
  customVideoFormats: db.custom_video_formats || [],
  customPhotoFormats: db.custom_photo_formats || [],
  schedulingStatus: db.scheduling_status as SchedulingStatus | null,
  scheduledDate: db.scheduled_date || undefined,
  scheduledStartTime: db.scheduled_start_time || undefined,
  scheduledEndTime: db.scheduled_end_time || undefined,
  scheduledColor: db.scheduled_color as ScheduledColor | undefined,
  fromCalendar: db.from_calendar || false,
  plannedDate: db.planned_date || undefined,
  plannedColor: db.planned_color as ScheduledColor | undefined,
  plannedStartTime: db.planned_start_time || undefined,
  plannedEndTime: db.planned_end_time || undefined,
  brainDumpHandledText: db.brain_dump_handled_text || undefined,
  calendarOnly: db.calendar_only || false,
  displayOrder: db.display_order || 0,
});

const productionCardToDb = (userId: string, card: Omit<ProductionCard, 'id'>) => ({
  user_id: userId,
  column_id: card.columnId,
  title: card.title,
  description: card.description || null,
  is_completed: card.isCompleted || false,
  is_new: card.isNew || false,
  added_from: card.addedFrom || null,
  platforms: card.platforms || [],
  formats: card.formats || [],
  script: card.script || null,
  hook: card.hook || null,
  location_checked: card.locationChecked || false,
  location_text: card.locationText || null,
  outfit_checked: card.outfitChecked || false,
  outfit_text: card.outfitText || null,
  props_checked: card.propsChecked || false,
  props_text: card.propsText || null,
  filming_notes: card.filmingNotes || null,
  status: card.status || null,
  is_pinned: card.isPinned || false,
  storyboard: card.storyboard || null,
  editing_checklist: card.editingChecklist || null,
  custom_video_formats: card.customVideoFormats || [],
  custom_photo_formats: card.customPhotoFormats || [],
  scheduling_status: card.schedulingStatus || null,
  scheduled_date: card.scheduledDate || null,
  scheduled_start_time: card.scheduledStartTime || null,
  scheduled_end_time: card.scheduledEndTime || null,
  scheduled_color: card.scheduledColor || null,
  planned_date: card.plannedDate || null,
  planned_start_time: card.plannedStartTime || null,
  planned_end_time: card.plannedEndTime || null,
  planned_color: card.plannedColor || null,
  from_calendar: card.fromCalendar || false,
  brain_dump_handled_text: card.brainDumpHandledText || null,
  calendar_only: card.calendarOnly || false,
  display_order: card.displayOrder || 0,
});

// =====================================================
// Production Cards CRUD
// =====================================================

// Get all production cards for a user
export const getUserProductionCards = async (userId: string): Promise<ProductionCard[]> => {
  const { data, error } = await supabase
    .from('production_cards')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching production cards:', error);
    throw error;
  }

  return (data || []).map(c => dbToProductionCard(c as DbProductionCard));
};

// Get cards by column
export const getCardsByColumn = async (
  userId: string,
  columnId: string
): Promise<ProductionCard[]> => {
  const { data, error } = await supabase
    .from('production_cards')
    .select('*')
    .eq('user_id', userId)
    .eq('column_id', columnId)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching cards by column:', error);
    throw error;
  }

  return (data || []).map(c => dbToProductionCard(c as DbProductionCard));
};

// Create a production card
export const createProductionCard = async (
  userId: string,
  card: Omit<ProductionCard, 'id'>
): Promise<ProductionCard> => {
  const dbCard = productionCardToDb(userId, card);

  const { data, error } = await supabase
    .from('production_cards')
    .insert([dbCard])
    .select()
    .single();

  if (error) {
    console.error('Error creating production card:', error);
    throw error;
  }

  return dbToProductionCard(data as DbProductionCard);
};

// Update a production card
export const updateProductionCard = async (
  cardId: string,
  updates: Partial<Omit<ProductionCard, 'id'>>
): Promise<ProductionCard> => {
  const dbUpdates: Record<string, unknown> = {};

  if (updates.columnId !== undefined) dbUpdates.column_id = updates.columnId;
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.isCompleted !== undefined) dbUpdates.is_completed = updates.isCompleted;
  if (updates.isNew !== undefined) dbUpdates.is_new = updates.isNew;
  if (updates.addedFrom !== undefined) dbUpdates.added_from = updates.addedFrom;
  if (updates.platforms !== undefined) dbUpdates.platforms = updates.platforms;
  if (updates.formats !== undefined) dbUpdates.formats = updates.formats;
  if (updates.script !== undefined) dbUpdates.script = updates.script;
  if (updates.hook !== undefined) dbUpdates.hook = updates.hook;
  if (updates.locationChecked !== undefined) dbUpdates.location_checked = updates.locationChecked;
  if (updates.locationText !== undefined) dbUpdates.location_text = updates.locationText;
  if (updates.outfitChecked !== undefined) dbUpdates.outfit_checked = updates.outfitChecked;
  if (updates.outfitText !== undefined) dbUpdates.outfit_text = updates.outfitText;
  if (updates.propsChecked !== undefined) dbUpdates.props_checked = updates.propsChecked;
  if (updates.propsText !== undefined) dbUpdates.props_text = updates.propsText;
  if (updates.filmingNotes !== undefined) dbUpdates.filming_notes = updates.filmingNotes;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
  if (updates.storyboard !== undefined) dbUpdates.storyboard = updates.storyboard;
  if (updates.editingChecklist !== undefined) dbUpdates.editing_checklist = updates.editingChecklist;
  if (updates.customVideoFormats !== undefined) dbUpdates.custom_video_formats = updates.customVideoFormats;
  if (updates.customPhotoFormats !== undefined) dbUpdates.custom_photo_formats = updates.customPhotoFormats;
  if (updates.schedulingStatus !== undefined) dbUpdates.scheduling_status = updates.schedulingStatus;
  if (updates.scheduledDate !== undefined) dbUpdates.scheduled_date = updates.scheduledDate;
  if (updates.scheduledStartTime !== undefined) dbUpdates.scheduled_start_time = updates.scheduledStartTime;
  if (updates.scheduledEndTime !== undefined) dbUpdates.scheduled_end_time = updates.scheduledEndTime;
  if (updates.scheduledColor !== undefined) dbUpdates.scheduled_color = updates.scheduledColor;
  if (updates.fromCalendar !== undefined) dbUpdates.from_calendar = updates.fromCalendar;
  if (updates.plannedDate !== undefined) dbUpdates.planned_date = updates.plannedDate;
  if (updates.plannedColor !== undefined) dbUpdates.planned_color = updates.plannedColor;
  if (updates.plannedStartTime !== undefined) dbUpdates.planned_start_time = updates.plannedStartTime;
  if (updates.plannedEndTime !== undefined) dbUpdates.planned_end_time = updates.plannedEndTime;
  if (updates.brainDumpHandledText !== undefined) dbUpdates.brain_dump_handled_text = updates.brainDumpHandledText;
  if (updates.calendarOnly !== undefined) dbUpdates.calendar_only = updates.calendarOnly;
  if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder;

  const { data, error } = await supabase
    .from('production_cards')
    .update(dbUpdates)
    .eq('id', cardId)
    .select()
    .single();

  if (error) {
    console.error('Error updating production card:', error);
    throw error;
  }

  return dbToProductionCard(data as DbProductionCard);
};

// Move card to different column
export const moveCardToColumn = async (
  cardId: string,
  newColumnId: string,
  newOrder?: number
): Promise<ProductionCard> => {
  const updates: Record<string, unknown> = { column_id: newColumnId };
  if (newOrder !== undefined) {
    updates.display_order = newOrder;
  }

  const { data, error } = await supabase
    .from('production_cards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single();

  if (error) {
    console.error('Error moving production card:', error);
    throw error;
  }

  return dbToProductionCard(data as DbProductionCard);
};

// Delete a production card
export const deleteProductionCard = async (cardId: string): Promise<void> => {
  const { error } = await supabase
    .from('production_cards')
    .delete()
    .eq('id', cardId);

  if (error) {
    console.error('Error deleting production card:', error);
    throw error;
  }
};

// Get scheduled cards (for calendar view)
export const getScheduledCards = async (userId: string): Promise<ProductionCard[]> => {
  const { data, error } = await supabase
    .from('production_cards')
    .select('*')
    .eq('user_id', userId)
    .not('scheduled_date', 'is', null)
    .order('scheduled_date', { ascending: true });

  if (error) {
    console.error('Error fetching scheduled cards:', error);
    throw error;
  }

  return (data || []).map(c => dbToProductionCard(c as DbProductionCard));
};

// Get planned cards (for calendar view)
export const getPlannedCards = async (userId: string): Promise<ProductionCard[]> => {
  const { data, error } = await supabase
    .from('production_cards')
    .select('*')
    .eq('user_id', userId)
    .not('planned_date', 'is', null)
    .order('planned_date', { ascending: true });

  if (error) {
    console.error('Error fetching planned cards:', error);
    throw error;
  }

  return (data || []).map(c => dbToProductionCard(c as DbProductionCard));
};

// =====================================================
// Migration Helpers
// =====================================================

// Batch create production cards
export const batchCreateProductionCards = async (
  userId: string,
  cards: Array<Omit<ProductionCard, 'id'>>
): Promise<ProductionCard[]> => {
  if (cards.length === 0) return [];

  const dbCards = cards.map(card => productionCardToDb(userId, card));

  const { data, error } = await supabase
    .from('production_cards')
    .insert(dbCards)
    .select();

  if (error) {
    console.error('Error batch creating production cards:', error);
    throw error;
  }

  return (data || []).map(c => dbToProductionCard(c as DbProductionCard));
};
