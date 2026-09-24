# Resolve — Customer Service Advisor Assistant

Sidebar (280px), case list, and a resizable AI Assistant panel (400px default) — built to match the Figma file exactly: Lexend throughout, Phosphor icons, and the exact colors from the design plus a semantic error/warning/success/info palette.

## How it's built

- **Frontend:** React + Vite, Tailwind via CDN, Lexend from Google Fonts, icons from `@phosphor-icons/react` (matching the exact glyphs named in the Figma file — Confetti, Book, GearSix, and so on). Responsive: all three panels on desktop (sidebar collapses to an icon rail, AI panel is drag-resizable from its left edge), one screen at a time on mobile (sidebar becomes a drawer, selecting a case opens full-screen chat).
- **The case queue.** "Get next case" pulls from a small set of realistic simulated cases (`src/lib/seedCases.js`) instead of asking the advisor to type one in — a stand-in for a real inbox or contact form. The moment a case is pulled, the assistant starts reading it and preparing a response automatically; nothing to click to kick that off.
- **Backend:** one Vercel serverless function, `api/claude.js`. It uses whichever AI key is configured — `ANTHROPIC_API_KEY` first, `OPENAI_API_KEY` as a fallback — so the app isn't locked to one provider. Errors are classified specifically for whichever provider answered: bad connection, exhausted credits, invalid key, rate-limited, provider servers down — each gets its own message, styled with the semantic colors (error `#FF4B49`/`#FFEDED`, warning `#FEBE00`/`#FFF8E5`, success `#01C15A`/`#E6F9EF`, info `#219BFF`/`#E9F5FF`).
- **Sending to customers:** a second function, `api/send-email.js`, sends the reply for real via Resend once `RESEND_API_KEY` is set — see "Known limits" for the one restriction that applies until a domain is verified.
- **Images:** the paperclip in chat attaches a real image, which the AI actually reads (Claude/GPT-4o vision) — the frontend sends a provider-neutral shape and the backend translates it for whichever provider is active.
- **Storage:** browser `localStorage`. Each device/browser keeps its own knowledge base and cases (see "Known limits").
- **Statuses:** every case is New, Transferred, Waiting for Customer, or Closed — changeable from the chat panel, filterable from the sidebar.
- **Code layout:** `src/lib/` (API client, storage, KB matching, design tokens, seed cases), `src/components/` (Sidebar, GetStarted, CaseListView, HistoryView, KnowledgeBaseView, SettingsView, ChatPanel, shared UI bits), `src/App.jsx` (the shell, including the resize-drag logic).

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
4. **Before** clicking Deploy, add environment variables:
   - `ANTHROPIC_API_KEY` (<https://console.anthropic.com/settings/keys>) **or** `OPENAI_API_KEY` (<https://platform.openai.com/api-keys>) — pick one
   - `RESEND_API_KEY` (<https://resend.com>) if you want "Send to customer" to actually send — optional, the rest of the app works without it
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
- **Cases are simulated.** "Get next case" pulls from a fixed example set (`src/lib/seedCases.js`), not a real inbox. Swapping in a real channel (a connected email inbox, a contact form) is a separate, bigger task — same shape as connecting the AI key was.
- **Email sending needs a verified domain to reach real customers.** With just `RESEND_API_KEY` set, Resend's shared test address can only send to the email address that signed up for the account — good enough to try the flow, not to reach a real customer. Verify a domain at resend.com/domains and set `EMAIL_FROM` to send for real.
- **Only Anthropic and OpenAI are wired up.** True "any provider" isn't achievable — each has its own request format — but more can be added the same way these two were, in `api/claude.js`.
- **Real API usage.** Every case pulled and every chat message is a real, billed API call. Anthropic usage: <https://console.anthropic.com/settings/usage>. OpenAI usage: <https://platform.openai.com/usage>.
- **Customer data.** Case text and any attached images are sent to whichever AI provider is configured. Keep that in mind if you're testing with real customer messages.
- **@ mentions are still a placeholder.** Image attachments work; the @ button doesn't yet.
- **OpenAI model string.** The OpenAI path uses `gpt-4o` in `api/claude.js` — safe and well-established, but swap it for whatever's current if you'd rather.
- **"Acme" branding and the logo square are placeholders**, matching the Figma file — swap them for your real name/mark whenever you're ready.
- **No knowledge-base bulk upload yet.** Entries are still added one at a time — next on the list.
