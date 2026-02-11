import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronDown, Trash2, Check, Plus, Video, Camera, MapPin, Shirt, Boxes, NotebookPen, Play, FileText, Clapperboard, CalendarDays, Clock, CheckCircle, Send, ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';
import { SiYoutube, SiTiktok, SiInstagram, SiFacebook, SiLinkedin } from 'react-icons/si';
import { RiTwitterXLine, RiThreadsLine } from 'react-icons/ri';
import { ProductionCard, KanbanColumn, EditingChecklistItem, StoryboardScene } from '../types';
import { getShotTemplateById } from '../utils/shotTemplates';

// Import shot illustrations
import wideShotIllustration from "@/assets/shot-illustrations/wide-shot.png";
import mediumShotIllustration from "@/assets/shot-illustrations/medium-shot.png";
import closeUpShotIllustration from "@/assets/shot-illustrations/close-up-shot.png";
import handsDoingIllustration from "@/assets/shot-illustrations/hands-doing.png";
import closeDetailIllustration from "@/assets/shot-illustrations/close-detail.png";
import atDeskIllustration from "@/assets/shot-illustrations/at-desk.png";
import neutralVisualIllustration from "@/assets/shot-illustrations/neutral-visual.png";
import movingThroughIllustration from "@/assets/shot-illustrations/moving-through.png";
import quietCutawayIllustration from "@/assets/shot-illustrations/quiet-cutaway.png";
import reactionMomentIllustration from "@/assets/shot-illustrations/reaction-moment.png";

const shotIllustrations: Record<string, string> = {
  'wide-shot': wideShotIllustration,
  'medium-shot': mediumShotIllustration,
  'close-up-shot': closeUpShotIllustration,
  'hands-doing': handsDoingIllustration,
  'close-detail': closeDetailIllustration,
  'at-desk': atDeskIllustration,
  'neutral-visual': neutralVisualIllustration,
  'moving-through': movingThroughIllustration,
  'quiet-cutaway': quietCutawayIllustration,
  'reaction-moment': reactionMomentIllustration,
};

interface MobileCardEditorProps {
  card: ProductionCard;
  columns: KanbanColumn[];
  onSave: (updatedCard: ProductionCard) => void;
  onMove: (cardId: string, targetColumnId: string) => void;
  onDelete: (cardId: string) => void;
  onClose: () => void;
  onOpenStoryboard?: (card: ProductionCard) => void;
}

const columnLabels: Record<string, string> = {
  'ideate': 'Ideate',
  'shape-ideas': 'Script Ideas',
  'to-film': 'To Film',
  'to-edit': 'To Edit',
  'to-schedule': 'To Schedule',
  'scheduled': 'Scheduled',
  'posted': 'Posted',
};

