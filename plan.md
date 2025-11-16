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

### Phase 1 — Gateway POC (Isolation) [Status: In Progress]
Goal: Prove we can send text and image to the test number via the gateway from backend.
Scope:
- Backend util: gateway client (base URL from env; optional Basic Auth if provided; otherwise no auth)
- POST /send/message (text) and /send/image (multipart with file) happy paths
- Add temporary backend route /api/debug/send (body: phone, message, image) to trigger and log result
- Use timezone-aware timestamps (timezone.utc) only for logging in POC
- Do not persist in DB yet
User Stories:
1) As staff, I can trigger a test text message to 6281290080025 and see SUCCESS/FAIL in backend logs
2) As staff, I can trigger a test image message to 6281290080025
3) As staff, I can configure the gateway URL once and reuse it (env)
4) As staff, I can quickly verify gateway availability from the app
5) As staff, I can switch target between test phone and default group easily
Exit Criteria:
- Text and image successfully delivered to test phone; failure path returns clear error; logs show gateway response
- Then proceed to Phase 2

### Phase 2 — V1 App Development (MVP) [Status: Not Started]
Goal: End-to-end scheduling, sending, and history with minimal but solid UI.
Backend:
- Model (Mongo, UUID ids): schedules {id, phone, message_html, message_md, image_path, send_at (tz-aware), status: scheduled|sending|sent|failed|canceled, sent_at, gateway_response, created_at, updated_at}
- Endpoints (/api): schedules: list, create (single+bulk), update, delete/cancel, history (list with filters)
- Scheduler: APScheduler (BackgroundScheduler) runs every minute in Asia/Jakarta; picks due scheduled items; sends via gateway; updates status
- File upload: POST /api/uploads/image -> store under /app/backend/uploads + static serve; use file in /send/image
- Markdown: convert tiptap HTML → WhatsApp markdown (*bold*, _italic_, lists, line breaks)
Frontend:
- Pages (Tabs): Schedule | Editor | History (shadcn/ui, Tiptap)
- Schedule: default phone prefilled; date blank; time default 00:00; bulk add rows; Save All
- Editor (Tiptap): compose content; preview WhatsApp markdown; attach image
- History: table (status badges), preview, sent at, actions (retry, delete for scheduled)
- All calls via process.env.REACT_APP_BACKEND_URL + "/api"
User Stories:
1) As staff, I can add 5 devotions with dates/times and Save All in one click
2) As staff, I can attach an image to a devotion
3) As staff, I can edit or cancel any future schedule
4) As staff, I can see sent messages with delivery status and timestamp
5) As staff, I can retry a failed message from History
Exit Criteria:
- End-to-end: create schedule → auto-send at time → history reflects status; bulk add works; image optional works
- Call testing agent for 1 full E2E round

### Phase 3 — Feature Expansion [Status: Not Started]
Goal: Improve reliability, UX, and controls for operations.
Backend:
- Retry policy (e.g., up to 3 attempts with backoff), idempotency keys per schedule
- Optional Basic Auth support (env: GATEWAY_USER/GATEWAY_PASS); if absent, send without auth
- Status webhooks (if gateway supports) or periodic confirmation via GET chat/messages (optional)
- Export history CSV; pagination & filters (date range, status)
Frontend:
- Bulk CSV import (date|time|message|image_url) parser + preview table
- Inline edit in Schedule list; richer markdown preview; image thumbnail previews
- Filters in History; export button; badges with accessible colors
User Stories:
1) As staff, I can import a CSV of devotions and preview before saving
2) As staff, I can filter history by date range and status
3) As staff, I can see image thumbnails in History
4) As staff, I can download a CSV export of history
5) As staff, I can rely on automatic retries on transient failures
Exit Criteria:
- CSV import, filters, and retries verified in tests; no regressions
- Call testing agent for E2E + regression

### Phase 4 — Testing, Polish & Ops [Status: Not Started]
Goal: Operational stability, accessibility, and design consistency.
- UI polish per design_guidelines.md (tokens, states, toasts, data-testid on all interactive elements)
- A11y: focus-visible, keyboard navigation, color contrast AA
- Logs & observability: structured logs for send attempts; basic metrics counters
- Settings panel: set default phone (group vs test), default send time, timezone display-only (fixed GMT+7)
- "Send now" action to immediately dispatch a draft
User Stories:
1) As staff, I get clear toasts for success/failure on all actions
2) As staff, I can change the default phone number (group/test) from Settings
3) As staff, I can send a draft immediately with Send now
4) As staff, I can navigate entirely with keyboard and see clear focus states
5) As staff, I can trust logs/metrics for troubleshooting
Exit Criteria:
- All polish items verified; accessibility checks pass; final E2E test round green

## 3) Implementation Steps (Condensed Checklist)
- P1: Implement gateway client + /api/debug/send; verify text + image to test number
- P2: DB schema, CRUD endpoints, scheduler (Asia/Jakarta), upload serving, markdown conversion, UI tabs, bulk add, history
- P3: CSV import, retries, filters, export; optional Basic Auth; thumbnails
- P4: Tokens, toasts, a11y, logs/metrics, settings, Send now

## 4) Next Actions (Immediate)
- Add backend gateway client + debug route
- Add minimal History collection structure (reuse schedules with status)
- Wire env for GATEWAY_BASE_URL (http://dermapack.net:3001) and optional auth
- Validate send/message + send/image with live test phone
- Start MVP endpoints and scheduler scaffolding

## 5) Success Criteria
- POC: Real messages (text + image) reach 6281290080025 from backend
- MVP: Bulk schedule saved, auto-sent at GMT+7 time, history displays accurate status, image optional works
- UX: Clean, minimal UI matching guidelines; defaults reduce mistakes
- Reliability: Scheduler runs continuously; retries mitigate transient failures; clear failure surfaces
- Tests: Each phase concludes with one E2E run via testing agent; no critical errors remain
