import React, { useRef, useState } from 'react';
import { Button } from './ui/button';
import { Bold, Italic, List } from 'lucide-react';

export const SimpleEditor = ({ initialContent = '', onChange }) => {
  const editorRef = useRef(null);
  const [content, setContent] = useState(initialContent);

  const handleFormat = (command) => {
    document.execCommand(command, false, null);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    const html = editorRef.current?.innerHTML || '';
    setContent(html);
    onChange?.(html);
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
        dangerouslySetInnerHTML={{ __html: content }}
        data-testid="schedule-message-editor"
      />
      
      <p className="text-xs text-[color:var(--fg-muted)]">
        Format your message with bold, italic, and lists. It will be converted to WhatsApp markdown automatically.
      </p>
    </div>
  );
};
