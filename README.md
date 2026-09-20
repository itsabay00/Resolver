# Resolve — Customer Service Advisor Assistant

Sidebar (280px), case list, and a resizable AI Assistant panel (400px default) — built to match the Figma file exactly: Lexend throughout, Phosphor icons, and the exact colors from the design plus a semantic error/warning/success/info palette.

## How it's built

- **Frontend:** React + Vite, Tailwind via CDN, Lexend from Google Fonts, icons from `@phosphor-icons/react` (matching the exact glyphs named in the Figma file — Confetti, Book, GearSix, and so on). Responsive: all three panels on desktop (sidebar collapses to an icon rail, AI panel is drag-resizable from its left edge), one screen at a time on mobile (sidebar becomes a drawer, selecting a case opens full-screen chat).
- **Backend:** one Vercel serverless function, `api/claude.js`. It uses whichever key is configured — `ANTHROPIC_API_KEY` first, `OPENAI_API_KEY` as a fallback — so the app isn't locked to one provider. Errors are classified specifically for whichever provider answered: bad connection, exhausted credits, invalid key, rate-limited, provider servers down — each gets its own message, styled with the semantic colors (error `#FF4B49`/`#FFEDED`, warning `#FEBE00`/`#FFF8E5`, success `#01C15A`/`#E6F9EF`, info `#219BFF`/`#E9F5FF`).
- **Storage:** browser `localStorage`. Each device/browser keeps its own knowledge base and cases (see "Known limits").
- **Statuses:** every case is New, Transferred, Waiting for Customer, or Closed — changeable from the chat panel, filterable from the sidebar.
- **Code layout:** `src/lib/` (API client, storage, KB matching, design tokens), `src/components/` (Sidebar, GetStarted, CaseListView, HistoryView, KnowledgeBaseView, SettingsView, ChatPanel, shared UI bits), `src/App.jsx` (the shell, including the resize-drag logic).

## Run it locally

```bash
npm install
cp .env.example .env.local   # paste ONE key — Anthropic or OpenAI — into .env.local
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

Note: plain `vite dev` does **not** run the `/api` serverless function, so the AI features won't work with `npm run dev` alone. To test those locally too, install the Vercel CLI once (`npm i -g vercel`) and run `vercel dev` instead.

## Deploy to Vercel

1. Push this code to GitHub (see the section below).
2. Go to [vercel.com/new](https://vercel.com/new) and import the `Customer-Service-Resolver` repo.
3. Vercel auto-detects it as a Vite project — leave the build settings on default.
4. **Before** clicking Deploy, add ONE environment variable:
   - Key: `ANTHROPIC_API_KEY` (get one at <https://console.anthropic.com/settings/keys>), **or**
   - Key: `OPENAI_API_KEY` (get one at <https://platform.openai.com/api-keys>) if that's the key you have
5. Click **Deploy**. You'll get a live `*.vercel.app` URL to share with testers.
6. From then on, every `git push` to `main` auto-redeploys.

## Pushing this folder to GitHub

```bash
git remote add origin https://github.com/itsabay00/Customer-Service-Resolver.git
git branch -M main
git add -A
git commit -m "Resolve: CS advisor assistant"
git push -u origin main
```

## Known limits (first version)

- **Not shared across a team yet.** The knowledge base and cases live in each browser's `localStorage`. A shared version needs a small real database (e.g. Vercel KV or Supabase) instead — worth doing once you've validated the concept with real users.
- **Real API usage.** Starting a case and every chat message after it is a real API call billed to whichever key is configured. Anthropic usage: <https://console.anthropic.com/settings/usage>. OpenAI usage: <https://platform.openai.com/usage>.
- **Customer data.** Whatever advisors paste into a case is sent to whichever provider is configured, to generate responses. Keep that in mind if you're testing with real customer messages.
- **@ and attachment buttons in chat are placeholders.** They're in the UI to match the design but aren't wired up yet.
- **OpenAI model string.** The OpenAI path uses `gpt-4o` in `api/claude.js` — a safe, well-established choice, but swap it for whatever's current if you'd rather use a newer model.
- **"Acme" branding and the OpenAI/Anthropic logo square are placeholders**, matching the Figma file — swap them for your real name/mark whenever you're ready.
