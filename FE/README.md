# 🤖 MerchantChat - AI Chatbot Platform

Egy teljes körű **AI chatbot platform** magyar webshopok és ügyfélszolgálatok számára. RAG (Retrieval Augmented Generation) technológiával működik, amely lehetővé teszi az AI-nak, hogy csak a betáplált tudásbázis alapján válaszoljon.

## 📋 Tartalomjegyzék

- [Funkciók](#-funkciók)
- [Technológiai Stack](#-technológikai-stack)
- [Szervezet](#-szervezet)
- [Telepítés](#-telepítés)
- [Indítás](#-indítás)
- [Működés](#-működés)
- [API Endpoints](#-api-endpoints)
- [Beágyazás külső weboldalakon](#-beágyazás-külső-weboldalakon)
- [Deployment](#-deployment)

---

## 🎯 Funkciók

### Admin Dashboard
- **Bot Management** - chatbotok létrehozása, szerkesztése, törlése
- **Tudásbázis Upload** - TXT, CSV fájlok feltöltése
- **Tudásbázis Editor** - szöveges szerkesztés, vektorizálás
- **Chat Teszt** - élő chatbot tesztelés
- **Conversation Logs** - összes ügyfél-chatbot beszélgetés
- **Analytics & Statistics** - kérdések, válaszidő, ügyfél megelégedettség

### Ügyfél Chat Widget
- **Interaktív Chat Interface** - szép, reszponzív UI
- **Session Memory** - beszélgetés mentése (localStorage)
- **Message Persistence** - üzenetek frissítés után megmaradnak
- **User Ratings** - 👍/👎 gombokkal értékelés
- **Typing Indicators** - "gépel" animáció

### Beágyazható Widget
- **Embed Script** - `/public/embed.js` - külső weboldalakon használható
- **Responsive Design** - mobile-friendly
- **Fixed Position** - jobb alsó sarok, toggle gomb

### Analytics Dashboard
- **KPI Cards** - összes kérdés, átlag válaszidő, megelégedettség
- **Top Questions** - leggyakoribb kérdések (FAQ)
- **Hourly Chart** - csúcsidők megjelenítése (hisztogram)
- **Satisfaction Rate** - upvote/downvote arány

---

## 🛠️ Technológiai Stack

### Frontend
- **Next.js 16** - React framework, App Router
- **TypeScript** - típusbiztonság
- **Tailwind CSS** - stílus
- **shadcn/ui** - UI komponensek

### Backend
- **Next.js API Routes** - szerver-oldali kód
- **Node.js** - runtime

### AI & NLP
- **Google Generative AI (Gemini 2.5 Flash)** - chat completion
- **Xenova Transformers** - lokális embedding (384 dim)

### Adatbázis
- **Supabase PostgreSQL** - chat logs, tudásbázis
- **pgvector** - vektor keresés

### Autentifikáció
- **Supabase Auth** - bejelentkezés/regisztráció

---

## 📁 Szervezet

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              # RAG chat endpoint
│   │   ├── upload-knowledge/route.ts  # Tudásbázis feltöltés
│   │   ├── upload-files/route.ts      # Fájl feltöltés (TXT, CSV)
│   │   ├── chat-logs/route.ts         # Beszélgetés előzmények
│   │   ├── chat-history/route.ts      # Session-specifikus üzenetek
│   │   ├── analytics/route.ts         # Statisztikák
│   │   └── auth/ensure-profile/route.ts
│   ├── dashboard/
│   │   ├── page.tsx                   # Admin kezdőoldal
│   │   ├── bots/new/page.tsx          # Bot létrehozás
│   │   ├── bots/[botId]/
│   │   │   ├── page.tsx               # Bot beállítások
│   │   │   ├── chat/page.tsx          # Chat teszt
│   │   │   └── logs/page.tsx          # Előzmények
│   │   └── layout.tsx                 # Dashboard layout (sidebar)
│   ├── embed/
│   │   ├── [botId]/page.tsx           # Iframe embed oldal
│   │   └── layout.tsx
│   ├── login/page.tsx                 # Bejelentkezés
│   └── globals.css
├── components/
│   ├── ChatWidget.tsx                 # Ügyfél chat UI
│   ├── FileUploader.tsx               # Fájl feltöltő
│   ├── ChatLogsViewer.tsx             # Log viewer
│   ├── AnalyticsDashboard.tsx         # Statisztikák
│   ├── EmbedIntegration.tsx           # Beágyazási utasítások
│   └── ui/
└── actions/
    ├── auth.ts                        # Auth funkciók
    └── bot.ts                         # Bot CRUD operációk
public/
└── embed.js                           # Beágyazási script
```

---

## ⚙️ Telepítés

### Előfeltételek
- Node.js 18+
- npm vagy yarn
- Supabase account
- Google Gemini API key

### 1. Repository klónozása
```bash
git clone <repo-url>
cd MerchantChat/FE
```

### 2. Environment változók beállítása
`.env.local` fájl létrehozása:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Függőségek telepítése
```bash
npm install
```

### 4. Adatbázis beállítása
Supabase SQL Editor-ban futtasd az inicializálási SQL scripteket:

```sql
CREATE TABLE chatbots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  color_hex text,
  welcome_message text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid NOT NULL REFERENCES chatbots(id),
  content text NOT NULL,
  embedding vector(384),
  created_at timestamp DEFAULT now()
);

CREATE TABLE chat_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid NOT NULL,
  session_id text,
  user_message text,
  bot_response text,
  created_at timestamp DEFAULT now()
);

CREATE TABLE analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid NOT NULL,
  session_id text,
  user_question text,
  bot_response text,
  response_time_ms int,
  user_rating int,
  created_at timestamp DEFAULT now()
);

CREATE EXTENSION IF NOT EXISTS vector;
CREATE INDEX ON knowledge_base USING ivfflat (embedding vector_cosine_ops);
```

---

## 🚀 Indítás

### Fejlesztés
```bash
npm run dev
```
Nyisd meg: [http://localhost:3000](http://localhost:3000)

### Production
```bash
npm run build
npm start
```

---

## 🔍 Működés

### 1. Bot Létrehozása
Dashboard → "Új Bot" gomb → Név, szín, üdvözlő üzenet → Mentés

### 2. Tudásbázis Feltöltés
Bot Settings → 
- **Fájlfeltöltő**: TXT/CSV feltöltés
- **Szöveges szerkesztés**: Direktben beírás

A backend:
- 1000 karakteres chunk-okra darabol
- Xenova embeddings-szel vektorizálja
- Supabase pgvector adatbázisba menti

### 3. Ügyfél Chat Flow
```
Felhasználó: "Mekkora az szállítási díj?"
        ↓
[Vektorizálás - Xenova embedding]
        ↓
[Keresés - RPC match_knowledge() a tudásbázisban]
        ↓
[RAG Prompt - Kontextus + System message + Kérdés]
        ↓
[Gemini API - Válasz generálása]
        ↓
[Mentés - chat_logs + analytics]
        ↓
Chatbot: "A szállítási díj 1500 Ft-tól..."
        ↓
[Felhasználó értékelheti 👍/👎]
```

### 4. Analytics
- Összes kérdés száma
- Átlag válaszidő (ms)
- Leggyakoribb kérdések
- Megelégedettség (upvote/downvote arány)
- Óránkénti eloszlás

---

## 🔗 API Endpoints

### Chat
```
POST /api/chat
Body: { chatbotId, userMessage, sessionId }
Response: { reply, analyticsId }
```

### Tudásbázis
```
POST /api/upload-knowledge      # Szöveges feltöltés
GET /api/upload-knowledge       # Jelenlegi tudásbázis lekérdezése
POST /api/upload-files          # Fájl feltöltés (TXT, CSV)
```

### Előzmények
```
GET /api/chat-history           # Session-specifikus üzenetek
GET /api/chat-logs              # Összes log adminnak
DELETE /api/chat-logs/:id       # Log törlés
```

### Analytics
```
GET /api/analytics?botId=X&days=30      # Statisztikák
POST /api/analytics                     # Rating mentés (👍/👎)
```

---

## 📱 Beágyazás Külső Weboldalakon

### Embed Script
```html
<script src="http://localhost:3000/embed.js?botId=YOUR_BOT_ID"></script>
```

Ez automatikusan hozzáadja a chat widgetet a jobb alsó sarokba.

### Beágyazási Kód Másolása
Admin panel → Bot Settings → "EmbedIntegration" szekció

---

## 🌍 Deployment

### Vercel (Ajánlott)
```bash
npm run build
vercel deploy
```

Vercel Dashboard → Environment Variables → add GOOGLE_GENERATIVE_AI_API_KEY, stb.

### Production Beállítások
- `/public/embed.js` - hardcoded `http://localhost:3000` → valós domain-ra
- HTTPS kötelező
- Rate limiting ajánlott az API routes-okon

---

## 📊 Performance

- **Gemini API** - ~2.1s átlag válaszidő
- **Xenova embeddings** - lokális, offline
- **Supabase pgvector** - gyors vektor keresés
- **Session memory** - localStorage, F5 után megmarad

---

## 🐛 Troubleshooting

### API 429 (Too Many Requests)
Gemini API free tier limitje (20 req/nap). Hiba: "API limit elérve. Kérjük, próbáld újra 10 másodperc múlva!"

### Chat widget nem jelenik meg az embed-ből
- Ellenőrizd: Bot ID helyes-e
- Dev szerver futva van-e (`npm run dev`)
- `/embed/[botId]` route működik-e

### Fájl feltöltés hibája
- Jelenleg: TXT és CSV támogatott
- PDF: Kérjük konvertáld TXT-re

---

## 📝 License

MIT

---

## 🎉 Gyors Start

```bash
# 1. Clone
git clone <repo-url> && cd MerchantChat/FE

# 2. Environment
echo "GOOGLE_GENERATIVE_AI_API_KEY=..." > .env.local

# 3. Install
npm install

# 4. Dev szerver
npm run dev

# 5. Workflow
# - Bejelentkezés: http://localhost:3000/login
# - Bot létrehozása: Dashboard → "Új Bot"
# - Tudásbázis: Bot Settings → FileUploader vagy szöveges editor
# - Chat teszt: "Chat Megnyitása" gomb
# - Analytics: Dashboard kezdőoldal
```

---

**Kérdések?** PR-t nyitni az issues-hez! 🚀
