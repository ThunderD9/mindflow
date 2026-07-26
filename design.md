# MindFlow OS: Architecture, Design System & Frontend Specification

This document is the authoritative design and architectural blueprint for **MindFlow OS: The Startup Founder Super-App**. Every engineer and AI model (from Pro to Flash Lite) MUST adhere strictly to the visual tokens, Shadcn component compositions, layout hierarchies, and data flows defined herein.

---

## 1. Product Identity & Design Thesis ("Minimal But Cool")

* **Subject**: An elite, autonomous operating system for startup founders and creators that fuses daily task time-blocking, daily journaling/knowledge curation, universal media attachments, bi-directional linking, and autonomous AI analytical execution.
* **Aesthetic Direction**: **Minimal But Cool (Cyber-Velvet Glassmorphism)**. Inspired by industry icons like Linear, Raycast, Cron, and Perplexity. We achieve "minimal" by stripping out noisy admin charts, useless numerical dashboards, and cluttered sidebars. We achieve "cool" through deep velvet dark canvases (`#090A0F`), subtle frosted glass card hover glows (`hover:border-indigo-500/40`), crisp typographic contrast, reactive micro-animations, and instant AI action pills.
* **The Signature Element**: A clean, luminous top navigation header and glowing AI superpower trigger (`✨ Founder AI Copilot`) that reacts dynamically to your schedule and notes.
* **Copywriting & Voice**: Conversational, tuned, active voice from the founder's perspective. Controls describe exact outcomes (e.g., `"Save Reflection"`, `"Analyze with Founder Copilot"`, `"Attach Media"`, `"Schedule to 09:00 AM"`). Never vague, never corporate filler.

---

## 2. Token System & Palette (Strictly Enforced)

All colors in stylesheets and Tailwind utility classes must map to semantic CSS variables defined in `src/index.css`. **Do NOT use raw hex codes or hardcoded Tailwind colors (e.g., `bg-blue-500`) directly inside JSX components.**

### Color Palette Definitions
| Token Name | Hex Reference | Role & Usage Description |
| :--- | :--- | :--- |
| **`--canvas-bg`** | `#090A0F` | Deepest obsidian/velvet background for the main window body. |
| **`--surface-card`** | `#12141F` | Glassmorphic primary cards, panels, and drawer backgrounds. |
| **`--surface-elevated`**| `#1C1F2E` | Modals, active tab controls, input backgrounds, and popovers. |
| **`--border-subtle`** | `#272A3D` | Borders for cards, dividers, tables, and input elements. |
| **`--text-primary`** | `#F8FAFC` | Main high-contrast headings and active body copy (Slate 50). |
| **`--text-muted`** | `#94A3B8` | Subheadings, descriptions, icons, and helper metadata (Slate 400). |
| **`--accent-indigo`** | `#6366F1` | Primary interactive glowing buttons, links, and AI copilot actions. |
| **`--accent-emerald`**| `#10B981` | Positive status, task completion, and success indicator pulses. |
| **`--accent-fuchsia`**| `#EC4899` | High-priority warnings, urgent milestones, and strategic alerts. |

### Typography Rules
* **Display & Headings**: `Plus Jakarta Sans` (weights `600`, `700`, `800`). Use for screen titles, calendar headers, and major structural identifiers.
* **Body, Form Controls & Lists**: `Inter` (weights `400`, `500`). Use for task titles, diary paragraphs, descriptions, and buttons.
* **Data, Timestamps & Identifiers**: `JetBrains Mono` / monospace. Use for hour markers (`09:00 AM`), tags, and word counters.

---

## 3. Universal Media & Link Attachment Specification ("Attach Anything to Anything")

To empower founders with complete organizational control, every entity in the application (Tasks, Daily Reflections, and Weekly Objectives) supports **Universal Attachments**.

### Attachment Data Model (`Attachment`)
```typescript
export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'file' | 'link';
  name: string;
  url: string; // Base64 data URL for private computer files/media, or public https:// URL for links
  size?: number; // Size in bytes for uploaded local files
  createdAt: string;
}
```

### Visual Presentation ("Minimal But Cool" Media Pills)
* **Images (`type: 'image'`)**: Render as clean, rounded thumbnail cards with zoom-to-preview capability.
* **Videos (`type: 'video'`)**: Render as embedded HTML5 video players or compact media pill badges with one-click play.
* **Files / Documents (`type: 'file'`)**: Display as sleek document pills (`📄 PitchDeck_v2.pdf [2.4 MB]`) with an instant desktop download trigger.
* **Web Links (`type: 'link'`)**: Display as cyber-styled URL buttons (`🔗 Figma UI Prototype →` or `🔗 Github Repo →`) opening seamlessly in a new tab.
* **How to Add in UI**: An intuitive **`📎 Attach`** drop-up/down menu button present in both the Task Detail Drawer and the Diary Editor Toolbar with options: *"Upload File/Image/Video"* and *"Paste Web Link"*.

---

## 4. Shadcn UI Composition & Development Rules

To prevent code degradation, ALL models and developers must follow these strict structural patterns:

