# Zomerdroom 🌅
## *Onze grote tour — familie Spaan, zomer 2026*

Een installeerbare PWA (Progressive Web App) voor onze "zomerdroom" — drie weken roadtrip in zomer 2026 — Utrecht → München → Zell am See → Dolomieten → Gardameer → Asolo → Venetië → Bergamo → Luzern → Mannheim → en weer thuis.

**🔗 Live:** [https://JSpaan89.github.io/zomerdroom-2026/](https://JSpaan89.github.io/zomerdroom-2026/)

## ✨ Features

### De reisgids
- 📱 **Installeerbaar als app** op iOS, Android, Windows en macOS
- 🌍 **Werkt offline** na de eerste keer openen (service worker v3.0.0)
- 🗺️ **Geanimeerde Europa-kaart** met de Tesla die over de route rijdt
- 🎯 **Multiple-choice quiz** met score per locatie (voor Leonora)
- 🔍 **Foto-bingo** met spot-counter per locatie (voor Roan)
- 🗣️ **Web Speech API** — tikt op een woord, je telefoon spreekt het uit (NL, IT, DE)
- 🔊 **Voorlezen voor Roan** — quiz-vraag + alle antwoorden met highlight per optie
- 🎫 **Stempelpaspoort** met localStorage persistence
- 🍦 **IJsjes- en pizza-meter** voor on-the-go tellen
- 🥚 **Elf verstopte easter eggs** — typ codes, klik patronen, gebruik gamer-tricks

### 🏆 Quest Mode
- 👥 **Avatar-profielkaarten** met taglines, skills en XP-levels per familielid
- 🎯 **72 dagquesten** verdeeld over 9 locaties, met specialiteit-bonus per avatar
- 🏅 **12 verzamelbadges** — cross-feature triggers met ijsjes/pizza/stempels
- 🎮 **Zeven mini-games**

### 🎮 Mini-games
- 💎 **Gelato Blast** — match-3 met avatar-power-ups (Jarno/Erica/Leonora/Roan) en level-up easter eggs
- 🏁 **Tesla Dash** — endless runner met landschap parallax langs de bestemmingen
- 🏎️ **Roan's Racing** — top-down racegame met dag/nacht-cyclus, koplampen, lantaarnpalen, gelato- en pizza-powerups
- 🎲 **Roadtrip Bingo** — spot 9 dingen uit het auto-raam
- 🌍 **Welk land?** — vlaggenraadsel
- 🧠 **Memory** — avatar-paren met flip-animatie en power-ups
- 📸 **Spot Landmark** — koppel monument aan stad
- ⚡ **Tesla-spot** — counter voor andere Tesla's

## 🚀 Deploy via GitHub Pages

### Workflow voor updates
1. Edit lokaal in `C:\Users\j.spaan\OneDrive - Gpi Tanks - Process Equipment\Documents\Claude\Projects\Europa Trip\`
2. Ga naar [github.com/JSpaan89/zomerdroom-2026](https://github.com/JSpaan89/zomerdroom-2026) → **Add file** → **Upload files**
3. Sleep aangepaste bestanden in (`index.html`, `service-worker.js`, etc.)
4. Commit met versie-beschrijving
5. Pages doet de rest — ~2–5 min wachten en hard-refresh

### GitHub Pages activeren (eenmalig)
1. Repo → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / Folder: **/ (root)**
4. **Save**

### 3. Als app installeren

**📱 iPhone / iPad:**
1. Open de URL in **Safari**
2. Tik op het deel-icoon (vierkant met pijl omhoog)
3. Scroll en kies **"Voeg toe aan beginscherm"**

**📱 Android:**
1. Open de URL in **Chrome**
2. Menu → **App installeren** (of de install-knop onderin de gids)

**💻 Desktop (Chrome/Edge):**
1. Open de URL
2. Klik het install-icoon rechts in de adresbalk

## 📁 Bestandstructuur

```
Europa Trip/
├── index.html              # De volledige gids ~3.9 MB met embedded foto's
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline-cache (v3.0.0)
├── README.md               # Dit bestand
│
├── avatars/                # Cartoon-avatars + Tesla sprites
│   ├── jarno.png, erica.png, leonora.png, roan.png
│   ├── tesla-side.png      # Zij-aanzicht voor map + Tesla Dash
│   ├── tesla-top.png       # Bovenaanzicht voor Roan's Racing
│   └── tesla-side@2x.png, tesla-top@2x.png
│
├── icons/                  # PWA icons gegenereerd uit erica.png
│
└── images/                 # Tesla-renders (familiefoto's zitten base64 in index.html)
    ├── tesla-in-auto.jpg   # Splash van Roan's Racing
    ├── tesla-interior.jpg  # Quest Mode hero
    └── tesla-hero.jpg      # Tesla-overlay
```

> **Privacy**: persoonlijke familiefoto's zijn base64-embedded in `index.html` zelf — ze staan dus niet als losse bestanden op de publieke GitHub repo.

## 🔧 Lokale ontwikkeling

Voor de service worker te testen heb je een echte HTTP-server nodig (file:// werkt niet):

```bash
# Met Python (al geïnstalleerd op de meeste systemen)
python3 -m http.server 8000
# Open dan http://localhost:8000/
```

## 🎮 Easter eggs cheat sheet (alleen voor papa)

| Trigger | Wat |
|---|---|
| typ `amore` / `erica` / `love` | ❤️ Liefdesnotitie + slideshow voor Erica |
| typ `italia` / `italie` / `garda` | 🌅 Italië-droom slideshow |
| typ `samen` / `altijd` | ⏳ Tijdmachine slideshow |
| typ `gelato` | 🍦 IJsregen |
| typ `leonora` | 💖 Sparkles + eenhoorns |
| typ `roan` | 🚀 Raketten + dino's |
| typ `tesla` | ⚡ Bliksem |
| typ `pizza` | 🍕 Pizza-stortbui |
| typ `sterrenstof` | ✨ Goudregen |
| typ `spaan` | 🏆 Activeer jackpot handmatig |
| `↑↑↓↓←→←→BA` | 🏆 Secret achievements |
| 3× klik op ☀️ op de cover | ❤️ Erica modal |
| 5× klik op cover-tagline | 🌅 Italië-droom |
| 3× klik op footer-tekst | ⏳ Tijdmachine |
| 5× klik op titel | 🎮 Achievements |
| 3× klik op ★ in footer | 📜 Help-modal met alle codes |

## 📦 Tech stack

- **HTML5 + vanilla CSS + vanilla JS** (geen frameworks)
- **localStorage** voor persistentie (quiz, bingo, stempels, quest-state, high-scores)
- **Web Audio API** voor sound engine (synth tones, motor-rumble, toeter)
- **Canvas API** voor mini-games (Gelato Blast, Tesla Dash, Roan's Racing, Memory)
- **SVG** voor de Europa-kaart en geanimeerde Tesla
- **Service Worker** voor offline ondersteuning + network-first HTML
- **CSS Grid + Flexbox** voor responsive layout
- **Mobiel first** ontworpen, alle games full-screen op telefoon

---

🌟 Goede zomerdroom, familie Spaan — tot in Italië!
