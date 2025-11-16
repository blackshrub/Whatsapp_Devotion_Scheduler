import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { ScheduleForm } from './components/ScheduleForm';
import { BulkAddModal } from './components/BulkAddModal';
import { DevotionEditor } from './components/DevotionEditor';
import { HistoryTable } from './components/HistoryTable';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { CalendarClock, Edit3, History, Users } from 'lucide-react';
import { format } from 'date-fns';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [schedules, setSchedules] = useState([]);
  const [history, setHistory] = useState([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('<p>Write your devotion message here...</p>');
  const [loading, setLoading] = useState(false);

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

  const handleSaveFromEditor = async () => {
    setLoading(true);
    try {
      // This would create a draft or allow scheduling
      toast.info('Use the Schedule tab to set a date/time for this message');
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
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
            <TabsTrigger value="editor" data-testid="nav-editor">
              <Edit3 className="h-4 w-4 mr-2" />
              Editor
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
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {format(gmt7Date, 'MMM dd, yyyy HH:mm')} GMT+7
                              </div>
                              <div className="text-sm text-[color:var(--fg-muted)] truncate mt-1">
                                {schedule.message_md || schedule.message_html}
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

          {/* Editor Tab */}
          <TabsContent value="editor">
            <div className="bg-white rounded-lg border border-[color:var(--border)] p-6 shadow-sm max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold font-display">Devotion Editor</h2>
                <Button onClick={handleSaveFromEditor} disabled={loading} data-testid="editor-save-button">
                  {loading ? 'Saving...' : 'Save Draft'}
                </Button>
              </div>
              <DevotionEditor content={editorContent} onContentChange={setEditorContent} />
              <div className="mt-4 p-4 bg-[color:var(--muted)] rounded-lg">
                <p className="text-sm text-[color:var(--fg-muted)] mb-2">
                  <strong>Tip:</strong> Use the Schedule tab to set a date and time for sending.
                </p>
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
