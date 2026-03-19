import React, { useState, useEffect, useMemo } from 'react';
import { ProductionCard, KanbanColumn, EditingChecklistItem } from '../types';

export interface UseMobileCardStateReturn {
  // Basic fields
  title: string;
  setTitle: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  script: string;
  setScript: (v: string) => void;

  // Menu/dialog state
  showMoveMenu: boolean;
  setShowMoveMenu: (v: boolean) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (v: boolean) => void;

  // Editing checklist (To Edit)
  checklistItems: EditingChecklistItem[];
  setChecklistItems: React.Dispatch<React.SetStateAction<EditingChecklistItem[]>>;
  editorNotes: string;
  setEditorNotes: (v: string) => void;
  newItemText: string;
  setNewItemText: (v: string) => void;

  // Script ideas fields
  formatTags: string[];
  setFormatTags: (v: string[]) => void;
  platformTags: string[];
  setPlatformTags: (v: string[]) => void;
  locationText: string;
  setLocationText: (v: string) => void;
  outfitText: string;
  setOutfitText: (v: string) => void;
  propsText: string;
  setPropsText: (v: string) => void;
  filmingNotes: string;
  setFilmingNotes: (v: string) => void;

  // Collapsible sections
  expandedSections: Set<string>;
  toggleSection: (section: string) => void;

  // To Film
  filmedScenes: Set<string>;
  setFilmedScenes: React.Dispatch<React.SetStateAction<Set<string>>>;
  showScript: boolean;
  setShowScript: (v: boolean) => void;

  // Scheduling
  scheduledDate: string;
  setScheduledDate: (v: string) => void;
  scheduledStartTime: string;
  setScheduledStartTime: (v: string) => void;
  showMarkPosted: boolean;
  setShowMarkPosted: (v: boolean) => void;
  showScheduleConfirm: boolean;
  setShowScheduleConfirm: (v: boolean) => void;
  calendarMonth: Date;
  setCalendarMonth: (v: Date) => void;

  // Computed
  scheduledContent: Record<string, { id: string; title: string; time: string }[]>;
  scheduledDates: Set<string>;
  calendarDays: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[];

  // Column flags
  isIdeate: boolean;
  isScriptIdeas: boolean;
  isToEdit: boolean;
  isToFilm: boolean;
  isToSchedule: boolean;
  isScheduled: boolean;
}

