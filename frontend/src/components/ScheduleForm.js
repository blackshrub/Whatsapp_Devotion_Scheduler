import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { SimpleEditor } from './SimpleEditor';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const ScheduleForm = ({ onSuccess, editData = null, onCancel = null }) => {
  const [formData, setFormData] = useState({
    phone: editData?.phone || '120363291513749102@g.us',
    date: editData?.send_at ? new Date(editData.send_at).toISOString().split('T')[0] : '',
    time: editData?.send_at ? new Date(editData.send_at).toISOString().split('T')[1].substring(0, 5) : '00:00',
    image: null,
    message: editData?.message_html || ''
  });
  const [imagePreview, setImagePreview] = useState(editData?.image_path || null);
  const [loading, setLoading] = useState(false);

  const handleEditorChange = (html) => {
    setFormData({ ...formData, message: html });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editor) {
      toast.error('Editor not initialized');
      return;
    }

    setLoading(true);

    try {
      let imagePath = editData?.image_path || null;

      // Upload image if new one selected
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('file', formData.image);
        const uploadRes = await axios.post(`${BACKEND_URL}/api/uploads/image`, imageFormData);
        imagePath = uploadRes.data.path;
      }

      // Get HTML content from editor
      const messageHtml = editor.getHTML();

      // User input is always in GMT+7 (Asia/Jakarta time)
      // Parse the date and time components
      const [year, month, day] = formData.date.split('-').map(Number);
      const [hours, minutes] = formData.time.split(':').map(Number);
      
      // Create date in GMT+7: construct UTC by treating input as GMT+7
      // GMT+7 is UTC+7, so to convert to UTC we subtract 7 hours
      const utcDate = new Date(Date.UTC(year, month - 1, day, hours - 7, minutes, 0));
      const sendAt = utcDate.toISOString();

      const scheduleData = {
        phone: formData.phone,
        message_html: messageHtml,
        image_path: imagePath,
        send_at: sendAt
      };

      if (editData) {
        // Update existing
        await axios.put(`${BACKEND_URL}/api/schedules/${editData.id}`, scheduleData);
        toast.success('Schedule updated successfully!');
      } else {
        // Create new
        await axios.post(`${BACKEND_URL}/api/schedules`, scheduleData);
        toast.success('Schedule created successfully!');
      }

      // Reset form
      setFormData({
        phone: '120363291513749102@g.us',
        date: '',
        time: '00:00',
        image: null
      });
      setImagePreview(null);
      
      // Reset editor content
      if (editor) {
        editor.commands.setContent('<p>Enter your devotion message here...</p>');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

  if (!editor) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="schedule-form">
      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="text"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          data-testid="schedule-phone-input"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            data-testid="schedule-date-input"
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Time (GMT+7)</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            data-testid="schedule-time-input"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message</Label>
        <div className="space-y-2">
          {/* Editor Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 bg-[color:var(--muted)] rounded-lg border border-[color:var(--border)]">
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
          </div>
          {/* Editor Content */}
          <div
            className="border border-[color:var(--border)] rounded-lg p-3 bg-white min-h-[150px]"
            data-testid="schedule-message-editor"
          >
            <EditorContent editor={editor} />
          </div>
          <p className="text-xs text-[color:var(--fg-muted)]">
            Format your message with bold, italic, and lists. It will be converted to WhatsApp markdown automatically.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="image">Image (Optional)</Label>
        <div className="flex items-center gap-3">
          <label
            htmlFor="image"
            className="flex items-center gap-2 px-4 h-10 border border-[color:var(--border)] rounded-md cursor-pointer hover:bg-[color:var(--muted)] transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span className="text-sm">Choose Image</span>
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            data-testid="schedule-image-uploader"
          />
          {imagePreview && (
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded" />
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, image: null });
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 bg-[color:var(--error)] text-white rounded-full p-1"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          data-testid="schedule-submit-button"
        >
          {loading ? 'Saving...' : editData ? 'Update' : 'Schedule'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            data-testid="schedule-cancel-button"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
