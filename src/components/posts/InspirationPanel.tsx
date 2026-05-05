import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ExternalLink, Trash2, Link as LinkIcon, Image, Paperclip } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getJSON, setJSON } from '@/lib/storage';
import { API_BASE } from '@/lib/api-base';
import { uploadPostThumbnail } from '@/lib/postImageUpload';

export interface InspirationItem {
  id: string;
  url: string;
  title: string;
  type: 'link' | 'photo' | 'file';
  platform: 'tiktok' | 'instagram' | 'youtube' | 'other';
  fileName?: string;
  notes?: string;
  savedAt: string;
}

const STORAGE_KEY = 'meg_inspiration';

function detectPlatform(url: string): InspirationItem['platform'] {
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'other';
}

function extractTitle(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return hostname;
  } catch {
    return url;
  }
}

const platformLabels: Record<InspirationItem['platform'], string> = {
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  other: 'Link',
};

const platformColors: Record<InspirationItem['platform'], string> = {
  tiktok: '#000000',
  instagram: '#E1306C',
  youtube: '#FF0000',
  other: '#6B7280',
};

const LinkThumbnail: React.FC<{ item: InspirationItem }> = ({ item }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(item.url)}&screenshot=true&meta=false&embed=screenshot.url`;

  useEffect(() => {
    fetch(`${API_BASE}/api/video-thumbnail?url=${encodeURIComponent(item.url)}`)
      .then(r => r.json())
      .then(data => setImgSrc(data.thumbnail_url || microlinkUrl))
      .catch(() => setImgSrc(microlinkUrl));
  }, [item.url]);

  if (failed) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
          style={{ backgroundColor: platformColors[item.platform] }}
        >
          {platformLabels[item.platform][0]}
        </div>
      </div>
    );
  }

  if (!imgSrc) {
    return <div className="w-full h-full bg-gray-100 animate-pulse" />;
  }

  return (
    <img
      src={imgSrc}
      alt={item.title}
      className="w-full h-full object-cover object-top"
      onError={() => {
        if (imgSrc !== microlinkUrl) {
          setImgSrc(microlinkUrl);
        } else {
          setFailed(true);
        }
      }}
    />
  );
};

interface InspirationPanelProps {
  open: boolean;
  onClose: () => void;
  onCreatePost: (inspirationUrl: string, notes?: string) => void;
}

const InspirationPanel: React.FC<InspirationPanelProps> = ({ open, onClose, onCreatePost }) => {
  const [items, setItems] = useState<InspirationItem[]>(() => getJSON<InspirationItem[]>(STORAGE_KEY, []));
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'link' | 'photo' | 'file'>('all');

  useEffect(() => {
    setJSON(STORAGE_KEY, items);
  }, [items]);

  // Re-read from storage when panel opens
  useEffect(() => {
    if (open) {
      setItems(getJSON<InspirationItem[]>(STORAGE_KEY, []));
    }
  }, [open]);

  const handleAdd = () => {
    const url = inputValue.trim();
    if (!url) return;
    const newItem: InspirationItem = {
      id: crypto.randomUUID(),
      url,
      title: extractTitle(url),
      type: 'link',
      platform: detectPlatform(url),
      savedAt: new Date().toISOString(),
    };
    setItems(prev => [newItem, ...prev]);
    setInputValue('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith('image/');
      const id = crypto.randomUUID();
      const blobUrl = isImage ? URL.createObjectURL(file) : '';
      const newItem: InspirationItem = {
        id,
        url: blobUrl,
        title: file.name,
        type: isImage ? 'photo' : 'file',
        platform: 'other',
        fileName: file.name,
        savedAt: new Date().toISOString(),
      };
      setItems(prev => [newItem, ...prev]);
      // Upload to server and replace blob URL with permanent URL
      if (isImage) {
        try {
          const uploadedUrl = await uploadPostThumbnail(file, `inspiration-${id}`);
          if (uploadedUrl && !uploadedUrl.startsWith('blob:')) {
            setItems(prev => prev.map(item => item.id === id ? { ...item, url: uploadedUrl } : item));
          }
        } catch {
          // Keep blob URL as fallback for this session
        }
      }
    }
    e.target.value = '';
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleNotesChange = (id: string, notes: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, notes } : i));
  };

  const handleCreatePost = (item: InspirationItem) => {
    onCreatePost(item.url, item.notes);
    onClose();
  };

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <DialogTitle className="text-lg font-semibold text-gray-800">Inspiration</DialogTitle>
          <DialogDescription className="text-[12px] text-gray-400 mt-0.5">
            Save links, photos, and files for future content ideas
          </DialogDescription>
        </DialogHeader>

        {/* Add input */}
        <div className="px-6 py-4 border-b border-gray-50 flex-shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              placeholder="Paste a link..."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:border-[#612A4F] focus:ring-0 outline-none transition-colors placeholder:text-gray-300"
            />
            <button
              onClick={handleAdd}
              disabled={!inputValue.trim()}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                inputValue.trim()
                  ? 'bg-[#612A4F] text-white hover:bg-[#4e2140]'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <Plus size={16} />
            </button>
            <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#612A4F] hover:border-[#612A4F]/30 cursor-pointer transition-colors">
              <Image size={16} />
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                multiple
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Filters */}
        {items.length > 0 && (
          <div className="px-6 pt-3 pb-1 flex-shrink-0 flex items-center gap-1.5">
            {([['all', 'All'], ['link', 'Links'], ['photo', 'Images'], ['file', 'Files']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                  filter === key
                    ? 'bg-[#612A4F] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredItems.length === 0 && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
                <LinkIcon size={22} className="text-gray-300" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-gray-500 mb-1">No inspiration saved yet</p>
                <p className="text-[11px] text-gray-400 max-w-[240px] mx-auto leading-relaxed">
                  Paste links from TikTok, Instagram, or upload photos and files to save them for later
                </p>
              </div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-[13px] text-gray-400">No {filter === 'link' ? 'links' : filter === 'photo' ? 'images' : 'files'} saved yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.15 }}
                  className="group rounded-xl border border-gray-100 bg-white overflow-hidden hover:shadow-[0_4px_16px_rgba(93,63,90,0.10)] transition-all duration-200"
                >
                  {/* Thumbnail area */}
                  {item.type === 'photo' && item.url ? (
                    <div className="aspect-[16/10] bg-gray-50 overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : item.type === 'file' ? (
                    <div className="aspect-[16/10] bg-gray-50 flex items-center justify-center">
                      <Paperclip size={28} className="text-gray-300" />
                    </div>
                  ) : (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-[16/10] bg-gray-50 overflow-hidden relative"
                    >
                      <LinkThumbnail item={item} />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm">
                          <ExternalLink size={12} className="text-gray-500" />
                        </div>
                      </div>
                    </a>
                  )}

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-medium text-gray-700 truncate">{item.fileName || item.url}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div
                            className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0"
                            style={{ backgroundColor: platformColors[item.platform] }}
                          >
                            {platformLabels[item.platform][0]}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {item.type === 'link' ? platformLabels[item.platform] : item.type === 'photo' ? 'Photo' : 'File'}
                          </span>
                          <span className="text-[10px] text-gray-300">{formatDate(item.savedAt)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <textarea
                      value={item.notes || ''}
                      onChange={e => handleNotesChange(item.id, e.target.value)}
                      placeholder="Add a note..."
                      rows={2}
                      className="mt-2 w-full text-[11px] text-gray-600 bg-gray-50 rounded-md px-2 py-1.5 border-0 resize-none focus:bg-white focus:ring-1 focus:ring-[#612A4F]/20 outline-none transition-all placeholder:text-gray-300"
                    />

                    <button
                      onClick={() => handleCreatePost(item)}
                      className="mt-1.5 text-[11px] text-[#612A4F] hover:text-[#4e2140] font-medium transition-colors"
                    >
                      Create a post from this
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InspirationPanel;
