{
  "app_name": "WhatsApp Daily Devotion Scheduler",
  "brand_attributes": ["calm", "caring", "trustworthy", "minimal", "operation-first"],
  "design_style": {
    "fusion": "Swiss-style grid + Minimal church admin + WhatsApp-inspired accents (soft green, light ocean blue) with paper-grain texture",
    "layout_style": "Left sidebar, top bar, main content with tabs (Schedule, Editor, History); mobile-first with sticky action bar",
    "allowed_effects": ["subtle grain texture on page background", "soft shadows on cards", "light gradient only on hero/topbar (<=20% viewport)"]
  },
  "palette": {
    "description": "Muted neutrals with calm greens and ocean blues; high-contrast text; no saturated gradients",
    "semantic": {
      "background": "#FAFAF8",
      "surface": "#FFFFFF",
      "muted": "#F2F3F5",
      "border": "#E5E7EB",
      "primary": "#2E7D6E",
      "primary-600": "#3BA58B",
      "primary-700": "#2C8E78",
      "accent": "#4BA3D9",
      "accent-600": "#5CB0E5",
      "success": "#2E7D32",
      "warning": "#B7791F",
      "error": "#B91C1C",
      "info": "#2563EB",
      "foreground": "#0B1220",
      "foreground-muted": "#4B5563"
    },
    "tokens_css": ":root{ --bg:#FAFAF8; --surface:#FFFFFF; --muted:#F2F3F5; --border:#E5E7EB; --fg:#0B1220; --fg-muted:#4B5563; --primary:#2E7D6E; --primary-600:#3BA58B; --primary-700:#2C8E78; --accent:#4BA3D9; --accent-600:#5CB0E5; --success:#2E7D32; --warning:#B7791F; --error:#B91C1C; --info:#2563EB; --ring: 0 0% 0% / 12%; }",
    "contrast_rules": [
      "Body text on surfaces must be #0B1220 or darker",
      "Buttons: primary text always white (#FFFFFF)",
      "Badges use 12:1 contrast for text on colored backgrounds"
    ]
  },
  "gradients": {
    "policy": "Use 2–3 mild colors only; keep under 20% viewport; never on reading areas",
    "hero_topbar": "linear-gradient(135deg, rgba(60,175,147,0.15), rgba(92,176,229,0.12))",
    "accent_blob": "radial-gradient(ellipse at 30% 10%, rgba(92,176,229,0.18), transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(59,165,139,0.18), transparent 55%)",
    "restriction_reminder": [
      "Never use purple/pink/blue saturated combos",
      "Never apply gradients to text-heavy blocks",
      "Never place on small UI elements (<100px)"
    ]
  },
  "typography": {
    "fonts": {
      "heading": "Space Grotesk",
      "body": "Inter"
    },
    "import": "Use Google Fonts: https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap",
    "base_css": "html{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',sans-serif;} .font-display{font-family:'Space Grotesk',Inter,sans-serif;}",
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight",
      "h2": "text-base md:text-lg font-semibold font-display",
      "h3": "text-base font-semibold font-display",
      "body": "text-sm md:text-base text-[color:var(--fg)]",
      "small": "text-xs text-[color:var(--fg-muted)]"
    },
    "line_height": {
      "tight": 1.15,
      "normal": 1.5
    }
  },
  "spacing_radius_shadows": {
    "spacing": [4,8,12,16,20,24,32,40],
    "radius": {
      "xs": "4px",
      "sm": "6px",
      "md": "8px",
      "lg": "12px",
      "xl": "16px"
    },
    "shadows": {
      "card": "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
      "elevated": "0 4px 16px rgba(0,0,0,0.10)",
      "focus": "0 0 0 3px rgba(59,165,139,0.30)"
    }
  },
  "grid_layout": {
    "container": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    "columns": {
      "mobile": 4,
      "tablet": 8,
      "desktop": 12
    },
    "sidebar_main": {
      "sidebar_width": "280px",
      "mobile_behavior": "offcanvas sheet",
      "content_gap": "gap-6"
    }
  },
  "navigation": {
    "sidebar": [
      {"label": "Schedule", "icon": "CalendarClock", "href": "/", "data-testid": "nav-schedule"},
      {"label": "Editor", "icon": "Edit3", "href": "/editor", "data-testid": "nav-editor"},
      {"label": "History", "icon": "History", "href": "/history", "data-testid": "nav-history"}
    ],
    "topbar": [
      {"slot": "device", "content": "Device: Church Phone", "data-testid": "topbar-device"},
      {"slot": "timezone", "content": "Timezone selector", "data-testid": "topbar-timezone"}
    ]
  },
  "components": {
    "overview": "Use shadcn/ui primitives for all interactive elements. No raw HTML dropdowns/modals/toasts.",
    "list": [
      {"name": "Button", "path": "./components/ui/button.js"},
      {"name": "Input", "path": "./components/ui/input.js"},
      {"name": "Textarea", "path": "./components/ui/textarea.js"},
      {"name": "Select", "path": "./components/ui/select.js"},
      {"name": "Badge", "path": "./components/ui/badge.js"},
      {"name": "Tabs", "path": "./components/ui/tabs.js"},
      {"name": "Table", "path": "./components/ui/table.js"},
      {"name": "Dialog", "path": "./components/ui/dialog.js"},
      {"name": "Sheet", "path": "./components/ui/sheet.js"},
      {"name": "Popover", "path": "./components/ui/popover.js"},
      {"name": "Calendar", "path": "./components/ui/calendar.js"},
      {"name": "DropdownMenu", "path": "./components/ui/dropdown-menu.js"},
      {"name": "Tooltip", "path": "./components/ui/tooltip.js"},
      {"name": "Checkbox", "path": "./components/ui/checkbox.js"},
      {"name": "Sonner (Toast)", "path": "./components/ui/sonner.js"}
    ],
    "custom_to_build": [
      {
        "name": "ScheduleForm",
        "export": "named",
        "purpose": "Create or edit a scheduled WhatsApp message with date/time picker, recipients, and attachments",
        "states": ["idle", "validating", "submitting", "success", "error"],
        "data_testids": [
          "schedule-form",
          "schedule-date-input",
          "schedule-time-input",
          "schedule-message-input",
          "schedule-image-uploader",
          "schedule-submit-button",
          "schedule-delete-button"
        ]
      },
      {
        "name": "BulkAddSheet",
        "export": "named",
        "purpose": "Bulk add multiple messages with dates via CSV/textarea; preview parsed entries",
        "data_testids": ["bulk-add-open-button", "bulk-add-textarea", "bulk-add-parse-button", "bulk-add-import-button"]
      },
      {
        "name": "DevotionEditor",
        "export": "named",
        "purpose": "WYSIWYG editor (Tiptap) with markdown export",
        "data_testids": ["editor-toolbar", "editor-content", "editor-insert-image-button", "editor-save-button"]
      },
      {
        "name": "HistoryTable",
        "export": "named",
        "purpose": "View sent messages with status badges and previews",
        "data_testids": ["history-table", "history-row", "history-status-badge", "history-filter-select"]
      }
    ]
  },
  "patterns": {
    "tabs": ["Schedule", "Editor", "History"],
    "status_badges": {
      "scheduled": {"bg": "#E6F6F1", "fg": "#2C8E78"},
      "sent": {"bg": "#ECFDF5", "fg": "#2E7D32"},
      "delivered": {"bg": "#E6F6FF", "fg": "#2563EB"},
      "read": {"bg": "#F0F9FF", "fg": "#0C4A6E"},
      "failed": {"bg": "#FEF2F2", "fg": "#B91C1C"}
    },
    "cards": {
      "base": "rounded-lg bg-[color:var(--surface)] shadow-[var(--shadow-card)] border border-[color:var(--border)]"
    }
  },
  "buttons": {
    "style": "Professional / Corporate",
    "tokens": {
      "--btn-radius": "8px",
      "--btn-shadow": "0 1px 2px rgba(0,0,0,0.05)",
      "--btn-motion": "transition-colors duration-200 ease-out"
    },
    "variants": {
      "primary": "bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-700)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-600)]",
      "secondary": "bg-[color:var(--muted)] text-[color:var(--fg)] hover:bg-[#e9ecef]",
      "ghost": "bg-transparent text-[color:var(--fg)] hover:bg-[rgba(12,18,32,0.04)]"
    },
    "sizes": {
      "sm": "h-9 px-3",
      "md": "h-10 px-4",
      "lg": "h-11 px-6"
    }
  },
  "micro_interactions": {
    "principles": [
      "No universal transition: avoid transition: all",
      "Hover: color shade shift + subtle elevation",
      "Active: scale-98 press",
      "Focus: ring visible"
    ],
    "framer_motion_examples": {
      "button": "whileTap={{ scale: 0.98 }}",
      "row_hover": "animate on mount: fade+slide-up 120ms; on hover: shadow-md"
    }
  },
  "accessibility": {
    "focus": ":focus-visible ring 2px using --primary-600",
    "reduced_motion": "Respect prefers-reduced-motion, disable entrance animations",
    "aria": "All icons include aria-labels; status badges have aria-live polite when updated",
    "contrast": "All text WCAG AA minimum"
  },
  "testing_ids": {
    "rule": "All interactive and key informational elements MUST include data-testid using kebab-case describing role",
    "examples": [
      "data-testid=\"schedule-form\"",
      "data-testid=\"history-row\"",
      "data-testid=\"editor-save-button\""
    ]
  },
  "libraries": {
    "primary": ["shadcn/ui", "lucide-react", "framer-motion", "sonner", "date-fns"],
    "editor": ["@tiptap/react", "@tiptap/starter-kit", "tiptap-extension-highlight"],
    "uploads": ["react-dropzone"],
    "optional_analytics": ["recharts"]
  },
  "install_steps": [
    "npm i lucide-react framer-motion sonner date-fns @tiptap/react @tiptap/starter-kit tiptap-extension-highlight react-dropzone",
    "Set up shadcn/ui components into ./components/ui as .js files (convert if template ships .tsx)",
    "Add Google Fonts (Space Grotesk, Inter) in index.html and apply base_css"
  ],
  "image_urls": [
    {
      "category": "background-texture",
      "description": "soft paper grain for page background",
      "url": "https://images.unsplash.com/photo-1651575840358-893132554c88?crop=entropy&cs=srgb&fm=jpg&q=85"
    },
    {
      "category": "background-texture",
      "description": "subtle metallic/linen texture for topbar/hero",
      "url": "https://images.unsplash.com/photo-1695170152817-dd74e43e8aaa?crop=entropy&cs=srgb&fm=jpg&q=85"
    },
    {
      "category": "background-texture",
      "description": "neutral paper split for sections",
      "url": "https://images.unsplash.com/photo-1580122252289-8eccefa9ce2e?crop=entropy&cs=srgb&fm=jpg&q=85"
    },
    {
      "category": "background-texture",
      "description": "pexels light grain 1",
      "url": "https://images.pexels.com/photos/7598387/pexels-photo-7598387.jpeg"
    },
    {
      "category": "background-texture",
      "description": "pexels light grain 2",
      "url": "https://images.pexels.com/photos/6664899/pexels-photo-6664899.jpeg"
    },
    {
      "category": "background-texture",
      "description": "pexels light grain 3",
      "url": "https://images.pexels.com/photos/5691697/pexels-photo-5691697.jpeg"
    }
  ],
  "page_structure": {
    "mobile_first": true,
    "skeleton": [
      "Topbar: title + device + timezone + quick actions",
      "Tabs: Schedule | Editor | History",
      "Schedule: form + bulk-add sheet + upcoming list",
      "Editor: tiptap + markdown export + image insert",
      "History: table with filters/status badges + retry action"
    ]
  },
  "js_scaffolds": {
    "layout": "export default function Dashboard(){ return (<div className=\"min-h-dvh bg-[color:var(--bg)]\" data-testid=\"page-dashboard\"> <header className=\"sticky top-0 z-30 backdrop-blur bg-white/70 border-b\" style={{backgroundImage: 'var(--topbar-grad)'}} data-testid=\"topbar\"> <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between\"> <h1 className=\"font-display text-lg\">Daily Devotions</h1> <div className=\"flex items-center gap-3\"> <span className=\"text-sm text-[color:var(--fg-muted)]\" data-testid=\"topbar-device\">Device: Church Phone</span> </div> </div> </header> <main className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6\"> {/* Tabs and content here */} </main> </div> ); }",
    "schedule_form": "export const ScheduleForm = ({onSubmit}) => { return (<form className=\"space-y-4\" data-testid=\"schedule-form\" onSubmit={onSubmit}> <div className=\"grid grid-cols-1 sm:grid-cols-2 gap-4\"> <div className=\"space-y-1\"> <label className=\"text-sm\">Date</label> <input type=\"date\" className=\"w-full border rounded-md h-10 px-3\" data-testid=\"schedule-date-input\" /> </div> <div className=\"space-y-1\"> <label className=\"text-sm\">Time</label> <input type=\"time\" className=\"w-full border rounded-md h-10 px-3\" data-testid=\"schedule-time-input\" /> </div> </div> <div className=\"space-y-1\"> <label className=\"text-sm\">Message</label> <textarea className=\"w-full min-h-32 border rounded-md px-3 py-2\" data-testid=\"schedule-message-input\" placeholder=\"Add scripture, message, or markdown...\"></textarea> </div> <div className=\"space-y-1\"> <label className=\"text-sm\">Image (optional)</label> <input type=\"file\" accept=\"image/*\" className=\"w-full border rounded-md h-10 px-3\" data-testid=\"schedule-image-uploader\" /> </div> <div className=\"flex items-center gap-3\"> <button className=\"h-10 px-4 rounded-md bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-700)]\" data-testid=\"schedule-submit-button\">Schedule</button> <button type=\"button\" className=\"h-10 px-4 rounded-md bg-transparent border\" data-testid=\"bulk-add-open-button\">Bulk add</button> </div> </form> ); }",
    "editor": "import { useEditor, EditorContent } from '@tiptap/react'; import StarterKit from '@tiptap/starter-kit'; export const DevotionEditor = ({content='<p>Write your devotion...</p>'}) => { const editor = useEditor({ extensions:[StarterKit], content }); if(!editor) return null; return (<div className=\"space-y-3\" data-testid=\"editor\"> <div className=\"flex gap-2\" data-testid=\"editor-toolbar\"> <button onClick={()=>editor.chain().focus().toggleBold().run()} className=\"h-9 px-3 border rounded\" data-testid=\"editor-bold-button\">Bold</button> <button onClick={()=>editor.chain().focus().toggleItalic().run()} className=\"h-9 px-3 border rounded\" data-testid=\"editor-italic-button\">Italic</button> </div> <div className=\"border rounded-lg min-h-64 p-3 bg-white\" data-testid=\"editor-content\"> <EditorContent editor={editor} /> </div> </div> ); }"
  },
  "tables_history": {
    "columns": ["Date", "Preview", "Image", "Status", "Sent At", "Actions"],
    "row_states": {
      "hover": "bg-[rgba(12,18,32,0.02)]",
      "selected": "outline outline-2 outline-[color:var(--primary-600)]"
    },
    "actions": ["view", "edit", "delete", "retry"]
  },
  "empty_states": {
    "schedule": {
      "title": "No messages scheduled",
      "description": "Add your first devotion and set a date/time.",
      "cta": "Schedule devotion"
    },
    "history": {
      "title": "No history yet",
      "description": "When messages are sent, they will appear here with delivery status.",
      "cta": "Create a schedule"
    }
  },
  "cleanup_and_enforcement": {
    "remove_center_alignment": "Delete .App { text-align: center; } from /app/frontend/src/App.css",
    "gradient_restrictions": "Follow the GRADIENT RESTRICTION RULE strictly",
    "no_purple_for_ai": "Not an AI chat; nevertheless avoid saturated purple/pink mixes"
  },
  "component_path": {
    "primary": "./components/ui/* (JS files)",
    "notes": "If your template ships .tsx, convert to .js and use named exports (export const ComponentName = ...)"
  },
  "instructions_to_main_agent": [
    "1) Add CSS tokens to :root in index.css and set body background to var(--bg) with grain texture image_url[0] as subtle overlay (opacity 0.05)",
    "2) Install libraries listed in install_steps",
    "3) Scaffold components under ./components/ui as .js using shadcn/ui patterns",
    "4) Build Dashboard layout with Tabs: Schedule, Editor, History",
    "5) Implement ScheduleForm with date+time inputs (shadcn Calendar+Popover for desktop), message textarea, image upload (react-dropzone) and toasts via sonner",
    "6) Implement BulkAddSheet with textarea for CSV/date|time|message rows and preview table before import",
    "7) Implement DevotionEditor (Tiptap) with markdown export button",
    "8) Implement HistoryTable with status badges (sent/delivered/read/failed) and actions (retry/delete)",
    "9) Ensure all interactive elements include data-testid attributes following kebab-case",
    "10) Use specific transitions only on hoverable elements; never 'transition: all'",
    "11) Respect prefers-reduced-motion and WCAG AA contrast"
  ],
  "web_inspirations": {
    "sources": [
      {"name": "YCloud WhatsApp Scheduler overview", "url": "https://www.ycloud.com/blog/top-whatsapp-message-scheduler/"},
      {"name": "Twilio WhatsApp message scheduling", "url": "https://www.twilio.com/docs/messaging/features/message-scheduling"},
      {"name": "shadcn dashboard examples", "url": "https://ui.shadcn.com/examples/dashboard"}
    ],
    "notes": "Adopt clear status indicators, bulk scheduling flows, and minimal card/table UIs from these references"
  }
}


