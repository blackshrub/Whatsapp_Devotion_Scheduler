# WhatsApp Daily Devotion Scheduler — Development Plan

Preview: https://whatsapp-devotion.preview.emergentagent.com
Gateway: http://dermapack.net:3001 (send/message, send/image)
Timezone: GMT+7 (Asia/Jakarta)
Defaults: phone=120363291513749102@g.us, time=00:00, date=blank; Test phone=6281290080025
Design: Clean & minimal (per design_guidelines.md)

## 1) Objectives
- Enable member-care staff to bulk schedule WhatsApp devotions (text + optional image) at specific dates/times in GMT+7
- Convert WYSIWYG content to WhatsApp-friendly markdown at send-time
- Send via existing gateway and store delivery history (sent/failed, timestamp, preview)
- Simple dashboard (no login), safe defaults, accessible UI, reliable background sending

## 2) Phased Implementation

### Phase 1 — Gateway POC & MVP Foundation [Status: COMPLETED ✓]
**Goal:** Prove gateway integration works and build complete MVP foundation.

**Completed Items:**
- ✅ Backend gateway client (httpx-based) with send_message and send_image functions
- ✅ Debug route /api/debug/send for testing gateway integration
- ✅ Text message successfully sent to test phone (6281290080025)
- ✅ Image message successfully sent to test phone
- ✅ MongoDB integration (localhost:27017) working
- ✅ Complete data model: Schedule with UUID ids, status tracking, timezone-aware timestamps
- ✅ CRUD API endpoints: create (single + bulk), list, get, update, delete, retry
- ✅ APScheduler running every minute in Asia/Jakarta timezone
- ✅ File upload endpoint with static serving from /app/backend/uploads
- ✅ HTML to WhatsApp markdown converter (bold, italic, lists)
- ✅ Complete React UI with shadcn/ui components
- ✅ Three-tab layout: Schedule | Editor | History
- ✅ Schedule form with default phone, date/time pickers, message textarea, image upload
- ✅ Bulk Add modal for multiple schedules
- ✅ Tiptap WYSIWYG editor with formatting toolbar
- ✅ History table with status badges and action buttons
- ✅ Toast notifications (Sonner) for user feedback
- ✅ Clean, minimal design matching design_guidelines.md
- ✅ All data-testid attributes for testing

**Exit Criteria Met:**
- Text and image successfully delivered to test phone ✓
- End-to-end scheduling workflow working ✓
- Schedules created via UI appear in upcoming list ✓
- Form resets after submission ✓
- All tabs functional ✓

### Phase 2 — Live Testing & Scheduler Validation [Status: In Progress]
**Goal:** Verify automatic sending works at scheduled times and handle edge cases.

**Scope:**
- Test scheduler picks up due messages and sends them automatically
- Verify status updates (scheduled → sending → sent/failed)
- Test timezone handling (GMT+7 conversions)
- Validate gateway response handling and error cases
- Confirm history updates after messages are sent
- Test retry functionality for failed messages

**User Stories:**
1) As staff, I can create a schedule for 2 minutes from now and see it auto-send
2) As staff, I can see the status change from "scheduled" to "sent" in real-time
3) As staff, I can view sent messages in History with timestamps
4) As staff, I can retry a failed message and see it re-queued
5) As staff, I can delete scheduled messages before they're sent

**Tasks:**
- [ ] Create a schedule for immediate future (e.g., 2 minutes ahead)
- [ ] Wait and verify scheduler picks it up and sends it
- [ ] Check History tab shows the sent message with correct status
- [ ] Test retry functionality on a failed/test message
- [ ] Test delete functionality on scheduled messages
- [ ] Verify bulk add creates multiple schedules correctly
- [ ] Test image upload and sending with image attachment

**Exit Criteria:**
- Scheduler automatically sends messages at scheduled time
- Status updates correctly in database and UI
- History reflects accurate delivery status
- Retry and delete actions work as expected
- No critical bugs in core workflow

### Phase 3 — Feature Expansion [Status: Not Started]
**Goal:** Improve reliability, UX, and operational controls.

**Backend:**
- Retry policy (e.g., up to 3 attempts with exponential backoff)
- Idempotency keys per schedule to prevent duplicate sends
- Optional Basic Auth support (env: GATEWAY_USER/GATEWAY_PASS)
- Export history to CSV endpoint
- Pagination and advanced filters (date range, status, phone number)

**Frontend:**
- Enhanced bulk CSV import with preview table before saving
- Inline edit for scheduled messages
- Image thumbnail previews in History and Schedule lists
- Filter UI in History tab (date range picker, status dropdown)
- Export to CSV button in History
- Delete confirmation dialogs

