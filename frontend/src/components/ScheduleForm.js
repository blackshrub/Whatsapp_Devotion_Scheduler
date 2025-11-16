import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Upload, Trash2, Bold, Italic, List, ListOrdered } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const ScheduleForm = ({ onSuccess, editData = null, onCancel = null }) => {
  const [formData, setFormData] = useState({
    phone: editData?.phone || '120363291513749102@g.us',
    date: editData?.send_at ? new Date(editData.send_at).toISOString().split('T')[0] : '',
    time: editData?.send_at ? new Date(editData.send_at).toISOString().split('T')[1].substring(0, 5) : '00:00',
    message: editData?.message_html || '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(editData?.image_path || null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        message_html: formData.message,
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
        message: '',
        image: null
      });
      setImagePreview(null);

      onSuccess?.();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save schedule');
    } finally {
      setLoading(false);
    }
  };

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
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Enter your devotion message..."
          className="min-h-[120px]"
          data-testid="schedule-message-input"
          required
        />
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
