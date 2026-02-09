# OKMindful

**Turn 2026 resolutions into results — with stakes, focus, and AI coaching.**

OKMindful is an AI-powered accountability platform that helps people actually achieve their New Year's goals. It combines commitment tracking with optional financial stakes, a built-in focus timer, peer validation, and a context-aware AI productivity coach.

Built for the **Ship Your Best Self Hackathon 2026** — competing in *Productivity & Work Habits* and *Best Use of Opik*.

## Features

### 🎯 Commitment Engine
- Create goals with deadlines and optional financial stakes
- Choose check-in frequency: daily, weekly, or end-of-period
- Stake mode: put money on the line — fail and it goes to charity
- Honor mode: track progress without financial risk

### ⏱️ Focus Timer (Pomodoro)
- Create tasks with session targets
- Configurable focus duration (1–45 minutes) with automatic break timer
- Sessions are logged and tracked toward task completion
- Completion notifications with progress feedback

### 🤖 AI Productivity Advisor
- Context-aware coaching powered by Google Gemini 2.5 Flash Lite
- Knows your active tasks, commitments, streak, and focus stats
- Streaming responses with Markdown rendering
- Multi-conversation support with rename/delete
- Floating chat bubble accessible from any page
- Responds in the same language the user writes in

### 👥 Peer Validation
- Assign friends as validators by username
- Validators can only approve/reject **after** the owner self-assesses
- Fair, transparent accountability process

### 📊 Dashboard & Profile
- Daily streak tracking with activity heatmap
- Focus time statistics and session history
- Commitment progress with visual progress bars
- Simulated balance system ($1,000 demo balance, top-up support)

### 📖 Help & FAQ
- Built-in help center covering all features
- Direct link to AI Advisor for follow-up questions

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19 + TypeScript, custom Liquid Glass design system |
| **Auth & Database** | Supabase (Auth + PostgreSQL) |
| **AI** | Google Gemini 2.5 Flash Lite via `@google/genai` |
| **LLM Observability** | Comet Opik (`opik` + `opik-gemini`) |
| **Prompt Optimization** | Opik Agent Optimizer (MetaPrompt + HRPO) |
| **Markdown** | `react-markdown` for AI response rendering |

## Opik Integration

OKMindful uses Comet Opik extensively for LLM observability and optimization:

1. **Tracing** — Every AI conversation turn is traced with full input/output, metadata, and model version
2. **Feedback Scores** — Automated heuristic scoring per response:
   - `response_length` — Normalized word count
   - `actionability` — Detects bullet points and action items
   - `topic_relevance` — Keyword matching for productivity topics
3. **Online Evaluation** — LLM-as-Judge rules configured in the Opik dashboard
4. **Prompt Versioning** — System prompt version tracked per trace; optimized prompts auto-loaded at runtime
5. **Agent Optimizer** (in `../optimizer/`):
   - Synthetic dataset of 10 gold-standard coaching conversations
   - MetaPrompt optimizer (fast, ~2 min)
   - Hierarchical Reflective Prompt Optimizer / HRPO (deep, ~10 min)
   - Levenshtein-based evaluation metric
   - Optimized prompt auto-loaded by the chat API

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (for auth and database)
- Google Gemini API key
- (Optional) Comet Opik API key for observability

### Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Opik (optional)
OPIK_API_KEY=your_opik_api_key
OPIK_WORKSPACE=your_opik_workspace
OPIK_PROJECT=okmindful
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Prompt Optimization (Optional)

```bash
cd ../optimizer
pip install -r requirements.txt
opik configure
python optimize.py        # MetaPrompt (fast)
python optimize_hrpo.py   # HRPO (deep)
```

The optimized prompt is saved to `optimizer/optimized_prompt.txt` and auto-loaded by the chat API.

## Project Structure

```
okmindfulapp/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout with metadata
│   ├── globals.css           # Liquid Glass design system
│   ├── auth/
│   │   ├── login/page.tsx    # Sign in
│   │   └── register/page.tsx # Sign up
│   ├── dashboard/page.tsx    # Main dashboard
│   ├── commitments/page.tsx  # Commitment management
│   ├── pomodoro/page.tsx     # Focus timer
│   ├── chat/page.tsx         # AI Advisor (full page)
│   ├── profile/page.tsx      # User profile & stats
│   ├── help/page.tsx         # Help & FAQ
│   ├── api/
│   │   ├── chat/route.ts     # Gemini AI endpoint with Opik tracing
│   │   ├── opik-test/route.ts    # Opik integration test
│   │   └── prompt-info/route.ts  # Prompt version info
│   ├── lib/
│   │   ├── store.tsx         # Zustand-style state management
│   │   ├── auth-context.tsx  # Supabase auth provider
│   │   ├── supabase.ts       # Supabase client
│   │   ├── opik.ts           # Opik client singleton
│   │   └── types.ts          # TypeScript interfaces
│   └── ui/
│       ├── AppShell.tsx      # App layout with nav
│       ├── AuthGuard.tsx     # Auth protection wrapper
│       ├── Card.tsx          # Glass card component
│       ├── Stat.tsx          # Stat display component
│       ├── ChatBubble.tsx    # Floating chat widget
│       └── Markdown.tsx      # Markdown renderer
├── public/
│   ├── logo.webp             # App logo
│   ├── logo.png              # Apple touch icon
│   └── logo.ico              # Favicon
└── package.json
```

## Color Palette

| Color | Hex | Usage |
|---|---|---|
| Midnight Navy | `#1A3E5C` | Primary text, headings, dark accents |
| Sage Green | `#8DB15E` | Success states, active elements, progress |
| Golden Yellow | `#F6B132` | CTAs, buttons, highlights |
| Slate Gray | `#D1D5DB` | Borders, secondary elements |
| Off-White | `#F9FAFB` | Background |

## License

Built for the Ship Your Best Self Hackathon 2026.
