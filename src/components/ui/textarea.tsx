
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onTextSelect?: (selectedText: string) => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onTextSelect, ...props }, ref) => {
    const handleMouseUp = (e: React.MouseEvent<HTMLTextAreaElement>) => {
      if (onTextSelect) {
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
          const selectedContent = selection.toString().trim();
          if (selectedContent) {
            onTextSelect(selectedContent);
          }
        }
      }
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full h-full rounded-md border-0 bg-transparent px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onMouseUp={handleMouseUp}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
