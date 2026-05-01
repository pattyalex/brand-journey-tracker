import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Hash, FileText, BarChart3, StickyNote, Paperclip, Trash2, ImageIcon } from 'lucide-react';
import { Post, PostStatus, POST_STATUSES, STATUS_COLORS, getPillarStyle } from '@/types/posts';
import { uploadPostThumbnail } from '@/lib/postImageUpload';
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
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailUpload = useCallback(async (file: File) => {
    if (!post || !file.type.startsWith('image/')) return;
    setUploadingThumbnail(true);
    try {
      const url = await uploadPostThumbnail(file, post.id);
      onUpdate(post.id, { thumbnail_url: url });
    } finally {
      setUploadingThumbnail(false);
    }
  }, [post, onUpdate]);

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
              {/* Cover image */}
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="w-3 h-3" />
                  Cover image
                </label>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleThumbnailUpload(file);
                    e.target.value = '';
                  }}
                />
                {post.thumbnail_url ? (
                  <div
                    className="relative group/thumb w-[200px]"
                    onDragOver={e => { e.preventDefault(); setIsDraggingOver(true); }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleThumbnailUpload(file);
                    }}
                  >
                    <motion.img
                      key={post.thumbnail_url}
                      src={post.thumbnail_url}
                      alt="Cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="w-[200px] h-[200px] object-cover rounded-lg"
                    />
                    <button
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 text-white text-xs font-medium opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-150"
                    >
                      Replace
                    </button>
                    {isDraggingOver && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg border-2 border-dashed border-[#612A4F] bg-[#612A4F]/10">
                        <span className="text-xs font-medium text-[#612A4F]">Drop to replace</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => !uploadingThumbnail && thumbnailInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDraggingOver(true); }}
                    onDragLeave={() => setIsDraggingOver(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDraggingOver(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleThumbnailUpload(file);
                    }}
                    className={`w-[200px] h-[200px] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors duration-150 ${
                      isDraggingOver
                        ? 'border-[#612A4F] bg-[#612A4F]/5'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                    }`}
                  >
                    {uploadingThumbnail ? (
                      <span className="text-xs text-gray-400">Uploading...</span>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5 text-gray-300 mb-1.5" />
                        <span className="text-xs text-gray-400">+ Add cover image</span>
                      </>
                    )}
                  </div>
                )}
              </div>

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

              {/* Attach Inspiration */}
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Paperclip className="w-3 h-3" />
                  Attach Inspiration
                </label>
                {post.attachedFiles && post.attachedFiles.length > 0 && (
                  <div className="space-y-1.5 mb-2">
                    {post.attachedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 group/file">
                        <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        <span className="flex-1 truncate">{file}</span>
                        <button
                          onClick={() => {
                            const updated = post.attachedFiles!.filter((_, idx) => idx !== i);
                            onUpdate(post.id, { attachedFiles: updated });
                          }}
                          className="opacity-0 group-hover/file:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                        >
                          <span className="text-xs">&times;</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste a link or type a filename..."
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:border-[#612A4F] focus:ring-0 outline-none transition-colors placeholder:text-gray-300"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = (e.target as HTMLInputElement).value.trim();
                        if (value) {
                          onUpdate(post.id, { attachedFiles: [...(post.attachedFiles || []), value] });
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                  <label className="flex items-center gap-1 px-3 py-1.5 text-[12px] text-gray-500 hover:text-[#612A4F] border border-gray-200 rounded-lg cursor-pointer hover:border-[#612A4F]/30 transition-colors">
                    <Paperclip className="w-3 h-3" />
                    File
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          onUpdate(post.id, { attachedFiles: [...(post.attachedFiles || []), file.name] });
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
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
