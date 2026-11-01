# DropSet – DJ Command Center

A suite of tools built for Afrobeat DJs.  
Built in Cowork with Claude · Editable in VSCode · Runs in any browser.

---

## 📁 Folder Structure

```
DJ_Setlist/
│
├── README.md                   ← You are here
│
└── afroflow/                   ← Main project folder
    │
    ├── index.html              ← HOME — Open this first in your browser
    │
    ├── setlist-generator/      ← Tool 1: AI Setlist Generator
    │   ├── index.html          ← The app UI
    │   ├── style.css           ← All visual styles (colors, layout)
    │   └── app.js              ← All logic + TRACK DATABASE (edit here!)
    │
    ├── epk/                    ← Tool 2: DJ Press Kit (Electronic Press Kit)
    │   ├── index.html          ← Your DJ profile page
    │   └── style.css           ← Styles for the EPK
    │
    └── assets/                 ← Shared assets (add images, fonts here)
        ├── css/
        └── js/
```

---

## 🚀 How to Use

### Open in Browser
1. Go to `afroflow/` folder
2. Double-click `index.html`
3. It opens in your browser — all tools work offline, no internet needed

### Edit in VSCode
1. Open VSCode
2. File → Open Folder → select `DJ_Setlist`
3. You'll see the full structure in the sidebar
4. Edit any file and refresh your browser to see changes

---

## ✏️ How to Customize

### Add Your Own Songs (Setlist Generator)
The easy way: add them in the **Library Manager**. The Setlist Generator builds sets from your library automatically — use the **Track Source** picker to choose:

- **📚 My Library** — only your own tracks (default once your library has songs)
- **📚 My Library + DropSet DB** — your tracks first, topped up with built-in ones to fill the set
- **🎧 DropSet DB only** — just the built-in tracks

To change the built-in tracks instead, open `setlist-generator/app.js` and find the `TRACK_DATABASE` object at the top.  
Each track looks like this:

```js
{ 
  name: "Song Title", 
  artist: "Artist Name", 
  bpm: 106,          // beats per minute
  energy: 7,         // 1 (chill) to 10 (peak hype)
  tags: ["Afrobeats"], 
  vibe: ["hype", "dance", "mixed", "smooth"],   // when to play this
  crowd: ["young", "mixed", "mature"]            // who it works for
}
```

Just copy a line, paste it, and change the values. Save the file and refresh the browser.

### Set Up Your EPK
Open the **DJ Press Kit (EPK)** and click **✨ Start** (later: **✏️ Edit Press Kit**). Fill in the form — name, photo, bio, mixes, videos, venues, quotes and booking contacts. The page builds itself as you type and saves automatically; anything you leave empty is hidden. No code editing needed.

### Change Colors
Each tool has its own `style.css`. At the top you'll find `:root { }` with color variables:
```css
--accent: #f5a623;   /* orange — main brand color */
--bg-dark: #0d0d0d;  /* background */
```
Change these to whatever colors you want.

---

## 💾 Back Up Your Data

Your library and gigs are saved inside your browser — clearing browser data (or switching browser/computer) loses them. Back them up:

1. Open `afroflow/index.html` (DropSet Home) and find **💾 Your Data**
2. Click **⬇️ Download Backup** — you get one file, e.g. `dropset-backup-2026-10-29.json`
3. Keep it somewhere safe (Google Drive, email it to yourself)

To get your data back, or move it to another browser/computer, click **⬆️ Restore from Backup** and choose the file. You'll see what's in it first, then pick:

- **Merge** — keeps everything you have now and adds anything from the backup that's missing
- **Replace everything** — makes your data exactly match the backup

The home page reminds you if you've never backed up, or if your last backup is over 2 weeks old.

---

## 🧪 Testing

After changing any tool, run the automated tests:

```bash
cd tests
npm install   # first time only
npm test
```

See `tests/README.md` for details.

---

## 💡 Tips

- **Share your EPK**: Open `epk/index.html` in Chrome → right-click → Print → Save as PDF → send to promoters
- **Print your setlist**: Use the print button inside the Setlist Generator
- **No internet required**: Everything runs locally in your browser
- **Mobile**: Open the HTML files on your phone too — they're responsive

---

*DropSet v1.0 — Built for DJs, by passion 🔥*
