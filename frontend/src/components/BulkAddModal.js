import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const BulkAddModal = ({ open, onOpenChange, onSuccess }) => {
  const [bulkText, setBulkText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBulkSubmit = async () => {
    setLoading(true);
    try {
      // Parse bulk text (format: date|time|message per line)
      const lines = bulkText.trim().split('\n').filter(line => line.trim());
      const schedules = lines.map(line => {
        const [date, time, ...messageParts] = line.split('|');
        const message = messageParts.join('|').trim();
        const sendAt = new Date(`${date.trim()}T${time.trim()}:00+07:00`).toISOString();
        
        return {
          phone: '120363291513749102@g.us',
          message_html: message,
          send_at: sendAt
        };
      });

      await axios.post(`${BACKEND_URL}/api/schedules/bulk`, { schedules });
      toast.success(`${schedules.length} schedules created successfully!`);
      setBulkText('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Bulk add error:', error);
      toast.error(error.response?.data?.detail || 'Failed to create bulk schedules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="bulk-add-modal">
        <DialogHeader>
          <DialogTitle>Bulk Add Schedules</DialogTitle>
          <DialogDescription>
            Enter one schedule per line in format: date|time|message
            <br />
            Example: 2025-01-15|06:00|Good morning devotion
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="bulk-text">Schedules</Label>
            <Textarea
              id="bulk-text"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="2025-01-15|00:00|Morning devotion message
2025-01-16|00:00|Evening reflection"
              className="min-h-[200px] font-mono text-sm"
              data-testid="bulk-add-textarea"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              data-testid="bulk-add-cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkSubmit}
              disabled={loading || !bulkText.trim()}
              data-testid="bulk-add-import-button"
            >
              {loading ? 'Importing...' : 'Import All'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
