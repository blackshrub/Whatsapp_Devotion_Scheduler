import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { ScheduleForm } from './components/ScheduleForm';
import { BulkAddModal } from './components/BulkAddModal';
import { HistoryTable } from './components/HistoryTable';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { CalendarClock, History, Users, Download, Upload } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [schedules, setSchedules] = useState([]);
  const [history, setHistory] = useState([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/schedules?status=scheduled`);
      setSchedules(response.data);
    } catch (error) {
      console.error('Fetch schedules error:', error);
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/history`);
      setHistory(response.data);
    } catch (error) {
      console.error('Fetch history error:', error);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchHistory();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchSchedules();
      fetchHistory();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleScheduleSuccess = () => {
    fetchSchedules();
    toast.success('Schedule created!');
  };

  const handleBulkSuccess = () => {
    fetchSchedules();
  };

  const handleRetry = async (schedule) => {
    try {
      await axios.post(`${BACKEND_URL}/api/schedules/${schedule.id}/retry`);
      toast.success('Schedule queued for retry');
      fetchSchedules();
      fetchHistory();
    } catch (error) {
      toast.error('Failed to retry');
    }
  };

  const handleDelete = async (schedule) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
      await axios.delete(`${BACKEND_URL}/api/schedules/${schedule.id}`);
      toast.success('Schedule deleted');
      fetchSchedules();
      fetchHistory();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleView = (schedule) => {
    alert(`Phone: ${schedule.phone}\nMessage: ${schedule.message_md}\nStatus: ${schedule.status}`);
  };

  const handleExportData = async () => {
    try {
      // Fetch all schedules (both upcoming and history)
      const allSchedules = await axios.get(`${BACKEND_URL}/api/schedules?limit=1000`);
      
      // Create export data object
      const exportData = {
        exported_at: new Date().toISOString(),
        exported_from: window.location.origin,
        total_schedules: allSchedules.data.length,
        schedules: allSchedules.data,
        metadata: {
          timezone: 'GMT+7',
          version: '1.0',
          app_name: 'WhatsApp Daily Devotion Scheduler'
        }
      };

      // Convert to JSON
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `devotion_scheduler_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${allSchedules.data.length} schedules successfully!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const fileText = await file.text();
      const importData = JSON.parse(fileText);

      // Validate import data
      if (!importData.schedules || !Array.isArray(importData.schedules)) {
        toast.error('Invalid export file format');
        return;
      }

      // Ask user if they want to replace existing data
      const replaceExisting = window.confirm(
        `Import ${importData.schedules.length} schedules?\n\n` +
        `Click OK to REPLACE all existing data\n` +
        `Click Cancel to ADD to existing data`
      );

      // Import to backend
      const response = await axios.post(`${BACKEND_URL}/api/import`, {
        schedules: importData.schedules,
        replace_existing: replaceExisting
      });

      toast.success(response.data.message);
      
      // Refresh data
      fetchSchedules();
      fetchHistory();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.detail || 'Failed to import data');
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[color:var(--bg)]" data-testid="page-dashboard">
      <Toaster position="top-right" />
      
      {/* Top Bar */}
      <header
        className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-[color:var(--border)]"
        style={{ backgroundImage: 'var(--topbar-grad)' }}
        data-testid="topbar"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <h1 className="font-display text-lg font-semibold">Daily Devotion Scheduler</h1>
          <div className="flex items-center gap-4">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleExportData}
              data-testid="export-button"
              title="Export all schedules"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <span className="text-sm text-[color:var(--fg-muted)]" data-testid="topbar-device">
              <Users className="inline h-4 w-4 mr-1" />
              Church Phone
            </span>
            <span className="text-sm text-[color:var(--fg-muted)]" data-testid="topbar-timezone">
              GMT+7
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="schedule" data-testid="nav-schedule">
              <CalendarClock className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="history" data-testid="nav-history">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="bg-white rounded-lg border border-[color:var(--border)] p-6 shadow-sm">
                <h2 className="text-lg font-semibold font-display mb-4">Create Schedule</h2>
                <ScheduleForm onSuccess={handleScheduleSuccess} />
                <Button
                  variant="secondary"
                  className="mt-4 w-full"
                  onClick={() => setBulkModalOpen(true)}
                  data-testid="bulk-add-open-button"
                >
                  Bulk Add Multiple Schedules
                </Button>
              </div>

              {/* Upcoming List */}
              <div className="bg-white rounded-lg border border-[color:var(--border)] p-6 shadow-sm">
                <h2 className="text-lg font-semibold font-display mb-4">
                  Upcoming ({schedules.length})
                </h2>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {schedules.length === 0 ? (
                    <p className="text-sm text-[color:var(--fg-muted)] text-center py-8">
                      No upcoming schedules
                    </p>
                  ) : (
                    schedules.map((schedule) => {
                      // Convert UTC time to GMT+7 for display
                      const utcDate = new Date(schedule.send_at);
                      const gmt7Date = new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
                      
                      return (
                        <div
                          key={schedule.id}
                          className="p-3 border border-[color:var(--border)] rounded-lg hover:bg-[color:var(--muted)] transition-colors"
                          data-testid="schedule-item"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium">
                                {format(gmt7Date, 'MMM dd, yyyy HH:mm')} GMT+7
                              </div>
                              <div className="text-sm text-[color:var(--fg-muted)] truncate mt-1">
                                {(schedule.message_md || schedule.message_html).substring(0, 80)}
                                {(schedule.message_md || schedule.message_html).length > 80 ? '...' : ''}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(schedule)}
                              data-testid="schedule-delete-button"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="bg-white rounded-lg border border-[color:var(--border)] p-6 shadow-sm">
              <h2 className="text-lg font-semibold font-display mb-4">
                Message History
              </h2>
              <HistoryTable
                schedules={history}
                onRetry={handleRetry}
                onDelete={handleDelete}
                onView={handleView}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bulk Add Modal */}
      <BulkAddModal
        open={bulkModalOpen}
        onOpenChange={setBulkModalOpen}
        onSuccess={handleBulkSuccess}
      />
    </div>
  );
}

export default App;
