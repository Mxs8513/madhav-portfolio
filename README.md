# madhavsuri.dev

Personal portfolio. Hand-built with plain HTML, CSS, and vanilla JavaScript — no framework, no build step.

Light, Apple-inspired design: off-white canvas, white cards, soft borders, purple accent (`#7C3AED`). Fixed sidebar navigation on desktop; top bar with slide-down menu on mobile.

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Before publishing

Assets:
- [x] Hero photos → three-photo gallery on the right of the hero: `assets/profile-portrait.jpg` (vertical anchor), `assets/profile-casual.jpg` (top-right), `assets/profile-event.jpg` (bottom-right). Replace any file (keep the same names) to update; portrait should stay vertical, the other two horizontal.
- [ ] Optional sidebar avatar photo → `assets/profile.jpg` (the sidebar currently shows an "MS" monogram — swap in a photo if you want)
- [ ] Resume PDF → `assets/Madhav_Suri_Resume.pdf` — the file does not exist yet, but every Resume button already points there
- [x] RiskOS AI screenshot → `assets/riskos-screenshot.png` (real dashboard screenshot, replace anytime)
- [x] RepoPulse screenshot → `assets/repopulse-screenshot.png` (real app screenshot, replace anytime)
- [ ] Reach screenshot → `assets/reach-screenshot.png` (currently a CSS mockup; drop an `<img>` into the Reach `.project-visual` like the other two projects)

URLs to replace (each `href="#"` has a `<!-- PLACEHOLDER -->` comment directly above it in `index.html`):
- [ ] RiskOS AI: GitHub repo URL, Live Demo URL, Demo Video URL
- [ ] RepoPulse: Live Demo URL, Demo Video URL (GitHub points at `github.com/madhav-suri/repopulse` — verify)
- [ ] Reach: Live Demo URL, Demo Video URL (GitHub points at `github.com/madhav-suri/reach` — verify)
- [ ] Time Machine: GitHub repo URL
- [ ] GitHub profile + LinkedIn URLs (sidebar footer, hero, contact) if your handles differ from `madhav-suri`
- [ ] Remove the small "Demo video coming soon" notes under project links once the real video URLs are in

## Deploy

Static files only — works as-is on GitHub Pages, Vercel, Netlify, or Cloudflare Pages. For Vercel: `vercel --prod` from this directory.

## Structure

```
index.html        — all content and copy
css/styles.css    — single stylesheet, organized by section
js/main.js        — mobile menu, sidebar scroll-spy
assets/           — resume PDF, future screenshots
```
