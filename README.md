 HEAD
# NoteDeck

A notes + code workspace with syntax highlighting, color tags, templates, and
switchable themes. Ships as a PWA (installable web app), so one deployed link
gives you an app on desktop and mobile — no app store, no Electron build.

## What's inside
- `index.html`, `css/`, `js/` — the app
- `manifest.json`, `sw.js` — makes it installable and works offline
- `icons/` — app icons

Notes are stored locally in the browser (`localStorage`), per device. Use
**Export backup** / **Import** in the sidebar to move notes between devices.

## Deploy it (pick one, all free)

### Netlify (easiest)
1. Go to https://app.netlify.com/drop
2. Drag the whole `notedeck` folder onto the page
3. You get a live URL immediately

### Vercel
1. Install the CLI: `npm i -g vercel`
2. Run `vercel` inside the `notedeck` folder and follow the prompts

### GitHub Pages
1. Push this folder to a GitHub repo
2. Repo Settings → Pages → deploy from the `main` branch, root folder
3. Your app is live at `https://<username>.github.io/<repo>/`

**Important:** the app must be served over **HTTPS** (all options above do
this automatically) — installability requires it.

## Installing on a device
Once deployed:
- **Desktop (Chrome/Edge):** open the link → click the install icon in the
  address bar, or use the "Install app" button that appears in the app itself
- **Android (Chrome):** open the link → menu (⋮) → "Add to Home screen"
- **iPhone/iPad (Safari):** open the link → Share button → "Add to Home
  Screen"

After installing, it opens in its own window/icon like a native app and
keeps working offline (except for loading brand-new fonts/highlighting
styles the very first time).

## Features
- Plain notes with Markdown live preview, and code snippets with syntax
  highlighting across 20 languages (JS, Python, Java, C/C++, Go, Rust, SQL,
  HTML/CSS, and more)
- Color tags for notes, colored language dots for code
- One-click templates: meeting notes, daily journal, todo list, bug report,
  README outline, function stubs
- Four built-in themes, switchable anytime
- Search and filter (All / Notes / Code)
- Export/import as JSON for backup or moving between devices
- Keyboard shortcuts: `Ctrl/Cmd+N` new note, `Ctrl/Cmd+K` search

## Local preview before deploying
From inside the `notedeck` folder:
```
python3 -m http.server 8000
```
Then open `http://localhost:8000` in a browser.

# Note_Taking_App
 684bf97c9c2d943c5d3f9a1d9fc441ecaefb820b
