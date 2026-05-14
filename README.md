# Zomerdroom 🌅
## *Onze grote tour — familie Spaan, zomer 2026*

Een installeerbare PWA (Progressive Web App) voor onze "zomerdroom" — drie weken roadtrip in zomer 2026 — Utrecht → München → Zell am See → Dolomieten → Gardameer → Asolo → Venetië → Bergamo → en weer thuis.

## ✨ Features

- 📱 **Installeerbaar als app** op iOS, Android, Windows en macOS
- 🌍 **Werkt offline** na de eerste keer openen (service worker)
- 🎯 **Multiple-choice quiz** met score per locatie (voor Leonora)
- 🔍 **Foto-bingo** met spot-counter (voor Roan)
- 🗣️ **Web Speech API** — tikt op een woord, je telefoon spreekt het uit (NL, IT, DE)
- 🔊 **Voorlezen voor Roan** — quiz-vraag + alle antwoorden met highlight per optie
- 🎫 **Stempelpaspoort** met localStorage persistence
- 🥚 **9 verstopte easter eggs** — typ codes, klik patronen, gebruik gamer-tricks
- 🚗 **Tesla Supercharger plan** + Google Maps directies per halte

## 🚀 Deploy via GitHub Pages

### 1. Initialiseer de repo
```bash
cd "Europa Trip"
git init
git add .
git commit -m "Initial commit — Reisgids Europa 2026"
git branch -M main
git remote add origin https://github.com/<jouw-gebruikersnaam>/zomerdroom-spaan-2026.git
git push -u origin main
```

### 2. Activeer GitHub Pages
1. Ga naar je repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / Folder: **/ (root)**
4. Klik **Save**

Na ±1 minuut staat je gids live op:
```
https://<jouw-gebruikersnaam>.github.io/zomerdroom-spaan-2026/
```

### 3. Als app installeren

**📱 iPhone / iPad:**
1. Open de URL in **Safari**
2. Tik op het deel-icoon (vierkant met pijl omhoog)
3. Scroll en kies **"Voeg toe aan beginscherm"**
4. Erica's gezicht verschijnt als app-icoon

**📱 Android:**
1. Open de URL in **Chrome**
2. Menu → **App installeren** (of de install-knop onderin de gids)
3. App komt op je beginscherm

**💻 Desktop (Chrome/Edge):**
1. Open de URL
2. Klik het install-icoon rechts in de adresbalk
3. Of: gebruik de **"📱 Installeer als app"**-knop onderaan de gids

## 📁 Bestandstructuur

```
Europa Trip/
├── index.html              # De volledige reisgids (~2.7 MB met embedded foto's)
├── manifest.json           # PWA manifest (naam, kleuren, icons)
├── service-worker.js       # Offline-cache strategy
├── README.md               # Dit bestand
│
├── avatars/                # Cartoon-avatars van de familie
│   ├── jarno.png
│   ├── erica.png           # ← gebruikt als app-icoon
│   ├── leonora.png
│   └── roan.png
│
├── icons/                  # PWA icons (gegenereerd uit erica.png)
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-192-maskable.png
│   ├── icon-512-maskable.png
│   ├── apple-touch-icon.png
│   ├── favicon-{16,32,48,64}.png
│   └── favicon.ico
│
└── images/                 # Bron-foto's (al embedded in index.html)
```

## 🔧 Lokale ontwikkeling

Voor de service worker te testen heb je een echte HTTP-server nodig (file:// werkt niet):

```bash
# Met Python (al geïnstalleerd op de meeste systemen)
python3 -m http.server 8000
# Open dan http://localhost:8000/
```

Of met **VS Code Live Server** extensie, of `npx serve .`

## 🎮 Easter eggs cheat sheet (alleen voor papa)

| Trigger | Wat |
|---|---|
| typ `amore` / `erica` / `love` | ❤️ Liefdesnotitie + slideshow voor Erica |
| typ `gelato` | 🍦 IJsregen |
| typ `leonora` | 💖 Sparkles + eenhoorns |
| typ `roan` | 🚀 Raketten + dino's |
| typ `tesla` | ⚡ Bliksem |
| typ `pizza` | 🍕 Pizza-stortbui |
| typ `sterrenstof` | ✨ Goudregen |
| typ `spaan` | 🏆 Activeer jackpot handmatig |
| `↑↑↓↓←→←→BA` | 🏆 Secret achievements |
| 3× klik op ★ in footer | 📜 Help-modal met alle codes |

## 📦 Tech stack

- **HTML5 + vanilla CSS + vanilla JS** (geen frameworks)
- **localStorage** voor persistentie (quiz, bingo, stempels)
- **Web Speech API** voor uitspraak van woorden
- **Service Worker** voor offline ondersteuning
- **CSS Grid + Flexbox** voor responsive layout
- **Mobiel first** ontworpen

---

🌟 Goede zomerdroom, familie Spaan — tot in Italië!
