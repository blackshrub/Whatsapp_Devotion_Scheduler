import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Button } from './ui/button';
import { Bold, Italic, List, ListOrdered, Highlighter } from 'lucide-react';

export const DevotionEditor = ({ content = '<p>Write your devotion...</p>', onContentChange }) => {
  const editor = useEditor({
    extensions: [StarterKit, Highlight],
    content,
    onUpdate: ({ editor }) => {
      onContentChange?.(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="space-y-3" data-testid="editor">
      <div className="flex flex-wrap gap-2 p-2 bg-[color:var(--muted)] rounded-lg" data-testid="editor-toolbar">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-testid="editor-bold-button"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-testid="editor-italic-button"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-testid="editor-list-button"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-testid="editor-ordered-list-button"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('highlight') ? 'default' : 'ghost'}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          data-testid="editor-highlight-button"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
      </div>
      <div
        className="border border-[color:var(--border)] rounded-lg min-h-[300px] p-4 bg-white"
        data-testid="editor-content"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