### 1. Layout & Styling Rules
* **No `space-x-*` or `space-y-*` utilities.** Always use CSS Flexbox or Grid with explicit gap spacing: `flex flex-col gap-4` or `flex items-center gap-2.5`.
* **Shorthand Size Utility**: When width and height are equal, use `size-*` (e.g., `size-8` instead of `w-8 h-8`).
* **Shorthand Truncate**: Use `truncate` instead of `overflow-hidden text-ellipsis whitespace-nowrap`.
* **Zero Window Scroll Traps**: NEVER apply `overflow-hidden`, `overflow-y-auto`, `h-screen`, or `max-h-screen` on `<html`, `<body`, or `<div id="root">`. Allow native window scrollbars to handle document scrolling freely.

### 2. Component Structure (Compose, Don't Reinvent)
* **Full Card Composition**: Always render complete Card structures: `<Card><CardHeader><CardTitle/><CardDescription/></CardHeader><CardContent/><CardFooter/></Card>`. Never dump raw layout divs inside a generic box.
* **Form Layouts**: Use clean Shadcn form primitives (`Input`, `Textarea`, `Button`, `Badge`). Wrap select controls and interactive options in cohesive flex containers.
* **Tabs Accessibility**: Every `<TabsTrigger>` MUST be wrapped directly within a `<TabsList>`.
* **Dialogs & Overlays**: All modals (Dialog, Sheet, Drawer) MUST include an explicit Title (`DialogTitle` or `SheetTitle`) for ARIA screen reader compliance. Use `className="sr-only"` if visually hidden.
* **Separator**: Always use official Shadcn `<Separator />` instead of raw `<hr>` or styled border divs.
* **Badges**: Always use official Shadcn `<Badge variant="outline" | "secondary" | "default">` for category pills, timestamps, and priority markers.

---

## 5. Core Feature & Layout Architectural Modules

The application is structured into four primary interactive view suites accessible from the minimalist Top Navigation bar:

### A. Hourly Time-Blocking Daily Timeline (`DailyTimelineView.tsx`)
* **Purpose**: Allows founders to visually map out their entire day hour by hour (**6:00 AM to 11:00 PM** or 24h mode).
* **Layout & Behavior**:
  * Left Column: Hour timestamp labels (`06:00 AM`, `07:00 AM`, etc.) in tabular monospace.
  * Right Main Feed: Droppable/clickable time slots. Clicking an empty slot prompts an inline task assignment with duration and media attachments.
  * Visual Progress Indicator: A soft glowing horizontal line indicating the active current time of day.

### B. Linear-Inspired Founder Task Engine (`TaskBoard.tsx`)
* **Purpose**: High-speed, distraction-free action item planning categorized by Day of Week (`Mon` to `Sun`) and strategic goal category (`Work`, `Product`, `Fundraising`, `Health`, `Ideas`).
* **Interactive Behavior**:
  * Inline top bar for rapid entry (Type & press Enter). Includes scheduled time picker and priority selector.
  * Clicking any task row smoothly expands an inline or slide-over **Deep Detail & Attachment Editor**.
  * **Universal Attachment Suite**: Add files, images, videos, or Notion/Figma links right to any task.
  * **Bi-Directional Linking Control**: Within the detail editor, founders can select any Diary Entry or Strategy Note to link directly to the task.

### C. Chat-Inspired Diary & Knowledge Workspace (`JournalWorkspace.tsx`)
* **Purpose**: A calm, focused markdown editing environment centered around an interactive Calendar Grid.
* **Interactive Behavior**:
  * **Interactive Month & Week Calendar**: Left-hand navigation panel where selecting any date immediately opens or initializes that day's reflection note.
  * **Visual Formatting & Media Bar**: A sticky toolbar above the writing canvas featuring buttons (`Title`, `Sub-title`, `Bold`, `Bullet`, `Checkbox`, `Insert Time`, `📎 Attach Media/Link`) that format text and embed attachments cleanly.
  * **Local File Systems Integration**: Explicit `"Save .md"` and `"Open .md"` backup controls for native computer storage independence.

### D. Autonomous Founder AI Copilot (`AiCopilotDrawer.tsx` & `geminiService.ts`)
* **Purpose**: Built-in startup strategic intelligence powered by the latest **Gemini 3.6 Flash** and **Gemini 3.6 Pro / Ultra** architectures.
* **Key Analytical Capabilities**:
  * **One-Click Strategy Analysis**: Buttons embedded within Tasks and Diary views that automatically trigger prompt syntheses (e.g., `"AI Pitch & Strategy Critique"`, `"AI Summarize Today's Bottlenecks"`).
  * **Autonomous Tool Execution**: The AI Copilot can execute native tool calls (`create_task`, `update_task`, `add_diary_entry`) directly on the user's workspace upon receiving spoken or typed founder directives.
  * **Local Key Governance**: Users can plug in their free Google AI Studio API key locally via `SettingsModal.tsx`, persisted directly in localStorage with zero server tracking.

---

## 6. Verification & Quality Checklist for Any Modifications

Before ending any work turn, all developers and AI agents must confirm:
1. [ ] **Zero Compile Errors**: Vite development server runs without syntax or bundling errors.
2. [ ] **Natural Document Scrolling**: Page content scrolls freely; no clipping or dead overflow traps.
3. [ ] **Shadcn Alignment**: All UI widgets utilize official primitive components with `flex gap-*` layouts.
4. [ ] **Clickable File Links**: All technical explanations and documentation refer to specific file paths with `file:///` schemes.