const MobileCardEditor: React.FC<MobileCardEditorProps> = ({
  card,
  columns,
  onSave,
  onMove,
  onDelete,
  onClose,
  onOpenStoryboard,
}) => {
  const isIdeate = card.columnId === 'ideate';
  const isScriptIdeas = card.columnId === 'shape-ideas';
  const isToEdit = card.columnId === 'to-edit';
  const isToFilm = card.columnId === 'to-film';
  const isToSchedule = card.columnId === 'to-schedule';
  const isScheduled = card.columnId === 'scheduled';

  const [title, setTitle] = useState(card.title);
  // For Ideate: use description, For Script Ideas: use script
  const [notes, setNotes] = useState(isIdeate ? (card.description || '') : '');
  const [script, setScript] = useState(isScriptIdeas ? (card.script || '') : '');
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // For To Edit: editing checklist and notes
  const [checklistItems, setChecklistItems] = useState<EditingChecklistItem[]>(
    card.editingChecklist?.items || []
  );
  const [editorNotes, setEditorNotes] = useState(card.editingChecklist?.notes || '');
  const [newItemText, setNewItemText] = useState('');

  // For Script Ideas: formats, platforms, shooting plan
  const [formatTags, setFormatTags] = useState<string[]>(card.formats || []);
  const [platformTags, setPlatformTags] = useState<string[]>(card.platforms || []);
  const [locationText, setLocationText] = useState(card.locationText || '');
  const [outfitText, setOutfitText] = useState(card.outfitText || '');
  const [propsText, setPropsText] = useState(card.propsText || '');
  const [filmingNotes, setFilmingNotes] = useState(card.filmingNotes || '');

  // Collapsible section states
  const [expandedSections, setExpandedSections] = useState<Set<string>>(() => {
    // Auto-expand sections that have data
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

  // For To Film: filmed scenes tracking
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

  // For To Schedule and Scheduled: date and time
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

  // Get all scheduled content from other cards (for calendar indicators)
  const scheduledContent = useMemo(() => {
    const contentByDate: Record<string, { id: string; title: string; time: string }[]> = {};
    columns.forEach(col => {
      col.cards.forEach(c => {
        // Exclude current card, include cards with scheduled dates
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
    // Sort each day's content by time
    Object.keys(contentByDate).forEach(date => {
      contentByDate[date].sort((a, b) => a.time.localeCompare(b.time));
    });
    return contentByDate;
  }, [columns, card.id]);

  const scheduledDates = useMemo(() => new Set(Object.keys(scheduledContent)), [scheduledContent]);

  // Generate calendar days for the current month view
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    // Current month days
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

    // Next month days to fill grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  }, [calendarMonth, scheduledDate]);

  // Get shot illustration for a scene
  const getSceneIllustration = (scene: StoryboardScene): string | null => {
    if (!scene.selectedShotTemplateId) return null;
    return shotIllustrations[scene.selectedShotTemplateId] || null;
  };

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

  const handleMove = (targetColumnId: string) => {
    onMove(card.id, targetColumnId);
    setShowMoveMenu(false);
    onClose();
  };

  const handleDelete = () => {
    onDelete(card.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto" style={{ background: '#F8F6F4' }}>
      {/* Modern gradient background with brand colors */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(135deg, rgba(97, 42, 79, 0.03) 0%, transparent 50%),
            linear-gradient(225deg, rgba(139, 112, 130, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 0% 0%, rgba(97, 42, 79, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 100% 100%, rgba(139, 112, 130, 0.06) 0%, transparent 40%)
          `
        }}
      />

      {/* Floating glass orb decorations */}
      <div
        className="fixed top-20 -right-10 w-40 h-40 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 112, 130, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="fixed bottom-40 -left-10 w-32 h-32 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(97, 42, 79, 0.08) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Glass Header */}
      <div
        className="sticky top-0 z-20 px-4 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
          boxShadow: '0 4px 30px rgba(97, 42, 79, 0.05)',
        }}
      >
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 2px 8px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <X className="w-5 h-5" style={{ color: '#612a4f' }} />
        </button>

        <span
          className="text-lg"
          style={{ color: '#612a4f', fontFamily: "'Playfair Display', serif", fontWeight: 500 }}
        >
          {columnLabels[card.columnId] || card.columnId}
        </span>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all active:scale-95"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 2px 8px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          <Trash2 className="w-5 h-5" style={{ color: '#8B7082' }} />
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 p-5 space-y-5 pb-32">
        {/* Glass Card for Title */}
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <label
            className="block text-xs font-semibold mb-3 uppercase tracking-wider"
            style={{ color: '#8B7082' }}
          >
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your idea?"
            className="w-full px-0 py-2 text-base focus:outline-none bg-transparent transition-all placeholder:text-gray-400 placeholder:font-normal"
            style={{
              color: '#1a1523',
              fontFamily: "'Inter', sans-serif",
            }}
          />
        </div>

        {/* Glass Card for Notes (Ideate) or Talking Points (Script Ideas) */}
        {isIdeate && (
          <div
            className="rounded-3xl p-5"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <label
              className="block text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: '#8B7082' }}
            >
              Notes & Ideas
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dump your thoughts here... what's the concept? Any initial ideas?"
              rows={8}
              className="w-full px-0 py-2 text-sm leading-relaxed focus:outline-none bg-transparent resize-none placeholder:text-gray-400"
              style={{
                color: '#1a1523',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        )}

        {isScriptIdeas && (
          <div
            className="rounded-3xl p-5"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <label
              className="block text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: '#8B7082' }}
            >
              Script
            </label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Write your script here... what will you say in the video?"
              rows={10}
              className="w-full px-0 py-2 text-sm leading-relaxed focus:outline-none bg-transparent resize-none placeholder:text-gray-400"
              style={{
                color: '#1a1523',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        )}

        {/* Script Ideas: How It's Shot (Collapsible) */}
        {isScriptIdeas && (
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <button
              onClick={() => toggleSection('format')}
              className="w-full p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(97, 42, 79, 0.1)' }}
                >
                  <Video className="w-4 h-4" style={{ color: '#612a4f' }} />
                </div>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#8B7082' }}
                >
                  How It's Shot
                </span>
              </div>
              <div className="flex items-center gap-2">
                {formatTags.length > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(97, 42, 79, 0.1)', color: '#612a4f' }}
                  >
                    {formatTags.length}
                  </span>
                )}
                <ChevronDown
                  className="w-5 h-5 transition-transform duration-300"
                  style={{
                    color: '#8B7082',
                    transform: expandedSections.has('format') ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </div>
            </button>

            {expandedSections.has('format') && (
              <div className="px-5 pb-5 space-y-3">
                {/* Format options */}
                <div className="space-y-2">
                  <p className="text-xs" style={{ color: '#8B7082' }}>Video</p>
                  <div className="flex flex-wrap gap-2">
                    {['Talking to camera', 'Voice-over', 'Vlog', 'Tutorial', 'GRWM'].map((format) => (
                      <button
                        key={format}
                        onClick={() => {
                          if (formatTags.includes(format)) {
                            setFormatTags(formatTags.filter(f => f !== format));
                          } else {
                            setFormatTags([...formatTags, format]);
                          }
                        }}
                        className="px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
                        style={{
                          background: formatTags.includes(format)
                            ? 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)'
                            : 'rgba(139, 112, 130, 0.08)',
                          color: formatTags.includes(format) ? 'white' : '#1a1523',
                          border: formatTags.includes(format) ? 'none' : '1px solid rgba(139, 112, 130, 0.15)',
                        }}
                      >
                        <Video className="w-3 h-3" />
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs" style={{ color: '#8B7082' }}>Photo</p>
                  <div className="flex flex-wrap gap-2">
                    {['Photo post', 'Carousel', 'Text post'].map((format) => (
                      <button
                        key={format}
                        onClick={() => {
                          if (formatTags.includes(format)) {
                            setFormatTags(formatTags.filter(f => f !== format));
                          } else {
                            setFormatTags([...formatTags, format]);
                          }
                        }}
                        className="px-3 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
                        style={{
                          background: formatTags.includes(format)
                            ? 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)'
                            : 'rgba(139, 112, 130, 0.08)',
                          color: formatTags.includes(format) ? 'white' : '#1a1523',
                          border: formatTags.includes(format) ? 'none' : '1px solid rgba(139, 112, 130, 0.15)',
                        }}
                      >
                        <Camera className="w-3 h-3" />
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Script Ideas: Platforms (Collapsible) */}
        {isScriptIdeas && (
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <button
              onClick={() => toggleSection('platforms')}
              className="w-full p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(97, 42, 79, 0.1)' }}
                >
                  <SiInstagram className="w-4 h-4" style={{ color: '#612a4f' }} />
                </div>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#8B7082' }}
                >
                  Platforms
                </span>
              </div>
              <div className="flex items-center gap-2">
                {platformTags.length > 0 && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(97, 42, 79, 0.1)', color: '#612a4f' }}
                  >
                    {platformTags.length}
                  </span>
                )}
                <ChevronDown
                  className="w-5 h-5 transition-transform duration-300"
                  style={{
                    color: '#8B7082',
                    transform: expandedSections.has('platforms') ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </div>
            </button>

            {expandedSections.has('platforms') && (
              <div className="px-5 pb-5">
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'Instagram', icon: SiInstagram },
                    { name: 'TikTok', icon: SiTiktok },
                    { name: 'YouTube', icon: SiYoutube },
                    { name: 'Facebook', icon: SiFacebook },
                    { name: 'LinkedIn', icon: SiLinkedin },
                    { name: 'X', icon: RiTwitterXLine },
                    { name: 'Threads', icon: RiThreadsLine },
                  ].map((platform) => {
                    const isSelected = platformTags.includes(platform.name);
                    const IconComponent = platform.icon;
                    return (
                      <button
                        key={platform.name}
                        onClick={() => {
                          if (isSelected) {
                            setPlatformTags(platformTags.filter(p => p !== platform.name));
                          } else {
                            setPlatformTags([...platformTags, platform.name]);
                          }
                        }}
                        className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
                        style={{
                          background: isSelected
                            ? 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)'
                            : 'rgba(139, 112, 130, 0.08)',
                          border: isSelected ? 'none' : '1px solid rgba(139, 112, 130, 0.15)',
                        }}
                      >
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: isSelected ? 'white' : '#8B7082' }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Script Ideas: Shooting Plan (Collapsible) */}
        {isScriptIdeas && (
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <button
              onClick={() => toggleSection('shooting')}
              className="w-full p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(97, 42, 79, 0.1)' }}
                >
                  <MapPin className="w-4 h-4" style={{ color: '#612a4f' }} />
                </div>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#8B7082' }}
                >
                  Shooting Plan
                </span>
              </div>
              <div className="flex items-center gap-2">
                {(locationText || outfitText || propsText || filmingNotes) && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#612a4f' }}
                  />
                )}
                <ChevronDown
                  className="w-5 h-5 transition-transform duration-300"
                  style={{
                    color: '#8B7082',
                    transform: expandedSections.has('shooting') ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </div>
            </button>

            {expandedSections.has('shooting') && (
              <div className="px-5 pb-5 space-y-1">
                {/* Location */}
                <div
                  className="flex items-start gap-3 py-3 px-3 rounded-xl"
                  style={{ background: 'rgba(139, 112, 130, 0.05)' }}
                >
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8B7082' }} />
                  <textarea
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="Location..."
                    rows={1}
                    className="flex-1 text-sm bg-transparent border-none outline-none resize-none placeholder:text-gray-400"
                    style={{ color: '#1a1523', fontFamily: "'Inter', sans-serif" }}
                  />
                </div>

                {/* Outfit */}
                <div
                  className="flex items-start gap-3 py-3 px-3 rounded-xl"
                  style={{ background: 'rgba(139, 112, 130, 0.08)' }}
                >
                  <Shirt className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8B7082' }} />
                  <textarea
                    value={outfitText}
                    onChange={(e) => setOutfitText(e.target.value)}
                    placeholder="Outfit..."
                    rows={1}
                    className="flex-1 text-sm bg-transparent border-none outline-none resize-none placeholder:text-gray-400"
                    style={{ color: '#1a1523', fontFamily: "'Inter', sans-serif" }}
                  />
                </div>

                {/* Props */}
                <div
                  className="flex items-start gap-3 py-3 px-3 rounded-xl"
                  style={{ background: 'rgba(139, 112, 130, 0.11)' }}
                >
                  <Boxes className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8B7082' }} />
                  <textarea
                    value={propsText}
                    onChange={(e) => setPropsText(e.target.value)}
                    placeholder="Props..."
                    rows={1}
                    className="flex-1 text-sm bg-transparent border-none outline-none resize-none placeholder:text-gray-400"
                    style={{ color: '#1a1523', fontFamily: "'Inter', sans-serif" }}
                  />
                </div>

                {/* Notes */}
                <div
                  className="flex items-start gap-3 py-3 px-3 rounded-xl"
                  style={{ background: 'rgba(139, 112, 130, 0.14)' }}
                >
                  <NotebookPen className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8B7082' }} />
                  <textarea
                    value={filmingNotes}
                    onChange={(e) => setFilmingNotes(e.target.value)}
                    placeholder="Notes..."
                    rows={2}
                    className="flex-1 text-sm bg-transparent border-none outline-none resize-none placeholder:text-gray-400"
                    style={{ color: '#1a1523', fontFamily: "'Inter', sans-serif" }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* To Edit: Editing Checklist */}
        {isToEdit && (
          <div
            className="rounded-3xl p-5"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <label
              className="block text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: '#8B7082' }}
            >
              Editing Checklist
            </label>

            {/* Checklist items */}
            <div className="space-y-2 mb-4">
              {checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2"
                >
                  <button
                    onClick={() => {
                      setChecklistItems(prev =>
                        prev.map(i =>
                          i.id === item.id ? { ...i, checked: !i.checked } : i
                        )
                      );
                    }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: item.checked
                        ? 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)'
                        : 'rgba(139, 112, 130, 0.1)',
                      border: item.checked ? 'none' : '1px solid rgba(139, 112, 130, 0.2)',
                    }}
                  >
                    {item.checked && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <span
                    className="flex-1 text-sm"
                    style={{
                      color: item.checked ? '#8B7082' : '#1a1523',
                      textDecoration: item.checked ? 'line-through' : 'none',
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {item.text}
                  </span>
                  <button
                    onClick={() => {
                      setChecklistItems(prev => prev.filter(i => i.id !== item.id));
                    }}
                    className="w-6 h-6 rounded-lg flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" style={{ color: '#8B7082' }} />
                  </button>
                </div>
              ))}

              {checklistItems.length === 0 && (
                <p className="text-sm py-2" style={{ color: '#8B7082' }}>
                  No checklist items yet
                </p>
              )}
            </div>

            {/* Add new item */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="Add a task..."
                className="flex-1 px-3 py-2 text-sm rounded-xl focus:outline-none bg-transparent transition-all placeholder:text-gray-400"
                style={{
                  color: '#1a1523',
                  fontFamily: "'Inter', sans-serif",
                  background: 'rgba(139, 112, 130, 0.05)',
                  border: '1px solid rgba(139, 112, 130, 0.15)',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newItemText.trim()) {
                    setChecklistItems(prev => [
                      ...prev,
                      {
                        id: `item-${Date.now()}`,
                        text: newItemText.trim(),
                        checked: false,
                      }
                    ]);
                    setNewItemText('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newItemText.trim()) {
                    setChecklistItems(prev => [
                      ...prev,
                      {
                        id: `item-${Date.now()}`,
                        text: newItemText.trim(),
                        checked: false,
                      }
                    ]);
                    setNewItemText('');
                  }
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)',
                }}
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* To Edit: Editor's Notes */}
        {isToEdit && (
          <div
            className="rounded-3xl p-5"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <label
              className="block text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: '#8B7082' }}
            >
              Editor's Notes
            </label>
            <textarea
              value={editorNotes}
              onChange={(e) => setEditorNotes(e.target.value)}
              placeholder="Add notes for editing... music choices, transitions, special effects, etc."
              rows={6}
              className="w-full px-0 py-2 text-sm leading-relaxed focus:outline-none bg-transparent resize-none placeholder:text-gray-400"
              style={{
                color: '#1a1523',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        )}

        {/* To Film: Enhanced Overview */}
        {isToFilm && (
          <>
            {/* Progress & Start Filming Button */}
            <div
              className="rounded-3xl p-5"
              style={{
                background: 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)',
                boxShadow: '0 8px 32px rgba(97, 42, 79, 0.25)',
              }}
            >
              {card.storyboard && card.storyboard.length > 0 ? (
                <>
                  {/* Progress */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/80 text-sm">Filming Progress</span>
                    <span className="text-white font-semibold">
                      {filmedScenes.size} / {card.storyboard.length} shots
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 rounded-full bg-white/20 mb-5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-500"
                      style={{
                        width: `${(filmedScenes.size / card.storyboard.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Start Filming button */}
                  <button
                    onClick={() => onOpenStoryboard?.(card)}
                    className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <Play className="w-6 h-6" style={{ color: '#612a4f' }} />
                    <span
                      className="text-lg font-semibold"
                      style={{ color: '#612a4f', fontFamily: "'Playfair Display', serif" }}
                    >
                      Start Filming
                    </span>
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <Clapperboard className="w-10 h-10 text-white/60 mx-auto mb-3" />
                  <p className="text-white/80 text-sm">No storyboard yet</p>
                  <p className="text-white/60 text-xs mt-1">Create shots in the desktop view</p>
                </div>
              )}
            </div>

            {/* Shot Thumbnails Grid */}
            {card.storyboard && card.storyboard.length > 0 && (
              <div
                className="rounded-3xl p-5"
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
              >
                <label
                  className="block text-xs font-semibold mb-4 uppercase tracking-wider"
                  style={{ color: '#8B7082' }}
                >
                  Shot List
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {card.storyboard.map((scene, index) => {
                    const isFilmed = filmedScenes.has(scene.id);
                    const illustration = getSceneIllustration(scene);
                    const template = scene.selectedShotTemplateId
                      ? getShotTemplateById(scene.selectedShotTemplateId)
                      : null;

                    return (
                      <div
                        key={scene.id}
                        className="relative aspect-square rounded-xl overflow-hidden"
                        style={{
                          background: isFilmed
                            ? 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)'
                            : 'rgba(139, 112, 130, 0.1)',
                          border: isFilmed ? 'none' : '1px solid rgba(139, 112, 130, 0.2)',
                        }}
                      >
                        {illustration ? (
                          <img
                            src={illustration}
                            alt={template?.user_facing_name || `Shot ${index + 1}`}
                            className="w-full h-full object-cover"
                            style={{ opacity: isFilmed ? 0.4 : 0.8 }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video
                              className="w-5 h-5"
                              style={{ color: isFilmed ? 'white' : '#8B7082', opacity: 0.5 }}
                            />
                          </div>
                        )}

                        {/* Shot number */}
                        <div
                          className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                          style={{
                            background: isFilmed ? 'white' : 'rgba(255,255,255,0.9)',
                            color: '#612a4f',
                          }}
                        >
                          {index + 1}
                        </div>

                        {/* Filmed checkmark */}
                        {isFilmed && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                              <Check className="w-5 h-5" style={{ color: '#612a4f' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Script Reference (Collapsible) */}
            {card.script && (
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
              >
                <button
                  onClick={() => setShowScript(!showScript)}
                  className="w-full p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(97, 42, 79, 0.1)' }}
                    >
                      <FileText className="w-4 h-4" style={{ color: '#612a4f' }} />
                    </div>
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#8B7082' }}
                    >
                      Script Reference
                    </span>
                  </div>
                  <ChevronDown
                    className="w-5 h-5 transition-transform duration-300"
                    style={{
                      color: '#8B7082',
                      transform: showScript ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {showScript && (
                  <div className="px-5 pb-5">
                    <div
                      className="p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap"
                      style={{
                        background: 'rgba(139, 112, 130, 0.05)',
                        color: '#1a1523',
                        fontFamily: "'Inter', sans-serif",
                        maxHeight: '300px',
                        overflowY: 'auto',
                      }}
                    >
                      {card.script}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Filming Prep (Collapsible) */}
            {(card.locationText || card.outfitText || card.propsText || card.filmingNotes) && (
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                }}
              >
                <button
                  onClick={() => toggleSection('filmPrep')}
                  className="w-full p-5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: 'rgba(97, 42, 79, 0.1)' }}
                    >
                      <MapPin className="w-4 h-4" style={{ color: '#612a4f' }} />
                    </div>
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#8B7082' }}
                    >
                      Filming Prep
                    </span>
                  </div>
                  <ChevronDown
                    className="w-5 h-5 transition-transform duration-300"
                    style={{
                      color: '#8B7082',
                      transform: expandedSections.has('filmPrep') ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {expandedSections.has('filmPrep') && (
                  <div className="px-5 pb-5 space-y-1">
                    {card.locationText && (
                      <div
                        className="flex items-start gap-3 py-3 px-3 rounded-xl"
                        style={{ background: 'rgba(139, 112, 130, 0.05)' }}
                      >
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8B7082' }} />
                        <span className="text-sm" style={{ color: '#1a1523' }}>{card.locationText}</span>
                      </div>
                    )}
                    {card.outfitText && (
                      <div
                        className="flex items-start gap-3 py-3 px-3 rounded-xl"
                        style={{ background: 'rgba(139, 112, 130, 0.08)' }}
                      >
                        <Shirt className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8B7082' }} />
                        <span className="text-sm" style={{ color: '#1a1523' }}>{card.outfitText}</span>
                      </div>
                    )}
                    {card.propsText && (
                      <div
                        className="flex items-start gap-3 py-3 px-3 rounded-xl"
                        style={{ background: 'rgba(139, 112, 130, 0.11)' }}
                      >
                        <Boxes className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8B7082' }} />
                        <span className="text-sm" style={{ color: '#1a1523' }}>{card.propsText}</span>
                      </div>
                    )}
                    {card.filmingNotes && (
                      <div
                        className="flex items-start gap-3 py-3 px-3 rounded-xl"
                        style={{ background: 'rgba(139, 112, 130, 0.14)' }}
                      >
                        <NotebookPen className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#8B7082' }} />
                        <span className="text-sm" style={{ color: '#1a1523' }}>{card.filmingNotes}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* To Schedule: Scheduling Interface */}
        {isToSchedule && (
          <>
            {/* Status Banner - only show when no date selected */}
            {!scheduledDate && (
              <div
                className="rounded-3xl p-5"
                style={{
                  background: 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)',
                  boxShadow: '0 8px 32px rgba(97, 42, 79, 0.25)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-lg">Ready to Schedule</p>
                    <p className="text-white/80 text-sm">Select a date and time below</p>
                  </div>
                </div>
              </div>
            )}

            {/* Modern Calendar Picker */}
            <div
              className="rounded-3xl p-5"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
                  style={{ background: 'rgba(139, 112, 130, 0.08)' }}
                >
                  <ChevronLeft className="w-5 h-5" style={{ color: '#612a4f' }} />
                </button>
                <span
                  className="text-base font-semibold"
                  style={{ color: '#612a4f', fontFamily: "'Playfair Display', serif" }}
                >
                  {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
                  style={{ background: 'rgba(139, 112, 130, 0.08)' }}
                >
                  <ChevronRight className="w-5 h-5" style={{ color: '#612a4f' }} />
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div
                    key={i}
                    className="h-8 flex items-center justify-center text-xs font-medium"
                    style={{ color: '#8B7082' }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  const dateStr = day.date.toISOString().split('T')[0];
                  const hasScheduledContent = scheduledDates.has(dateStr);

                  return (
                    <button
                      key={i}
                      onClick={() => setScheduledDate(dateStr)}
                      className="aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all active:scale-95 relative"
                      style={{
                        background: day.isSelected
                          ? 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)'
                          : day.isToday
                          ? 'rgba(97, 42, 79, 0.15)'
                          : 'transparent',
                        color: day.isSelected
                          ? 'white'
                          : day.isCurrentMonth
                          ? day.isToday
                            ? '#612a4f'
                            : '#1a1523'
                          : '#ccc',
                        fontWeight: day.isToday || day.isSelected ? 600 : 400,
                      }}
                    >
                      <span>{day.date.getDate()}</span>
                      {hasScheduledContent && day.isCurrentMonth && (
                        <div
                          className="absolute bottom-1 w-1 h-1 rounded-full"
                          style={{
                            background: day.isSelected ? 'white' : '#10b981',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Scheduled content for selected date */}
              {scheduledDate && scheduledContent[scheduledDate] && scheduledContent[scheduledDate].length > 0 && (
                <div
                  className="mt-4 p-3 rounded-2xl"
                  style={{ background: 'rgba(16, 185, 129, 0.08)' }}
                >
                  <p className="text-xs font-medium mb-2" style={{ color: '#059669' }}>
                    Also scheduled for this day:
                  </p>
                  <div className="space-y-2">
                    {scheduledContent[scheduledDate].map((item) => {
                      const [h] = item.time.split(':').map(Number);
                      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                      const ampm = h >= 12 ? 'pm' : 'am';
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 text-sm"
                          style={{ color: '#1a1523' }}
                        >
                          <span
                            className="text-xs px-2 py-0.5 rounded-md font-medium"
                            style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}
                          >
                            {hour12}{ampm}
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clear button */}
              {scheduledDate && (
                <button
                  onClick={() => {
                    setScheduledDate('');
                    setScheduledStartTime('09:00');
                  }}
                  className="w-full py-2.5 mt-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                  style={{
                    background: 'rgba(139, 112, 130, 0.08)',
                    color: '#8B7082',
                  }}
                >
                  Clear date
                </button>
              )}
            </div>

            {/* Time Picker - Compact */}
            <div
              className="rounded-3xl p-5"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <label
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#8B7082' }}
                >
                  Post Time
                </label>
                <span
                  className="text-sm font-semibold px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(97, 42, 79, 0.1)', color: '#612a4f' }}
                >
                  {(() => {
                    const [h] = scheduledStartTime.split(':').map(Number);
                    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    return `${hour12}:00 ${ampm}`;
                  })()}
                </span>
              </div>

              {/* Common times grid */}
              <div className="grid grid-cols-4 gap-2">
                {['06:00', '09:00', '12:00', '15:00', '17:00', '18:00', '19:00', '21:00'].map((time) => {
                  const [h] = time.split(':').map(Number);
                  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                  const ampm = h >= 12 ? 'pm' : 'am';
                  const isSelected = scheduledStartTime === time;
                  return (
                    <button
                      key={time}
                      onClick={() => setScheduledStartTime(time)}
                      className="py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                      style={{
                        background: isSelected
                          ? 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)'
                          : 'rgba(139, 112, 130, 0.06)',
                        color: isSelected ? 'white' : '#1a1523',
                      }}
                    >
                      {hour12}{ampm}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Schedule Button - appears when date is selected */}
            {scheduledDate && (
              <button
                onClick={() => setShowScheduleConfirm(true)}
                className="w-full py-4 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.35)',
                }}
              >
                <CalendarCheck className="w-6 h-6 text-white" />
                <span
                  className="text-lg font-semibold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Schedule Content
                </span>
              </button>
            )}

            {/* Content Summary (collapsible) */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <button
                onClick={() => toggleSection('contentSummary')}
                className="w-full p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(97, 42, 79, 0.1)' }}
                  >
                    <FileText className="w-4 h-4" style={{ color: '#612a4f' }} />
                  </div>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#8B7082' }}
                  >
                    Content Summary
                  </span>
                </div>
                <ChevronDown
                  className="w-5 h-5 transition-transform duration-300"
                  style={{
                    color: '#8B7082',
                    transform: expandedSections.has('contentSummary') ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {expandedSections.has('contentSummary') && (
                <div className="px-5 pb-5 space-y-4">
                  {/* Script preview */}
                  {card.script && (
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: '#8B7082' }}>Script</p>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: '#1a1523',
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {card.script}
                      </p>
                    </div>
                  )}

                  {/* Platforms */}
                  {card.platforms && card.platforms.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: '#8B7082' }}>Platforms</p>
                      <div className="flex flex-wrap gap-2">
                        {card.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-3 py-1 rounded-full text-xs"
                            style={{
                              background: 'rgba(97, 42, 79, 0.1)',
                              color: '#612a4f',
                            }}
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formats */}
                  {card.formats && card.formats.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: '#8B7082' }}>Format</p>
                      <div className="flex flex-wrap gap-2">
                        {card.formats.map((format) => (
                          <span
                            key={format}
                            className="px-3 py-1 rounded-full text-xs flex items-center gap-1"
                            style={{
                              background: 'rgba(139, 112, 130, 0.1)',
                              color: '#1a1523',
                            }}
                          >
                            <Video className="w-3 h-3" />
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!card.script && !card.platforms?.length && !card.formats?.length && (
                    <p className="text-sm" style={{ color: '#8B7082' }}>No content details available</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Scheduled Column View */}
        {isScheduled && (
          <>
            {/* Scheduled Status Banner */}
            <div
              className="rounded-3xl p-5"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.25)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <CalendarCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Scheduled</p>
                  <p className="text-white/80 text-sm">
                    {card.scheduledDate && new Date(card.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                    {card.scheduledStartTime && ` at ${(() => {
                      const [h] = card.scheduledStartTime.split(':').map(Number);
                      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                      const ampm = h >= 12 ? 'PM' : 'AM';
                      return `${hour12}:00 ${ampm}`;
                    })()}`}
                  </p>
                </div>
              </div>

              {/* Mark as Posted button */}
              <button
                onClick={() => setShowMarkPosted(true)}
                className="w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                }}
              >
                <Send className="w-5 h-5" style={{ color: '#059669' }} />
                <span className="font-semibold" style={{ color: '#059669' }}>
                  Mark as Posted
                </span>
              </button>
            </div>

            {/* Content Summary for Scheduled */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <button
                onClick={() => toggleSection('scheduledSummary')}
                className="w-full p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                  >
                    <FileText className="w-4 h-4" style={{ color: '#059669' }} />
                  </div>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: '#8B7082' }}
                  >
                    Content Summary
                  </span>
                </div>
                <ChevronDown
                  className="w-5 h-5 transition-transform duration-300"
                  style={{
                    color: '#8B7082',
                    transform: expandedSections.has('scheduledSummary') ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {expandedSections.has('scheduledSummary') && (
                <div className="px-5 pb-5 space-y-4">
                  {/* Script preview */}
                  {card.script && (
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: '#8B7082' }}>Script</p>
                      <p
                        className="text-sm leading-relaxed"
                        style={{
                          color: '#1a1523',
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {card.script}
                      </p>
                    </div>
                  )}

                  {/* Platforms */}
                  {card.platforms && card.platforms.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: '#8B7082' }}>Platforms</p>
                      <div className="flex flex-wrap gap-2">
                        {card.platforms.map((platform) => (
                          <span
                            key={platform}
                            className="px-3 py-1 rounded-full text-xs"
                            style={{
                              background: 'rgba(16, 185, 129, 0.1)',
                              color: '#059669',
                            }}
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formats */}
                  {card.formats && card.formats.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2" style={{ color: '#8B7082' }}>Format</p>
                      <div className="flex flex-wrap gap-2">
                        {card.formats.map((format) => (
                          <span
                            key={format}
                            className="px-3 py-1 rounded-full text-xs flex items-center gap-1"
                            style={{
                              background: 'rgba(139, 112, 130, 0.1)',
                              color: '#1a1523',
                            }}
                          >
                            <Video className="w-3 h-3" />
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!card.script && !card.platforms?.length && !card.formats?.length && (
                    <p className="text-sm" style={{ color: '#8B7082' }}>No content details available</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Schedule confirmation modal */}
        {showScheduleConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(16, 185, 129, 0.4)', backdropFilter: 'blur(4px)' }}
          >
            <div
              className="w-full max-w-sm rounded-3xl p-6"
              style={{
                background: 'white',
                boxShadow: '0 25px 60px rgba(16, 185, 129, 0.25)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <CalendarCheck className="w-7 h-7 text-white" />
              </div>
              <h3
                className="text-xl font-semibold mb-2 text-center"
                style={{ color: '#1a1523', fontFamily: "'Playfair Display', serif" }}
              >
                Schedule Content?
              </h3>
              <p className="text-sm mb-2 text-center" style={{ color: '#6b6478' }}>
                This content will be scheduled for:
              </p>
              <p className="text-base font-semibold mb-6 text-center" style={{ color: '#059669' }}>
                {scheduledDate && new Date(scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
                {scheduledStartTime && ` at ${(() => {
                  const [h] = scheduledStartTime.split(':').map(Number);
                  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                  const ampm = h >= 12 ? 'PM' : 'AM';
                  return `${hour12}:00 ${ampm}`;
                })()}`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowScheduleConfirm(false)}
                  className="flex-1 py-3.5 rounded-xl font-medium transition-all"
                  style={{
                    background: 'rgba(139, 112, 130, 0.1)',
                    color: '#612a4f',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save the scheduled date/time first
                    onSave({
                      ...card,
                      scheduledDate: scheduledDate || undefined,
                      scheduledStartTime,
                      schedulingStatus: 'scheduled',
                    });
                    // Then move to the scheduled column
                    onMove(card.id, 'scheduled');
                    setShowScheduleConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-3.5 rounded-xl font-medium transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                  }}
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mark as Posted confirmation */}
        {showMarkPosted && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: 'rgba(97, 42, 79, 0.4)', backdropFilter: 'blur(4px)' }}
          >
            <div
              className="w-full max-w-sm rounded-3xl p-6"
              style={{
                background: 'white',
                boxShadow: '0 25px 60px rgba(97, 42, 79, 0.25)',
              }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <Send className="w-7 h-7 text-white" />
              </div>
              <h3
                className="text-xl font-semibold mb-2 text-center"
                style={{ color: '#1a1523', fontFamily: "'Playfair Display', serif" }}
              >
                Mark as Posted?
              </h3>
              <p className="text-sm mb-6 text-center" style={{ color: '#6b6478' }}>
                This will move the content to your Posted archive.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMarkPosted(false)}
                  className="flex-1 py-3.5 rounded-xl font-medium transition-all"
                  style={{
                    background: 'rgba(139, 112, 130, 0.1)',
                    color: '#612a4f',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onMove(card.id, 'posted');
                    setShowMarkPosted(false);
                    onClose();
                  }}
                  className="flex-1 py-3.5 rounded-xl font-medium transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                  }}
                >
                  Yes, Posted!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Generic notes field for Posted column only */}
        {card.columnId === 'posted' && (
          <div
            className="rounded-3xl p-5"
            style={{
              background: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
              border: '1px solid rgba(255, 255, 255, 0.6)',
            }}
          >
            <label
              className="block text-xs font-semibold mb-3 uppercase tracking-wider"
              style={{ color: '#8B7082' }}
            >
              Notes
            </label>
            <textarea
              value={card.description || card.script || ''}
              readOnly
              placeholder="No notes yet"
              rows={6}
              className="w-full px-0 py-2 text-sm leading-relaxed focus:outline-none bg-transparent resize-none placeholder:text-gray-400"
              style={{
                color: '#1a1523',
                fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>
        )}

        {/* Glass Card for Stage/Move */}
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'rgba(255, 255, 255, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(97, 42, 79, 0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <label
            className="block text-xs font-semibold mb-3 uppercase tracking-wider"
            style={{ color: '#8B7082' }}
          >
            Move to
          </label>
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            className="w-full py-3 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, rgba(97, 42, 79, 0.08) 0%, rgba(139, 112, 130, 0.06) 100%)',
              border: '1px solid rgba(139, 112, 130, 0.15)',
              padding: '12px 16px',
            }}
          >
            <span style={{ color: '#612a4f', fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
              {columnLabels[card.columnId] || card.columnId}
            </span>
            <ChevronDown
              className="w-5 h-5 transition-transform duration-300"
              style={{
                color: '#612a4f',
                transform: showMoveMenu ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            />
          </button>

          {showMoveMenu && (
            <div className="mt-4 space-y-2">
              {columns.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleMove(col.id)}
                  disabled={col.id === card.columnId}
                  className="w-full py-3 px-4 rounded-xl text-left transition-all flex items-center justify-between active:scale-[0.98]"
                  style={{
                    background: col.id === card.columnId
                      ? 'linear-gradient(135deg, #612a4f 0%, #8B7082 100%)'
                      : 'rgba(255, 255, 255, 0.6)',
                    color: col.id === card.columnId ? 'white' : '#1a1523',
                    border: col.id === card.columnId ? 'none' : '1px solid rgba(139, 112, 130, 0.1)',
                  }}
                >
                  <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: col.id === card.columnId ? 500 : 400 }}>
                    {columnLabels[col.id] || col.id}
                  </span>
                  {col.id === card.columnId && (
                    <span className="text-xs opacity-80">Current</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(97, 42, 79, 0.4)', backdropFilter: 'blur(4px)' }}>
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{
              background: 'white',
              boxShadow: '0 25px 60px rgba(97, 42, 79, 0.25)',
            }}
          >
            <h3
              className="text-xl font-semibold mb-2"
              style={{ color: '#1a1523', fontFamily: "'Playfair Display', serif" }}
            >
              Delete this idea?
            </h3>
            <p className="text-sm mb-6" style={{ color: '#6b6478' }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3.5 rounded-xl font-medium transition-all"
                style={{
                  background: 'rgba(139, 112, 130, 0.1)',
                  color: '#612a4f',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-3.5 rounded-xl font-medium transition-all hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCardEditor;