<General UI UX Design Guidelines>  
    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms
    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text
   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json

 **GRADIENT RESTRICTION RULE**
NEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc
NEVER use dark gradients for logo, testimonial, footer etc
NEVER let gradients cover more than 20% of the viewport.
NEVER apply gradients to text-heavy content or reading areas.
NEVER use gradients on small UI elements (<100px width).
NEVER stack multiple gradient layers in the same viewport.

**ENFORCEMENT RULE:**
    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors

**How and where to use:**
   • Section backgrounds (not content backgrounds)
   • Hero section header content. Eg: dark to light to dark color
   • Decorative overlays and accent elements only
   • Hero section with 2-3 mild color
   • Gradients creation can be done for any angle say horizontal, vertical or diagonal

- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**

</Font Guidelines>

- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. 
   
- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.

- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.
   
- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly
    Eg: - if it implies playful/energetic, choose a colorful scheme
           - if it implies monochrome/minimal, choose a black–white/neutral scheme

**Component Reuse:**
	- Prioritize using pre-existing components from src/components/ui when applicable
	- Create new components that match the style and conventions of existing components when needed
	- Examine existing components to understand the project's component patterns before creating new ones

**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component

**Best Practices:**
	- Use Shadcn/UI as the primary component library for consistency and accessibility
	- Import path: ./components/[component-name]

**Export Conventions:**
	- Components MUST use named exports (export const ComponentName = ...)
	- Pages MUST use default exports (export default function PageName() {...})

**Toasts:**
  - Use `sonner` for toasts"
  - Sonner component are located in `/app/src/components/ui/sonner.tsx`

Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.
</General UI UX Design Guidelines>
