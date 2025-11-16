import React, { useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Bold, Italic, List } from 'lucide-react';
import { Textarea } from './ui/textarea';

export const SimpleEditor = ({ initialContent = '', onChange }) => {
  const textareaRef = useRef(null);

  const wrapSelection = (before, after) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    if (selectedText) {
      // Wrap selected text
      const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
      textarea.value = newText;
      textarea.setSelectionRange(start + before.length, end + before.length);
    } else {
      // Insert at cursor
      const newText = text.substring(0, start) + before + after + text.substring(end);
      textarea.value = newText;
      textarea.setSelectionRange(start + before.length, start + before.length);
    }

    textarea.focus();
    onChange?.(textarea.value);
  };

  const handleBold = () => {
    wrapSelection('**', '**');
  };

  const handleItalic = () => {
    wrapSelection('_', '_');
  };

  const handleList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;
    
    // Find start of current line
    let lineStart = start;
    while (lineStart > 0 && text[lineStart - 1] !== '\n') {
      lineStart--;
    }

    // Insert bullet at start of line
    const newText = text.substring(0, lineStart) + '• ' + text.substring(lineStart);
    textarea.value = newText;
    textarea.setSelectionRange(start + 2, start + 2);
    textarea.focus();
    onChange?.(textarea.value);
  };

  return (
    <div className="space-y-2">
      {/* Simple Toolbar */}
      <div className="flex gap-1 p-2 bg-[color:var(--muted)] rounded-lg border border-[color:var(--border)]">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleBold}
          data-testid="editor-bold-button"
          title="Bold (**text**)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleItalic}
          data-testid="editor-italic-button"
          title="Italic (_text_)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleList}
          data-testid="editor-list-button"
          title="Bullet (•)"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Simple Textarea with Markdown */}
      <Textarea
        ref={textareaRef}
        defaultValue={initialContent || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Enter your devotion message here...
Use **bold** for bold text
Use _italic_ for italic text
Use • for bullet points"
        className="min-h-[150px] font-mono text-sm"
        data-testid="schedule-message-editor"
      />
      
      <p className="text-xs text-[color:var(--fg-muted)]">
        Use **bold**, _italic_, and • for formatting. It will be converted to WhatsApp markdown automatically.
      </p>
    </div>
  );
};