**User Stories:**
1) As staff, I can import a CSV file with 50 devotions and preview before saving
2) As staff, I can filter history by date range (e.g., last 7 days)
3) As staff, I can see image thumbnails without opening full view
4) As staff, I can download a CSV export of all sent messages
5) As staff, I can rely on automatic retries when gateway is temporarily down

**Exit Criteria:**
- CSV import/export working smoothly
- Filters and pagination handle large datasets
- Retry logic tested with simulated failures
- No regressions in existing features

### Phase 4 — Polish, Testing & Production Readiness [Status: Not Started]
**Goal:** Operational stability, comprehensive testing, and production deployment.

**Tasks:**
- Comprehensive E2E testing via testing_agent_v3
- Accessibility audit (keyboard navigation, screen readers, WCAG AA)
- Performance optimization (lazy loading, code splitting)
- Error boundary implementation for graceful failures
- Structured logging for all send attempts
- Settings panel for default phone and preferences
- "Send Now" action to immediately dispatch a scheduled message
- Documentation for church staff (user guide)
- Deployment configuration and monitoring setup

**User Stories:**
1) As staff, I get clear, helpful error messages when something goes wrong
2) As staff, I can navigate the entire app using only keyboard
3) As staff, I can change default settings (phone number, send time)
4) As staff, I can send a draft immediately without scheduling
5) As admin, I can view logs to troubleshoot delivery issues

**Exit Criteria:**
- All E2E tests passing (via testing agent)
- Accessibility score: WCAG AA compliant
- Error handling covers all edge cases
- Documentation complete and reviewed
- Ready for production deployment

## 3) Implementation Summary

**Phase 1 (COMPLETED):**
- ✅ Gateway integration with text and image sending
- ✅ Complete backend API with MongoDB
- ✅ Scheduler with Asia/Jakarta timezone
- ✅ Full-featured React UI with three tabs
- ✅ Clean, minimal design matching guidelines
- ✅ All core CRUD operations working

**Phase 2 (CURRENT):**
- ⏳ Live testing of automatic scheduling
- ⏳ Validation of status transitions
- ⏳ Edge case handling

**Phase 3 (PLANNED):**
- CSV import/export
- Advanced filtering
- Retry logic
- UX enhancements

**Phase 4 (PLANNED):**
- Comprehensive testing
- Accessibility & polish
- Production deployment

## 4) Current Status & Next Actions

**What's Working:**
- Gateway successfully sends text and image messages ✓
- Full CRUD for schedules ✓
- UI displays scheduled and historical messages ✓
- Scheduler initialized and running ✓
- Clean, professional design ✓

**Immediate Next Steps:**
1. Test automatic sending by creating a schedule for 2-3 minutes from now
2. Verify scheduler picks up and sends the message
3. Check History tab updates with sent status
4. Test bulk add functionality with multiple schedules
5. Test retry and delete actions
6. Call testing_agent_v3 for comprehensive E2E validation

**Known Issues to Address:**
- None currently - Phase 1 completed successfully

## 5) Success Criteria

**Phase 1 (MET ✓):**
- Real messages (text + image) delivered to test phone ✓
- MVP UI functional with all three tabs ✓
- Schedules created and stored in MongoDB ✓
- Clean design matching guidelines ✓

**Phase 2 (TARGET):**
- Scheduler automatically sends at scheduled time
- Status updates reflected in real-time
- History accurately tracks all sent messages
- Retry and delete functions work correctly

**Overall MVP Success:**
- Bulk schedule saved, auto-sent at GMT+7 time, history displays accurate status
- Image optional works end-to-end
- UX: Clean, minimal UI matching guidelines; defaults reduce mistakes
- Reliability: Scheduler runs continuously; clear failure handling
- Ready for church staff to use in production

## 6) Technical Stack Summary

**Backend:**
- FastAPI (Python) with Motor (async MongoDB driver)
- APScheduler (background job scheduling)
- httpx (async HTTP client for gateway)
- Pydantic (data validation)

**Frontend:**
- React 19 with React Router
- Shadcn/ui components (Button, Input, Tabs, Table, Dialog, Badge)
- Tiptap (WYSIWYG editor)
- Sonner (toast notifications)
- date-fns (date formatting)
- Lucide React (icons)
- Tailwind CSS (styling)

**Infrastructure:**
- MongoDB (localhost:27017)
- WhatsApp Gateway (http://dermapack.net:3001)
- Timezone: Asia/Jakarta (GMT+7)