export function useMobileCardState(
  card: ProductionCard,
  columns: KanbanColumn[],
  onSave: (updatedCard: ProductionCard) => void
): UseMobileCardStateReturn {
  const isIdeate = card.columnId === 'ideate';
  const isScriptIdeas = card.columnId === 'shape-ideas';
  const isToEdit = card.columnId === 'to-edit';
  const isToFilm = card.columnId === 'to-film';
  const isToSchedule = card.columnId === 'to-schedule';
  const isScheduled = card.columnId === 'scheduled';

  const [title, setTitle] = useState(card.title);
  const [notes, setNotes] = useState(isIdeate ? (card.description || '') : '');
  const [script, setScript] = useState(isScriptIdeas ? (card.script || '') : '');
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // For To Edit
  const [checklistItems, setChecklistItems] = useState<EditingChecklistItem[]>(
    card.editingChecklist?.items || []
  );
  const [editorNotes, setEditorNotes] = useState(card.editingChecklist?.notes || '');
  const [newItemText, setNewItemText] = useState('');

  // For Script Ideas
  const [formatTags, setFormatTags] = useState<string[]>(card.formats || []);
  const [platformTags, setPlatformTags] = useState<string[]>(card.platforms || []);
  const [locationText, setLocationText] = useState(card.locationText || '');
  const [outfitText, setOutfitText] = useState(card.outfitText || '');
  const [propsText, setPropsText] = useState(card.propsText || '');
  const [filmingNotes, setFilmingNotes] = useState(card.filmingNotes || '');

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    const sections = new Set<string>();
    if (card.formats && card.formats.length > 0) sections.add('format');
    if (card.platforms && card.platforms.length > 0) sections.add('platforms');
    if (card.locationText || card.outfitText || card.propsText || card.filmingNotes) sections.add('shooting');
    return sections;
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // To Film
  const [filmedScenes, setFilmedScenes] = useState<Set<string>>(() => {
    if (!isToFilm) return new Set();
    const saved = localStorage.getItem(`heymeg_filmed_${card.id}`);
    if (saved) {
      try {
        return new Set(JSON.parse(saved));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });
  const [showScript, setShowScript] = useState(false);

  // Scheduling
  const [scheduledDate, setScheduledDate] = useState(card.scheduledDate || '');
  const [scheduledStartTime, setScheduledStartTime] = useState(card.scheduledStartTime || '09:00');
  const [showMarkPosted, setShowMarkPosted] = useState(false);
  const [showScheduleConfirm, setShowScheduleConfirm] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (card.scheduledDate) {
      const d = new Date(card.scheduledDate);
      return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });

  // Scheduled content from other cards
  const scheduledContent = useMemo(() => {
    const contentByDate: Record<string, { id: string; title: string; time: string }[]> = {};
    columns.forEach(col => {
      col.cards.forEach(c => {
        if (c.id !== card.id && c.scheduledDate) {
          if (!contentByDate[c.scheduledDate]) {
            contentByDate[c.scheduledDate] = [];
          }
          contentByDate[c.scheduledDate].push({
            id: c.id,
            title: c.title,
            time: c.scheduledStartTime || '09:00',
          });
        }
      });
    });
    Object.keys(contentByDate).forEach(date => {
      contentByDate[date].sort((a, b) => a.time.localeCompare(b.time));
    });
    return contentByDate;
  }, [columns, card.id]);

  const scheduledDates = useMemo(() => new Set(Object.keys(scheduledContent)), [scheduledContent]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, isCurrentMonth: false, isToday: false, isSelected: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isSelected: scheduledDate === dateStr,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, isToday: false, isSelected: false });
    }

    return days;
  }, [calendarMonth, scheduledDate]);

  // Auto-save on changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      const checklistChanged = isToEdit && (
        JSON.stringify(checklistItems) !== JSON.stringify(card.editingChecklist?.items || []) ||
        editorNotes !== (card.editingChecklist?.notes || '')
      );

      const scriptIdeasChanged = isScriptIdeas && (
        JSON.stringify(formatTags) !== JSON.stringify(card.formats || []) ||
        JSON.stringify(platformTags) !== JSON.stringify(card.platforms || []) ||
        locationText !== (card.locationText || '') ||
        outfitText !== (card.outfitText || '') ||
        propsText !== (card.propsText || '') ||
        filmingNotes !== (card.filmingNotes || '')
      );

      const scheduleChanged = (isToSchedule || isScheduled) && (
        scheduledDate !== (card.scheduledDate || '') ||
        scheduledStartTime !== (card.scheduledStartTime || '09:00')
      );

      const hasChanges =
        title !== card.title ||
        (isIdeate && notes !== (card.description || '')) ||
        (isScriptIdeas && script !== (card.script || '')) ||
        checklistChanged ||
        scriptIdeasChanged ||
        scheduleChanged;

      if (hasChanges) {
        onSave({
          ...card,
          title,
          description: isIdeate ? notes : card.description,
          script: isScriptIdeas ? script : card.script,
          formats: isScriptIdeas ? formatTags : card.formats,
          platforms: isScriptIdeas ? platformTags : card.platforms,
          locationText: isScriptIdeas ? locationText : card.locationText,
          outfitText: isScriptIdeas ? outfitText : card.outfitText,
          propsText: isScriptIdeas ? propsText : card.propsText,
          filmingNotes: isScriptIdeas ? filmingNotes : card.filmingNotes,
          editingChecklist: isToEdit ? {
            ...card.editingChecklist,
            items: checklistItems,
            notes: editorNotes,
            externalLinks: card.editingChecklist?.externalLinks || [],
            status: card.editingChecklist?.status || null,
          } : card.editingChecklist,
          scheduledDate: (isToSchedule || isScheduled) ? (scheduledDate || undefined) : card.scheduledDate,
          scheduledStartTime: (isToSchedule || isScheduled) ? scheduledStartTime : card.scheduledStartTime,
          schedulingStatus: (isToSchedule || isScheduled) && scheduledDate ? 'scheduled' : card.schedulingStatus,
        });
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [title, notes, script, checklistItems, editorNotes, formatTags, platformTags, locationText, outfitText, propsText, filmingNotes, scheduledDate, scheduledStartTime, isToSchedule, isScheduled]);

  return {
    title, setTitle,
    notes, setNotes,
    script, setScript,
    showMoveMenu, setShowMoveMenu,
    showDeleteConfirm, setShowDeleteConfirm,
    checklistItems, setChecklistItems,
    editorNotes, setEditorNotes,
    newItemText, setNewItemText,
    formatTags, setFormatTags,
    platformTags, setPlatformTags,
    locationText, setLocationText,
    outfitText, setOutfitText,
    propsText, setPropsText,
    filmingNotes, setFilmingNotes,
    expandedSections, toggleSection,
    filmedScenes, setFilmedScenes,
    showScript, setShowScript,
    scheduledDate, setScheduledDate,
    scheduledStartTime, setScheduledStartTime,
    showMarkPosted, setShowMarkPosted,
    showScheduleConfirm, setShowScheduleConfirm,
    calendarMonth, setCalendarMonth,
    scheduledContent, scheduledDates, calendarDays,
    isIdeate, isScriptIdeas, isToEdit, isToFilm, isToSchedule, isScheduled,
  };
}
