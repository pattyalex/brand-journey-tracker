import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Hash, FileText, BarChart3, StickyNote, Paperclip, Trash2 } from 'lucide-react';
import { Post, PostStatus, POST_STATUSES, STATUS_COLORS, getPillarStyle } from '@/types/posts';
import FormatDropdown from './FormatDropdown';
import PillarDropdown from './PillarDropdown';
import StatusDropdown from './StatusDropdown';

interface PostDetailPanelProps {
  post: Post | null;
  pillars: string[];
  formats: string[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Post>) => void;
  onDelete: (id: string) => void;
  onAddFormat: (name: string) => void;
  onDeleteFormat: (name: string) => void;
  onDeletePillar: (name: string) => void;
}

const PostDetailPanel: React.FC<PostDetailPanelProps> = ({ post, pillars, formats, onClose, onUpdate, onDelete, onAddFormat, onDeleteFormat, onDeletePillar }) => {
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    if (post) {
      setCaptionDraft(post.caption || '');
      setNotesDraft(post.notes || '');
      setEditingCaption(false);
      setEditingNotes(false);
    }
  }, [post?.id]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (post) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [post, onClose]);

  return (
    <AnimatePresence>
      {post && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[50] bg-black/15 backdrop-blur-[3px]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 bottom-0 z-[55] w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10">
              <div className="flex-1 min-w-0 pr-4">
                <input
                  type="text"
                  value={post.title}
                  onChange={e => onUpdate(post.id, { title: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onClose(); } }}
                  className="text-lg font-semibold text-gray-900 bg-transparent outline-none w-full truncate hover:bg-gray-50 focus:bg-gray-50 rounded px-1 -ml-1 transition-colors duration-150"
                />
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Meta row: Pillar, Format, Status */}
              <div className="grid grid-cols-3 gap-4">
                {/* Pillar */}
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Pillar</label>
                  <PillarDropdown
                    value={post.pillar}
                    pillars={pillars}
                    onChange={val => onUpdate(post.id, { pillar: val })}
                    onDelete={onDeletePillar}
                  />
                </div>

                {/* Format */}
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Format</label>
                  <FormatDropdown
                    value={post.format}
                    formats={formats}
                    onChange={val => onUpdate(post.id, { format: val })}
                    onAdd={onAddFormat}
                    onDelete={onDeleteFormat}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 block">Status</label>
                  <StatusDropdown
                    value={post.status}
                    onChange={val => onUpdate(post.id, { status: val })}
                  />
                </div>
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={post.scheduledDate || ''}
                  onChange={e => onUpdate(post.id, { scheduledDate: e.target.value || undefined })}
                  className="text-sm text-gray-700 bg-transparent outline-none hover:bg-gray-50 rounded px-1 py-0.5 transition-colors duration-150"
                />
              </div>

              {/* Caption */}
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3 h-3" />
                  Caption
                </label>
                {editingCaption ? (
                  <textarea
                    value={captionDraft}
                    onChange={e => setCaptionDraft(e.target.value)}
                    onBlur={() => {
                      onUpdate(post.id, { caption: captionDraft });
                      setEditingCaption(false);
                    }}
                    autoFocus
                    rows={4}
                    className="w-full text-sm text-gray-700 bg-gray-50 rounded-md p-2.5 outline-none border border-gray-200 focus:border-gray-300 resize-none transition-colors duration-150"
                  />
                ) : (
                  <p
                    onClick={() => setEditingCaption(true)}
                    className="text-sm text-gray-600 leading-relaxed cursor-text hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors duration-150 min-h-[2.5rem]"
                  >
                    {post.caption || <span className="text-gray-300 italic">Add a caption...</span>}
                  </p>
                )}
              </div>

              {/* Hashtags */}
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Hash className="w-3 h-3" />
                  Hashtags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {post.hashtags && post.hashtags.length > 0 ? (
                    post.hashtags.map((tag, i) => (
                      <span key={i} className="text-xs text-[#612a4f] bg-[#612a4f]/8 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-300 italic">No hashtags</span>
                  )}
                </div>
              </div>

              {/* Attached Files */}
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Paperclip className="w-3 h-3" />
                  Attached Files
                </label>
                {post.attachedFiles && post.attachedFiles.length > 0 ? (
                  <div className="space-y-1">
                    {post.attachedFiles.map((file, i) => (
                      <div key={i} className="text-sm text-gray-600">{file}</div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 italic">No files attached</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <StickyNote className="w-3 h-3" />
                  Notes
                </label>
                {editingNotes ? (
                  <textarea
                    value={notesDraft}
                    onChange={e => setNotesDraft(e.target.value)}
                    onBlur={() => {
                      onUpdate(post.id, { notes: notesDraft });
                      setEditingNotes(false);
                    }}
                    autoFocus
                    rows={3}
                    className="w-full text-sm text-gray-700 bg-gray-50 rounded-md p-2.5 outline-none border border-gray-200 focus:border-gray-300 resize-none transition-colors duration-150"
                  />
                ) : (
                  <p
                    onClick={() => setEditingNotes(true)}
                    className="text-sm text-gray-600 leading-relaxed cursor-text hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors duration-150 min-h-[2rem]"
                  >
                    {post.notes || <span className="text-gray-300 italic">Add notes...</span>}
                  </p>
                )}
              </div>

              {/* Metrics (only for Posted) */}
              {post.metrics && post.status === 'Posted' && (
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BarChart3 className="w-3 h-3" />
                    Metrics
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { label: 'Likes', value: post.metrics.likes },
                      { label: 'Comments', value: post.metrics.comments },
                      { label: 'Shares', value: post.metrics.shares },
                      { label: 'Saves', value: post.metrics.saves },
                      { label: 'Reach', value: post.metrics.reach },
                    ].map(m => (
                      <div key={m.label} className="text-center p-2 rounded-lg bg-gray-50">
                        <div className="text-sm font-semibold text-gray-800 tabular-nums">
                          {m.value?.toLocaleString() ?? '—'}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete */}
              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => onDelete(post.id)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors duration-150"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete post
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PostDetailPanel;
