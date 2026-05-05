import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, Trash2, Clock, X, Plus, Tag } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, getTagColor } from '@/types/tasks';
import { formatTimeShort, parseTaskInput } from '@/lib/taskParser';
import TaskCheckbox from './TaskCheckbox';

interface TaskRowProps {
  task: Task;
  depth?: number;
  subtaskCount?: number;
  completedSubtaskCount?: number;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onIndent: (id: string) => void;
  onOutdent: (id: string) => void;
  onAddSubtask?: (parentId: string, title: string) => void;
  isDraggable?: boolean;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  depth = 0,
  subtaskCount,
  completedSubtaskCount,
  onToggle,
  onUpdate,
  onDelete,
  onIndent,
  onOutdent,
  onAddSubtask,
  isDraggable = false,
}) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [editingTime, setEditingTime] = useState(false);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskVal, setSubtaskVal] = useState('');
  const [editingTag, setEditingTag] = useState(false);
  const [tagVal, setTagVal] = useState(task.tag || '');
  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const [startTimeVal, setStartTimeVal] = useState(task.time || '');
  const [endTimeVal, setEndTimeVal] = useState(task.end_time || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !isDraggable,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    paddingLeft: depth * 32,
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(editValue.length, editValue.length);
    }
  }, [editing]);

  useEffect(() => {
    if (editingTime && startTimeRef.current) {
      startTimeRef.current.focus();
    }
  }, [editingTime]);

  useEffect(() => {
    if (addingSubtask && subtaskInputRef.current) subtaskInputRef.current.focus();
  }, [addingSubtask]);

  // Sync time state when task changes externally
  useEffect(() => {
    setStartTimeVal(task.time || '');
    setEndTimeVal(task.end_time || '');
  }, [task.time, task.end_time]);

  const startEdit = () => {
    let reconstructed = task.title;
    if (task.tag) reconstructed += ` #${task.tag}`;
    if (task.duration) reconstructed += ` ${task.duration}`;
    setEditValue(reconstructed);
    setEditing(true);
  };

  const saveEdit = () => {
    if (editValue.trim() === '') {
      onDelete(task.id);
    } else {
      const parsed = parseTaskInput(editValue);
      onUpdate(task.id, {
        title: parsed.title,
        time: parsed.time ?? task.time,
        end_time: parsed.end_time ?? task.end_time,
        duration: parsed.duration,
        tag: parsed.tag,
      });
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      setEditing(false);
      setEditValue(task.title);
    } else if (e.key === 'Backspace' && editValue === '') {
      e.preventDefault();
      onDelete(task.id);
      setEditing(false);
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      onIndent(task.id);
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      onOutdent(task.id);
    }
  };

  const openTimeEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartTimeVal(task.time || '');
    setEndTimeVal(task.end_time || '');
    setEditingTime(true);
  };

  const saveTime = () => {
    const newTime = startTimeVal || null;
    const newEndTime = endTimeVal || null;
    // Compute duration if both set
    let newDuration: string | null = task.duration;
    if (newTime && newEndTime) {
      const [sh, sm] = newTime.split(':').map(Number);
      const [eh, em] = newEndTime.split(':').map(Number);
      const startMins = sh * 60 + sm;
      const endMins = eh * 60 + em;
      const diff = endMins > startMins ? endMins - startMins : endMins + 1440 - startMins;
      if (diff >= 60) {
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        newDuration = mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
      } else {
        newDuration = `${diff}m`;
      }
    }
    onUpdate(task.id, { time: newTime, end_time: newEndTime, duration: newDuration });
    setEditingTime(false);
  };

  const clearTime = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(task.id, { time: null, end_time: null, duration: null });
    setEditingTime(false);
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); saveTime(); }
    if (e.key === 'Escape') { e.preventDefault(); setEditingTime(false); }
  };

  const tagColor = task.tag ? getTagColor(task.tag) : null;
  const isSubtask = depth > 0;
  const textSize = isSubtask ? 'text-[13px]' : 'text-[14px]';
  const textColor = task.completed
    ? 'text-gray-300'
    : isSubtask
      ? 'text-gray-500'
      : 'text-gray-800';

  // Format time display
  let timeDisplay: React.ReactNode = null;
  if (task.time) {
    if (task.end_time) {
      const sH = parseInt(task.time.split(':')[0], 10);
      const eH = parseInt(task.end_time.split(':')[0], 10);
      const samePeriod = (sH < 12) === (eH < 12);
      if (samePeriod) {
        const startBare = formatTimeShort(task.time).replace(/ (AM|PM)$/, '');
        timeDisplay = <>{startBare}–{formatTimeShort(task.end_time)}</>;
      } else {
        timeDisplay = <>{formatTimeShort(task.time)}–{formatTimeShort(task.end_time)}</>;
      }
    } else {
      timeDisplay = formatTimeShort(task.time);
    }
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-center gap-2.5 py-1.5 px-2 -mx-2 rounded-lg group hover:bg-[#f9f7f5] transition-colors duration-150">
        {/* Grip icon + Time column — no gap between them */}
        {/* Grip + Time: fixed total width, content right-aligned */}
        <div className="w-[108px] flex-shrink-0 flex items-center justify-end gap-0">
          {isDraggable && (
            <span {...listeners} className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <GripVertical className="w-3.5 h-3.5 text-gray-300" />
            </span>
          )}
          <span
            onClick={openTimeEditor}
            className="text-[10px] font-medium tabular-nums text-gray-400 whitespace-nowrap cursor-pointer hover:text-[#612A4F] transition-colors relative group/time"
          >
            {timeDisplay || (
              <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-0.5 text-gray-300 hover:text-[#612A4F]">
                <Clock className="w-2.5 h-2.5" />
              </span>
            )}
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+4px)] px-2 py-0.5 rounded bg-gray-500 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover/time:opacity-100 transition-opacity duration-100 pointer-events-none z-30">
              Click To Set Time
            </span>
          </span>
        </div>

        {/* Checkbox */}
        <TaskCheckbox
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          size={isSubtask ? 'sm' : 'md'}
        />

        {/* Title / Edit */}
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={handleKeyDown}
            className={`flex-1 bg-transparent border-none outline-none ${textSize} text-gray-800`}
          />
        ) : (
          <span
            onClick={startEdit}
            className={`flex-1 cursor-text ${textSize} ${textColor} ${task.completed ? 'line-through' : ''} transition-colors duration-200`}
          >
            {task.title}
          </span>
        )}

        {/* Add subtask button — only on top-level tasks */}
        {onAddSubtask && depth === 0 && !editing && (
          <button
            onClick={e => { e.stopPropagation(); setAddingSubtask(true); }}
            className="flex-shrink-0 p-1 rounded text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-150"
            title="Add subtask"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Add tag button — when no tag */}
        {!task.tag && !editing && !editingTag && (
          <div className="relative group/addtag flex-shrink-0">
            <button
              onClick={e => { e.stopPropagation(); setEditingTag(true); setTagVal(''); }}
              className="p-1 rounded text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all duration-150"
            >
              <Tag className="w-3 h-3" />
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+4px)] px-2 py-0.5 rounded bg-gray-500 text-white text-[10px] font-medium whitespace-nowrap opacity-0 group-hover/addtag:opacity-100 transition-opacity duration-100 pointer-events-none z-30">
              Add Tag
            </span>
          </div>
        )}

        {/* Tag pill */}
        {task.tag && !editing && !editingTag && tagColor && (
          <span
            className="inline-flex items-center gap-1 text-[11px] px-1.5 py-px rounded-lg flex-shrink-0 group/tag cursor-pointer"
            style={{ backgroundColor: tagColor.bg, color: tagColor.text }}
            onClick={e => { e.stopPropagation(); setEditingTag(true); setTagVal(task.tag || ''); }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tagColor.dot }} />
            {task.tag}
            <button
              onClick={e => { e.stopPropagation(); onUpdate(task.id, { tag: null }); }}
              className="opacity-0 group-hover/tag:opacity-100 transition-opacity"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        )}
        {editingTag && (
          <input
            autoFocus
            value={tagVal}
            onChange={e => setTagVal(e.target.value.replace(/\s/g, ''))}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); onUpdate(task.id, { tag: tagVal.trim() || null }); setEditingTag(false); }
              if (e.key === 'Escape') { setEditingTag(false); }
            }}
            onBlur={() => { onUpdate(task.id, { tag: tagVal.trim() || null }); setEditingTag(false); }}
            className="text-[11px] px-1.5 py-px rounded-lg border border-gray-200 outline-none focus:border-[#612A4F] w-[80px] flex-shrink-0"
            placeholder="tag"
          />
        )}

        {/* Duration */}
        {task.duration && !editing && (
          <span className="text-[11px] text-gray-400 flex-shrink-0">{task.duration}</span>
        )}

        {/* Delete button */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(task.id); }}
          className="flex-shrink-0 p-1 rounded text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Time editor popover */}
      <AnimatePresence>
        {editingTime && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
            style={{ paddingLeft: depth * 32 }}
          >
            <div className="flex items-center gap-2 py-1.5 px-2 ml-[14px]">
              <label className="text-[10px] text-gray-400 font-medium">Start</label>
              <input
                ref={startTimeRef}
                type="time"
                value={startTimeVal}
                onChange={e => setStartTimeVal(e.target.value)}
                onKeyDown={handleTimeKeyDown}
                className="text-[12px] text-gray-700 bg-white border border-gray-200 rounded-md px-1.5 py-0.5 outline-none focus:border-[#612A4F] transition-colors w-[90px]"
              />
              <label className="text-[10px] text-gray-400 font-medium">End</label>
              <input
                type="time"
                value={endTimeVal}
                onChange={e => setEndTimeVal(e.target.value)}
                onKeyDown={handleTimeKeyDown}
                className="text-[12px] text-gray-700 bg-white border border-gray-200 rounded-md px-1.5 py-0.5 outline-none focus:border-[#612A4F] transition-colors w-[90px]"
              />
              <button
                onClick={saveTime}
                className="text-[11px] font-medium text-[#612A4F] hover:underline px-1"
              >
                Save
              </button>
              {task.time && (
                <button
                  onClick={clearTime}
                  className="p-0.5 text-gray-300 hover:text-red-400 transition-colors"
                  title="Remove time"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => setEditingTime(false)}
                className="text-[11px] text-gray-400 hover:text-gray-600 px-1"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtask summary for parent */}
      {subtaskCount != null && subtaskCount > 0 && !task.completed && completedSubtaskCount != null && completedSubtaskCount < subtaskCount && (
        <p className="text-[10px] text-gray-300" style={{ paddingLeft: (depth * 32) + 90 + 14 + 16 + 10 + 14 }}>
          {completedSubtaskCount} of {subtaskCount} subtasks done
        </p>
      )}

      {/* Inline subtask input */}
      <AnimatePresence>
        {addingSubtask && onAddSubtask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.12 }}
            className="overflow-hidden"
            style={{ paddingLeft: 32 }}
          >
            <div className="flex items-center gap-2 py-1 px-2">
              <span className="w-[90px] flex-shrink-0" />
              <Plus className="w-3 h-3 text-gray-300 flex-shrink-0" />
              <input
                ref={subtaskInputRef}
                value={subtaskVal}
                onChange={e => setSubtaskVal(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); if (subtaskVal.trim()) { onAddSubtask(task.id, subtaskVal.trim()); setSubtaskVal(''); } }
                  if (e.key === 'Escape') { setSubtaskVal(''); setAddingSubtask(false); }
                }}
                onBlur={() => { if (!subtaskVal.trim()) setAddingSubtask(false); }}
                placeholder="Add subtask..."
                className="flex-1 bg-transparent border-none outline-none text-[13px] text-gray-500 placeholder:text-gray-300"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskRow;
