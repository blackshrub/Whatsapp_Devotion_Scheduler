import React, { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Bold, Italic, List } from 'lucide-react';

export const SimpleEditor = ({ initialContent = '', onChange }) => {
  const editorRef = useRef(null);
  const isInitialized = useRef(false);

  // Set initial content only once
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = initialContent || '<p>Enter your devotion message here...</p>';
      isInitialized.current = true;
    }
  }, []);

  const handleFormat = (command) => {
    document.execCommand(command, false, null);
    editorRef.current?.focus();
    // Trigger change after formatting
    handleInput();
  };

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || '';
    onChange?.(html);
  };

  const handleKeyDown = (e) => {
    // Ensure Enter key works properly
    if (e.key === 'Enter') {
      // Let default behavior handle it, but ensure we're not in a list
      const selection = window.getSelection();
      if (selection && selection.anchorNode) {
        const parentElement = selection.anchorNode.parentElement;
        // If not in a list, insert a line break
        if (!parentElement?.closest('ul') && !parentElement?.closest('ol')) {
          e.preventDefault();
          document.execCommand('insertLineBreak', false, null);
        }
      }
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
        contentEditable
        className="border border-[color:var(--border)] rounded-lg p-3 bg-white min-h-[150px] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-600)]"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-testid="schedule-message-editor"
        suppressContentEditableWarning
      />
      
      <p className="text-xs text-[color:var(--fg-muted)]">
        Format your message with bold, italic, and lists. It will be converted to WhatsApp markdown automatically.
      </p>
    </div>
  );
};
