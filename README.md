1. Hét: Alapok, Architektúra és Adatbázis
Ezen a héten a robusztus háttér és a webshop-tulajdonosok által használt admin felület alapjainak lerakása a cél.

Projekt inicializálása: Monorepo vagy külön frontend/backend setup (pl. Next.js a gyors SSR és API route-ok miatt, vagy Vite + React/Vue + Node.js/Python backend).

Adatbázis és Autentikáció beállítása: PostgreSQL (pl. Supabase, ami az auth-ot is megoldja) felhúzása.

Táblák: users (előfizetők), chatbots (beállítások, színek), knowledge_base (vektoros adatok), chat_logs (ügyfélbeszélgetések).

Admin Dashboard v1: Alapfelület kialakítása, ahol a user regisztrál, létrehoz egy új projektet/botot, és kap egy egyedi Bot ID-t.

2. Hét: AI Motor és RAG (Tudásbázis) Pipeline
A legfontosabb funkció: a chatbot betanítása a magyar webshop egyedi adataira.

Adatfeltöltés implementálása:

Fájlfeltöltő UI (PDF, TXT, CSV) az admin felületen.

Egyszerű web-scraper írása, ami a megadott URL-ről (pl. GYIK oldal) leszedi a szöveget.

Vektorizálás (Embeddings): A szövegek darabolása (chunking) és OpenAI Embeddings API-n keresztüli átküldése. Vektor adatbázis bekötése (pl. Supabase pgvector vagy Pinecone).

AI Válaszgenerálás: OpenAI API (GPT-4o-mini vagy gpt-3.5-turbo) összekötése a vektor keresővel.

Magyar "System Prompt" megírása: Az AI utasítása, hogy kizárólag a betáplált tudásbázisból, magyar nyelven, udvariasan válaszoljon, és ha nem tudja a választ, irányítsa át a usert emberi ügyfélszolgálatra.

3. Hét: A Chat Widget és a "No-code" Builder
A widget, amit a vásárlók látnak, és a felület, amivel a webshoposok személyre szabják.

Testreszabási felület (Builder): Egyszerű űrlapos/drag-and-drop felület az adminban. Chatbot neve, avatár feltöltés, elsődleges színkód és üdvözlő üzenet beállítása. Az adatok mentése a chatbots táblába.

Beágyazható Chat Widget fejlesztése: Egy izolált (Shadow DOM vagy Iframe alapú) React vagy Vanilla JS script megírása, ami nem akad össze a webshopok CSS-ével.

API végpontok: Valós idejű chat API (REST vagy WebSocket) a widget és a backend között.

Embed kód generálása: Egy egysoros <script> tag generálása, amit a webshop tulajdonosa be tud másolni a GTM-be (Google Tag Manager) vagy az oldal head-jébe.

4. Hét: Integrációk és SaaS Fizetés (Stripe)
A termék piacra dobhatóvá és bevételtermelővé tétele.

Stripe Checkout bekötése: Előfizetési csomagok (€30 és €100/hó) létrehozása. Webhook fogadó írása, ami aktiválja/felfüggeszti a chatbot működését a sikeres fizetés/kártyahiba alapján.

Közösségi média csatornák (Messenger & WhatsApp):

Facebook Developer App létrehozása.

Webhookok beállítása, hogy a beérkező Messenger/WhatsApp üzeneteket a backend átirányítsa az AI motorba, és a választ visszaküldje az adott platformra.

Alap e-commerce integráció (WooCommerce / Shopify): Első körben csak a legegyszerűbb API kapcsolat, hogy a bot képes legyen egy rendelési szám alapján lekérdezni a rendelés státuszát (ehhez a user API kulcsot ad meg az adminban).

Magyar nyelvű edge-case tesztelés: Speciális karakterek, ékezetek és tipikus magyar vásárlói szleng/kérdések tesztelése a rendszerben.