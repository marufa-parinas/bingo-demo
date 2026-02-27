# Meeting Bingo — Implementation Plan

**Derived from**: PRD v1.0 · Architecture v1.0 · UXR v1.0
**Target**: 90-minute MVP
**Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Web Speech API → Vercel

---

## Phase 1 — Project Setup (20 min)

### 1.1 Initialize project

```bash
npm create vite@latest meeting-bingo -- --template react-ts
cd meeting-bingo
npm install
npm install canvas-confetti
npm install -D tailwindcss postcss autoprefixer @types/canvas-confetti
npx tailwindcss init -p
```

### 1.2 Configure Tailwind

Update `tailwind.config.js` content array to include `./index.html` and `./src/**/*.{js,ts,jsx,tsx}`. Add custom animations (`bounce-in`, `pulse-fast`) per architecture doc.

Update `src/index.css` to include Tailwind directives.

### 1.3 Scaffold folder structure

```
src/
├── components/ui/     # Button, Card, Toast
├── components/        # Feature components
├── hooks/             # useSpeechRecognition, useGame, useBingoDetection, useLocalStorage
├── lib/               # cardGenerator, wordDetector, bingoChecker, shareUtils
├── data/              # categories.ts
├── types/             # index.ts
└── context/           # GameContext.tsx
```

### 1.4 Create type definitions

Create `src/types/index.ts` with all interfaces from the architecture doc:
- `CategoryId`, `Category`
- `BingoSquare`, `BingoCard`
- `GameStatus`, `GameState`, `WinningLine`
- `SpeechRecognitionState`, `Toast`

---

## Phase 2 — Core Game (30 min) · P0

Build in this order — each step is testable before moving on.

### 2.1 Buzzword data

Create `src/data/categories.ts` with all three category packs (40+ words each):
- `agile` — sprint, backlog, standup, velocity, blocker, story points, epic, etc.
- `corporate` — synergy, leverage, circle back, low-hanging fruit, ROI, etc.
- `tech` — API, cloud, microservices, kubernetes, CI/CD, observability, etc.

### 2.2 Card generation logic

Create `src/lib/cardGenerator.ts`:
- Fisher-Yates shuffle
- `generateCard(categoryId)` → picks 24 words, places FREE at `[2][2]`, builds 5×5 `BingoSquare[][]`
- Free space starts `isFilled: true`

### 2.3 BINGO detection logic

Create `src/lib/bingoChecker.ts`:
- `checkForBingo(card)` → checks 5 rows, 5 columns, 2 diagonals; returns first `WinningLine` or `null`
- `countFilled(card)` → integer count
- `getClosestToWin(card)` → returns `{ needed, line }` for "one away" UI hint

### 2.4 Landing page

Create `src/components/LandingPage.tsx`:
- Hero: "🎯 MEETING BINGO", tagline, "New Game" CTA
- "How it works" steps (pick category → enable mic → join meeting → watch squares fill)
- Privacy note: "Audio processed locally. Never recorded."

### 2.5 Category selection

Create `src/components/CategorySelect.tsx`:
- Three cards: Agile 🏃, Corporate 💼, Tech 💻
- Each shows name, description, 3 sample words
- On select → triggers card generation

### 2.6 Bingo card + squares

Create `src/components/BingoCard.tsx` (5×5 grid layout) and `src/components/BingoSquare.tsx`.

Square visual states:
| State | Style |
|-------|-------|
| Default | white bg, gray border |
| Filled (manual) | blue-500 bg, white text, strikethrough |
| Auto-filled | blue-500 + `animate-pulse` briefly |
| Free space | amber bg, ⭐ FREE |
| Winning square | green-500 bg + ring |

### 2.7 App routing + game state

Wire `src/App.tsx` with screen state: `'landing' | 'category' | 'game' | 'win'`

`GameState` flows:
1. Landing → Category → (generateCard) → Game
2. Game → (BINGO detected) → Win
3. Win → Play Again → Category
4. Win → Home → Landing

### 2.8 Manual square toggle

Click on any non-free square → toggles `isFilled`. Run `checkForBingo` after every toggle. Manual fills do NOT set `isAutoFilled`.

**Acceptance check**: BINGO detected for all 12 winning lines (5 rows + 5 cols + 2 diagonals).

---

## Phase 3 — Speech Integration (25 min) · P0

### 3.1 Speech recognition hook

Create `src/hooks/useSpeechRecognition.ts`:
- Config: `continuous: true`, `interimResults: true`, `lang: 'en-US'`
- Auto-restart on `onend` if still supposed to be listening
- Returns: `{ isSupported, isListening, transcript, interimTranscript, error, startListening, stopListening, resetTranscript }`

### 3.2 Word detector

Create `src/lib/wordDetector.ts`:
- `normalizeText()` — lowercase, normalize smart quotes
- `detectWords(transcript, cardWords, alreadyFilled)` — word-boundary regex for single words, substring match for phrases
- `detectWordsWithAliases()` — covers common variations: `ci/cd`, `mvp`, `roi`, `api`, `devops`

### 3.3 Wire auto-fill into game

