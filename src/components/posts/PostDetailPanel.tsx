import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Hash, FileText, BarChart3, StickyNote, Paperclip, Trash2, ImageIcon, Pencil, ExternalLink, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [editingScript, setEditingScript] = useState(false);
  const [scriptDraft, setScriptDraft] = useState('');
  const [editingCaption, setEditingCaption] = useState(false);
  const [captionDraft, setCaptionDraft] = useState('');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [renamingFileIndex, setRenamingFileIndex] = useState<number | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [uploadingInspiration, setUploadingInspiration] = useState(false);
  const [localBlobUrls, setLocalBlobUrls] = useState<Record<string, string>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const inspirationImages = useMemo(() => {
    if (!post?.attachedFiles) return [];
    return post.attachedFiles
      .map((file) => {
        const hasLabel = file.includes('||');
        const displayName = hasLabel ? file.split('||')[0] : file;
        const url = hasLabel ? file.split('||')[1] : file;
        const isUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:');
        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(displayName) || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('/post-thumbnails/');
        return { displayName, url, isUrl, isImage };
      })
      .filter(x => x.isImage && x.isUrl)
      .map(x => localBlobUrls[x.displayName] || x.url);
  }, [post?.attachedFiles, localBlobUrls]);

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
      setScriptDraft(post.script || '');
      setCaptionDraft(post.caption || '');
      setNotesDraft(post.notes || '');
      setEditingScript(false);
      setEditingCaption(false);
      setEditingNotes(false);
    }
  }, [post?.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) {
        if (e.key === 'Escape') setLightboxIndex(null);
        else if (e.key === 'ArrowLeft') setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : inspirationImages.length - 1);
        else if (e.key === 'ArrowRight') setLightboxIndex(lightboxIndex < inspirationImages.length - 1 ? lightboxIndex + 1 : 0);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    if (post) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [post, onClose, lightboxIndex, inspirationImages.length]);

  return (
    <>
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
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[55] m-auto w-full max-w-4xl h-[calc(100vh-6rem)] bg-white shadow-2xl overflow-y-auto rounded-2xl"
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

            <div className="px-8 py-6 space-y-8">

              {/* Row 1: Cover Image + Properties */}
              <div className="flex gap-8">
                {/* Cover image */}
                <div className="flex-shrink-0">
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
                      className="relative group/thumb w-[220px]"
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
                        className="w-[220px] h-[220px] object-cover rounded-xl shadow-sm"
                      />
                      <button
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 text-white text-xs font-medium opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-150"
                      >
                        Replace
                      </button>
                      {isDraggingOver && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-dashed border-[#612A4F] bg-[#612A4F]/10">
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
                      className={`w-[220px] h-[220px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors duration-150 ${
                        isDraggingOver
                          ? 'border-[#612A4F] bg-[#612A4F]/5'
                          : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                      }`}
                    >
                      {uploadingThumbnail ? (
                        <span className="text-xs text-gray-400">Uploading...</span>
                      ) : (
                        <>
                          <ImageIcon className="w-6 h-6 text-gray-300 mb-2" />
                          <span className="text-xs text-gray-400">Add cover image</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Properties */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider w-16 flex-shrink-0">Pillar</span>
                      <PillarDropdown
                        value={post.pillar}
                        pillars={pillars}
                        onChange={val => onUpdate(post.id, { pillar: val })}
                        onDelete={onDeletePillar}
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider w-16 flex-shrink-0">Format</span>
                      <FormatDropdown
                        value={post.format}
                        formats={formats}
                        onChange={val => onUpdate(post.id, { format: val })}
                        onAdd={onAddFormat}
                        onDelete={onDeleteFormat}
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider w-16 flex-shrink-0">Status</span>
                      <StatusDropdown
                        value={post.status}
                        onChange={val => onUpdate(post.id, { status: val })}
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider w-16 flex-shrink-0">Date</span>
                      <input
                        type="date"
                        value={post.scheduledDate || ''}
                        onChange={e => onUpdate(post.id, { scheduledDate: e.target.value || undefined })}
                        className="text-sm text-gray-700 bg-transparent outline-none hover:bg-gray-50 rounded px-1 py-0.5 transition-colors duration-150"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Inspiration section */}
              <div>
                <label className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Paperclip className="w-3 h-3" />
                  Inspiration
                </label>

                {/* Image grid + links */}
                {post.attachedFiles && post.attachedFiles.length > 0 && (
                  <div className="mb-3">
                    {/* Image thumbnails as a grid */}
                    {(() => {
                      const items = post.attachedFiles.map((file, i) => {
                        const hasLabel = file.includes('||');
                        const displayName = hasLabel ? file.split('||')[0] : file;
                        const url = hasLabel ? file.split('||')[1] : file;
                        const isUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:');
                        const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(displayName) || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || url.includes('/post-thumbnails/');
                        return { file, i, displayName, url, isUrl, isImage };
                      });
                      const images = items.filter(x => x.isImage && x.isUrl);
                      const links = items.filter(x => !x.isImage || !x.isUrl);

                      return (
                        <>
                          {images.length > 0 && (
                            <div className="grid grid-cols-6 gap-2 mb-3">
                              {images.map(({ i, displayName, url }) => (
                                <div key={i} className="relative group/file rounded-lg overflow-hidden">
                                  <button onClick={() => setLightboxIndex(inspirationImages.indexOf(localBlobUrls[displayName] || url))} className="w-full">
                                    <img
                                      src={localBlobUrls[displayName] || url}
                                      alt={displayName}
                                      className="w-full aspect-square object-cover hover:scale-105 transition-transform duration-200 cursor-pointer bg-gray-100"
                                      onError={(e) => {
                                        const el = e.currentTarget;
                                        el.style.display = 'none';
                                        const placeholder = document.createElement('div');
                                        placeholder.className = 'w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center';
                                        placeholder.innerHTML = '<span class="text-[10px] text-gray-400 text-center px-1">Image unavailable</span>';
                                        el.parentElement?.appendChild(placeholder);
                                      }}
                                    />
                                  </button>
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/file:opacity-100 transition-opacity duration-150">
                                    <button
                                      onClick={() => setLightboxIndex(inspirationImages.indexOf(localBlobUrls[displayName] || url))}
                                      className="absolute top-1.5 right-1.5 p-1 rounded bg-black/40 hover:bg-black/60 text-white transition-colors"
                                      title="Expand"
                                    >
                                      <Maximize2 className="w-3 h-3" />
                                    </button>
                                    <div className="absolute bottom-0 left-0 right-0 p-2 flex items-end justify-between">
                                      <span className="text-[10px] text-white/90 truncate flex-1 mr-1">{displayName}</span>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => { setRenamingFileIndex(i); setRenameDraft(displayName); }}
                                          className="p-1 rounded bg-white/20 hover:bg-white/40 text-white transition-colors"
                                        >
                                          <Pencil className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => onUpdate(post.id, { attachedFiles: post.attachedFiles!.filter((_, idx) => idx !== i) })}
                                          className="p-1 rounded bg-white/20 hover:bg-red-500/80 text-white transition-colors"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  {renamingFileIndex === i && (
                                    <div className="absolute inset-0 bg-white/95 flex items-center p-2">
                                      <input
                                        type="text"
                                        value={renameDraft}
                                        onChange={e => setRenameDraft(e.target.value)}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                            const newLabel = renameDraft.trim() || url;
                                            const updated = [...post.attachedFiles!];
                                            updated[i] = newLabel === url ? url : `${newLabel}||${url}`;
                                            onUpdate(post.id, { attachedFiles: updated });
                                            setRenamingFileIndex(null);
                                          } else if (e.key === 'Escape') {
                                            setRenamingFileIndex(null);
                                          }
                                        }}
                                        onBlur={() => {
                                          const newLabel = renameDraft.trim() || url;
                                          const updated = [...post.attachedFiles!];
                                          updated[i] = newLabel === url ? url : `${newLabel}||${url}`;
                                          onUpdate(post.id, { attachedFiles: updated });
                                          setRenamingFileIndex(null);
                                        }}
                                        autoFocus
                                        className="w-full text-xs border border-gray-300 rounded px-2 py-1 outline-none focus:border-[#612A4F]"
                                        placeholder="Rename..."
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {links.map(({ i, displayName, url, isUrl }) => {
                            if (renamingFileIndex === i) {
                              return (
                                <div key={i} className="flex items-center gap-1.5 mb-1.5">
                                  <input
                                    type="text"
                                    value={renameDraft}
                                    onChange={e => setRenameDraft(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') {
                                        const newLabel = renameDraft.trim() || url;
                                        const updated = [...post.attachedFiles!];
                                        updated[i] = newLabel === url ? url : `${newLabel}||${url}`;
                                        onUpdate(post.id, { attachedFiles: updated });
                                        setRenamingFileIndex(null);
                                      } else if (e.key === 'Escape') {
                                        setRenamingFileIndex(null);
                                      }
                                    }}
                                    onBlur={() => {
                                      const newLabel = renameDraft.trim() || url;
                                      const updated = [...post.attachedFiles!];
                                      updated[i] = newLabel === url ? url : `${newLabel}||${url}`;
                                      onUpdate(post.id, { attachedFiles: updated });
                                      setRenamingFileIndex(null);
                                    }}
                                    autoFocus
                                    className="flex-1 text-sm border border-gray-200 rounded px-2 py-0.5 outline-none focus:border-[#612A4F] min-w-0"
                                  />
                                </div>
                              );
                            }
                            return (
                              <div key={i} className="flex items-center gap-1.5 text-sm group/file mb-1.5">
                                {isUrl ? (
                                  <a href={url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate text-[#612A4F] hover:underline flex items-center gap-1" title={url}>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                    {displayName}
                                  </a>
                                ) : (
                                  <span className="flex-1 truncate text-gray-600 flex items-center gap-1">
                                    <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                    {displayName}
                                  </span>
                                )}
                                <button onClick={() => { setRenamingFileIndex(i); setRenameDraft(displayName); }} className="opacity-0 group-hover/file:opacity-100 text-gray-300 hover:text-gray-500 transition-all" title="Rename">
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button onClick={() => onUpdate(post.id, { attachedFiles: post.attachedFiles!.filter((_, idx) => idx !== i) })} className="opacity-0 group-hover/file:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                                  <span className="text-xs">&times;</span>
                                </button>
                              </div>
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Add inspiration */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste a link..."
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
                  <label className={`flex items-center gap-1 px-3 py-1.5 text-[12px] border border-gray-200 rounded-lg transition-colors whitespace-nowrap ${uploadingInspiration ? 'text-gray-400 cursor-wait' : 'text-gray-500 hover:text-[#612A4F] cursor-pointer hover:border-[#612A4F]/30'}`}>
                    <Paperclip className="w-3 h-3" />
                    {uploadingInspiration ? 'Uploading...' : 'Attach file'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file && post) {
                          const isImg = file.type.startsWith('image/');
                          const blobUrl = URL.createObjectURL(file);
                          const tempEntry = `${file.name}||${blobUrl}`;
                          if (isImg) {
                            setLocalBlobUrls(prev => ({ ...prev, [file.name]: blobUrl }));
                          }
                          onUpdate(post.id, { attachedFiles: [...(post.attachedFiles || []), tempEntry] });
                          setUploadingInspiration(true);
                          try {
                            const uploadedUrl = await uploadPostThumbnail(file, `${post.id}-inspiration-${Date.now()}`);
                            if (uploadedUrl && !uploadedUrl.startsWith('blob:')) {
                              const realEntry = `${file.name}||${uploadedUrl}`;
                              const current = [...(post.attachedFiles || []), tempEntry];
                              const updated = current.map(f => f === tempEntry ? realEntry : f);
                              onUpdate(post.id, { attachedFiles: updated });
                            }
                          } catch {
                            // Keep blob URL
                          } finally {
                            setUploadingInspiration(false);
                          }
                        }
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Script */}
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3 h-3" />
                  Script
                </label>
                {editingScript ? (
                  <textarea
                    value={scriptDraft}
                    onChange={e => setScriptDraft(e.target.value)}
                    onBlur={() => {
                      onUpdate(post.id, { script: scriptDraft });
                      setEditingScript(false);
                    }}
                    autoFocus
                    rows={6}
                    className="w-full text-sm text-gray-700 bg-gray-50 rounded-md p-2.5 outline-none border border-gray-200 focus:border-gray-300 resize-none transition-colors duration-150"
                  />
                ) : (
                  <p
                    onClick={() => setEditingScript(true)}
                    className="text-sm text-gray-600 leading-relaxed cursor-text hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors duration-150 min-h-[2.5rem] whitespace-pre-wrap"
                  >
                    {post.script || <span className="text-gray-300 italic">Add a script...</span>}
                  </p>
                )}
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

    {/* Lightbox */}
    {lightboxIndex !== null && inspirationImages[lightboxIndex] && (
      <div
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center"
        onClick={() => setLightboxIndex(null)}
      >
        <div className="relative flex items-center gap-6" onClick={e => e.stopPropagation()}>
          {/* Previous */}
          <button
            onClick={() => setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : inspirationImages.length - 1)}
            className="p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          {/* Image */}
          <img
            src={inspirationImages[lightboxIndex]}
            alt="Inspiration"
            className="max-w-[70vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
          />

          {/* Next */}
          <button
            onClick={() => setLightboxIndex(lightboxIndex < inspirationImages.length - 1 ? lightboxIndex + 1 : 0)}
            className="p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>

        {/* Close */}
        <button
          onClick={() => setLightboxIndex(null)}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Counter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/15 text-white text-sm">
          {lightboxIndex + 1} / {inspirationImages.length}
        </div>
      </div>
    )}
    </>
  );
};

export default PostDetailPanel;
