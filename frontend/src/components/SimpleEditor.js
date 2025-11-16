import React, { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Bold, Italic, List } from 'lucide-react';

export const SimpleEditor = ({ initialContent = '', onChange }) => {
  const editorRef = useRef(null);

  // Set initial content only once on mount
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      const content = initialContent || 'Enter your devotion message here...';
      editorRef.current.innerHTML = content;
    }
  }, [initialContent]);

  const handleFormat = (command) => {
    if (!editorRef.current) return;
    
    // Save current selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editorRef.current.focus();
      return;
    }
    
    // Execute command
    editorRef.current.focus();
    document.execCommand(command, false, null);
    
    // Trigger onChange
    setTimeout(() => handleInput(), 10);
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onChange?.(html);
    }
  };

  return (
    <div className="space-y-2">
      {/* Simple Toolbar */}
      <div className="flex gap-1 p-2 bg-[color:var(--muted)] rounded-lg border border-[color:var(--border)]">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => handleFormat('bold')}
          data-testid="editor-bold-button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => handleFormat('italic')}
          data-testid="editor-italic-button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => handleFormat('insertUnorderedList')}
          data-testid="editor-list-button"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editable Content */}
      <div
        ref={editorRef}
        contentEditable="true"
        className="border border-[color:var(--border)] rounded-lg p-3 bg-white min-h-[150px] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-600)] whitespace-pre-wrap"
        onInput={handleInput}
        data-testid="schedule-message-editor"
        suppressContentEditableWarning={true}
      />
      
      <p className="text-xs text-[color:var(--fg-muted)]">
        Format your message with bold, italic, and lists. It will be converted to WhatsApp markdown automatically.
      </p>
    </div>
  );
};