In `GameBoard`, on each new final transcript segment:
1. Call `detectWordsWithAliases(segment, cardWords, filledSet)`
2. For each detected word, find matching square, set `isFilled: true`, `isAutoFilled: true`, `filledAt: Date.now()`
3. Show toast notification per detected word
4. Run `checkForBingo` → navigate to win if triggered
5. Auto-fill must complete within 500ms of speech (UXR requirement)

### 3.4 Transcript panel

Create `src/components/TranscriptPanel.tsx`:
- Pulsing red dot indicator when listening
- Last ~100 chars of transcript (rolling window)
- Italic interim transcript (gray)
- "Detected: ✨ word" chips for last 5 detected words

### 3.5 Microphone permission flow

Show explicit permission prompt before calling `startListening`:
- Message: "Meeting Bingo uses your microphone to detect buzzwords. Audio is processed locally and is never recorded or sent to any server."
- On deny: fall back to manual-only mode with persistent banner explaining speech unavailable
- Visual indicator in `GameHeader`: 🎤 Listening... / 🎤 Paused

**Acceptance check**: Transcription begins within 1 second of granting permission. Compound phrases ("scope creep", "story points") detected correctly.

---

## Phase 4 — Win State & Sharing (15 min) · P0/P1

### 4.1 Confetti celebration

In `src/components/WinScreen.tsx`, trigger `canvas-confetti` on mount. Keep it subtle (user is in a meeting — no sound by default). Highlight winning line with green-500 ring on all 5 squares.

### 4.2 Game stats

Display on win screen:
- ⏱️ Time to BINGO (from `startedAt` to `completedAt`)
- 🏆 Winning word (last word that completed the line)
- 📊 Squares filled out of 24
- Category played

### 4.3 Share functionality

Create `src/lib/shareUtils.ts`:
- Generate a text summary: `"🎯 BINGO! Sprint Planning | 22 min | Winning word: Scope Creep | 12/24 squares | meetingbingo.vercel.app"`
- On mobile: use `navigator.share()` (native share sheet)
- On desktop: copy to clipboard via `navigator.clipboard.writeText()`

**Acceptance check**: Paste works in Slack, Teams, Discord.

### 4.4 localStorage persistence

Create `src/hooks/useLocalStorage.ts`. Persist `GameState` so card survives tab refresh during a meeting. Clear on "New Game".

---

## Phase 5 — Polish (remaining time) · P1

These ship if time allows; skip if over 90 minutes.

- **"One away" hint**: When `getClosestToWin()` returns `needed === 1`, show pulsing border on the relevant line + toast "⚡ One away from BINGO!"
- **Progress counter**: "X/24 squares filled" in game header
- **New card button**: Regenerate card (same category) before game starts
- **Responsive layout**: Bingo card scales correctly on mobile (use CSS grid with `aspect-square`)
- **Toast system**: Create `src/components/ui/Toast.tsx`, auto-dismiss after 3s

---

## Phase 6 — Deploy · P0

```bash
vercel
```

Accept defaults. Vercel auto-detects Vite. Set build command to `tsc && vite build`, output dir `dist`.

**Pre-deploy checklist** (from architecture doc):
- [ ] App loads on Chrome, Edge, Safari, Mobile Chrome
- [ ] Card generates with 24 unique words + free space
- [ ] Manual tap toggles squares
- [ ] BINGO detected (row/col/diagonal)
- [ ] Speech recognition starts with permission
- [ ] Transcript displays in real-time
- [ ] Buzzwords auto-fill squares
- [ ] Confetti plays on win
- [ ] Share copies to clipboard

---

## UXR-Driven Implementation Notes

Key moments from research that must be nailed:

**First auto-fill (critical delight moment)**: The animation on `isAutoFilled` must be visible and satisfying. Use a brief scale + pulse animation. Show a toast immediately. This moment either builds trust or loses the user.

**Near-bingo tension**: The `getClosestToWin()` indicator transforms passive watching into active listening. Implement in Phase 5 but treat as high value.

**BINGO celebration is discreet by design**: User is still in a meeting. No sound. Confetti only — no full-screen takeover. Keep game stats and share button immediately accessible.

**Manual tap is always available**: Never disable manual square toggle even when speech is active. Per UXR, transcription misses words and users expect the fallback.

**Privacy message must be visible**: Show "Audio processed locally. Never recorded." on both the landing page AND the mic permission prompt. This is a trust blocker.

---

## Priority Reference

| Feature | Priority | Phase |
|---------|----------|-------|
| 5×5 card generation | P0 | 2 |
| Category packs (3) | P0 | 2 |
| Manual tap toggle | P0 | 2 |
| BINGO detection | P0 | 2 |
| Web Speech API integration | P0 | 3 |
| Auto-fill on detection | P0 | 3 |
| Win celebration | P0 | 4 |
| Share result | P1 | 4 |
| localStorage persistence | P1 | 4 |
| Mobile responsive | P1 | 5 |
| "One away" indicator | P1 | 5 |
| Light/dark theme | P2 | post-MVP |
| Custom buzzword lists | P2 | post-MVP |
| Multiplayer sync | P2 | post-MVP |
