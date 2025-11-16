import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

export const HistoryTable = ({ schedules, onRetry, onDelete, onView }) => {
  if (!schedules || schedules.length === 0) {
    return (
      <div className="text-center py-12" data-testid="history-empty">
        <p className="text-[color:var(--fg-muted)]">No history yet</p>
        <p className="text-sm text-[color:var(--fg-muted)] mt-2">
          When messages are sent, they will appear here with delivery status.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="history-table">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date/Time</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Message Preview</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => {
            // Convert UTC to GMT+7 for display
            const utcDate = new Date(schedule.send_at);
            const gmt7Date = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
            
            return (
              <TableRow key={schedule.id} data-testid="history-row">
                <TableCell>
                  <div className="text-sm">
                    <div>{format(gmt7Date, 'yyyy-MM-dd')}</div>
                    <div className="text-[color:var(--fg-muted)]">
                      {format(gmt7Date, 'HH:mm')} GMT+7
                    </div>
                  </div>
                </TableCell>
              <TableCell className="font-mono text-xs">
                {schedule.phone}
              </TableCell>
              <TableCell>
                <div className="max-w-xs truncate text-sm">
                  {schedule.message_md || schedule.message_html}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={schedule.status} data-testid="history-status-badge">
                  {schedule.status}
                </Badge>
              </TableCell>
                <TableCell className="font-mono text-xs">
                  {schedule.phone}
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-sm">
                    {schedule.message_md || schedule.message_html}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={schedule.status} data-testid="history-status-badge">
                    {schedule.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {schedule.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRetry?.(schedule)}
                        data-testid="history-retry-button"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView?.(schedule)}
                      data-testid="history-view-button"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete?.(schedule)}
                      data-testid="history-delete-button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
