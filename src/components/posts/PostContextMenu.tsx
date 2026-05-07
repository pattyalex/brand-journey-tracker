import React, { useState } from 'react';
import { MoreVertical, Maximize2, Copy, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PostContextMenuProps {
  onExpand: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  iconSize?: string;
  triggerClass?: string;
}

const PostContextMenu: React.FC<PostContextMenuProps> = ({
  onExpand,
  onDuplicate,
  onDelete,
  iconSize = 'w-3.5 h-3.5',
  triggerClass = 'opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-all duration-150 flex-shrink-0',
}) => {
  const [open, setOpen] = useState(false);

  const handle = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    fn();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          onClick={e => e.stopPropagation()}
          className={triggerClass}
        >
          <MoreVertical className={iconSize} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-1 bg-white rounded-lg border border-gray-200 shadow-lg w-[140px] z-[10010]"
        align="end"
        sideOffset={4}
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <button
          onClick={handle(onExpand)}
          className="w-full text-left px-2.5 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2 transition-colors duration-100"
        >
          <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
          Expand
        </button>
        <button
          onClick={handle(onDuplicate)}
          className="w-full text-left px-2.5 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2 transition-colors duration-100"
        >
          <Copy className="w-3.5 h-3.5 text-gray-400" />
          Duplicate
        </button>
        <button
          onClick={handle(onDelete)}
          className="w-full text-left px-2.5 py-1.5 text-[13px] text-red-500 hover:bg-red-50 rounded flex items-center gap-2 transition-colors duration-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </PopoverContent>
    </Popover>
  );
};

export default PostContextMenu;
