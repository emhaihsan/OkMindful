# OKMindful

**Turn your goals into results — with stakes, focus, and AI coaching.**

OKMindful is an accountability platform that helps you achieve your resolutions and goals. It combines commitment tracking with optional financial stakes, a built-in focus timer, peer validation, and an AI productivity coach.

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


## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (for auth and database)
- Google Gemini API key

### Environment Variables

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Opik 
OPIK_API_KEY=your_opik_api_key
OPIK_WORKSPACE=your_opik_workspace
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

## AI Monitoring (Optional)

OKMindful uses Opik to monitor AI conversations for quality and performance:

- **Conversation tracking** — Every chat with the AI advisor is logged
- **Quality scoring** — Automatic scoring for response quality and relevance  
- **Performance insights** — See how well the AI is helping users achieve their goals
