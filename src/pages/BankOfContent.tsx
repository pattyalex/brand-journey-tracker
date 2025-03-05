
  const handleAlignText = (alignment: 'left' | 'center' | 'right') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.substring(selectionStart, selectionEnd);
    
    if (selectedText) {
      let alignedText;
      
      if (alignment === 'center') {
        alignedText = `<div style="text-align: center;">${selectedText}</div>`;
      } else if (alignment === 'right') {
        alignedText = `<div style="text-align: right;">${selectedText}</div>`;
      } else {
        alignedText = `<div style="text-align: left;">${selectedText}</div>`;
      }
      
      const newText = value.substring(0, selectionStart) + alignedText + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(activeTab, newText);
    } else {
      let tag;
      
      if (alignment === 'center') {
        tag = `<div style="text-align: center;"></div>`;
      } else if (alignment === 'right') {
        tag = `<div style="text-align: right;"></div>`;
      } else {
        tag = `<div style="text-align: left;"></div>`;
      }
      
      const newText = value.substring(0, selectionStart) + tag + value.substring(selectionEnd);
      setWritingText(newText);
      updateWritingSpace(activeTab, newText);
      
      // Place cursor between the opening and closing tags
      const cursorPosition = selectionStart + tag.indexOf('</div>');
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(cursorPosition, cursorPosition);
        }
      }, 0);
    }
    
    toast({
      description: `Text alignment: ${alignment}`,
    });
  };
