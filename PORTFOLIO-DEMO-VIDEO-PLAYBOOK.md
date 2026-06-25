# Inline portfolio demo video — reusable playbook

This is the exact recipe used to add the autoplaying inline 4K-quality demo video
to the **RepoPulse** card on madhavsuri.com. Reuse it for RiskOS, DIYA, etc.

There are two ways to use it:

- **Fast path:** open the target project in Claude IDE and paste the prompt in
  the next section (“PASTE THIS INTO CLAUDE”). Fill in the 5 blanks.
- **Manual path:** follow “The recipe, step by step” yourself.

Key facts that stay constant:

- Reusable recorder tool lives at: `/Users/saimadhav/Downloads/repopulse-prepare-deploy/demo/`
  (contains `record-demo.js` + `package.json`; works against any URL).
- Portfolio repo: `/Users/saimadhav/madhav-portfolio` → GitHub `Mxs8513/madhav-portfolio`
  `main` → auto-deploys to **madhavsuri.com** on Vercel. `git push` = deploy.
- ffmpeg: the recorder installs `@ffmpeg-installer/ffmpeg`; reuse that binary.

---

## PASTE THIS INTO CLAUDE (fill in the 5 ⟨blanks⟩)

```
Add an autoplaying inline demo video to my portfolio for THIS project, exactly
like my RepoPulse one. Follow this proven recipe end to end and deploy it.

PROJECT-SPECIFIC VALUES:
  ⟨1⟩ Project display name + subtitle: e.g. "RiskOS AI" / "AI Fraud Operations Console"
  ⟨2⟩ How to run this app locally (or a deployed URL to film): e.g. `npm run dev` → http://localhost:3000
  ⟨3⟩ The feature walkthrough I want, click by click (pages/buttons to visit, in order)
  ⟨4⟩ The portfolio project card to embed into: <article id="⟨card-id⟩"> in /Users/saimadhav/madhav-portfolio/index.html
  ⟨5⟩ Accent color (hex), default #7c3aed

STEPS:
1. Copy the recorder tool into this project:
   cp -r "/Users/saimadhav/Downloads/repopulse-prepare-deploy/demo" ./demo
   cd demo && npm install
2. In demo/record-demo.js: set CONFIG.url to my dev/deployed URL, CONFIG.outName,
   CONFIG.title/subtitle/accent, and rewrite script(page, d) to do the walkthrough
   in ⟨3⟩. Use robust locators: page.getByRole('link'|'button',{name}),
   page.getByPlaceholder(...). Add d.step('n / N · Page') + d.caption('...') per
   feature, and call d.settle() after any navigation/data load so the camera never
   sits on a spinner. Keep the intro/outro title cards.
3. Start the app, then record:  node record-demo.js   (produces demo/out/<name>.mp4 at 3840x2160)
4. Watch out/*.mp4. If there's a dead pause, cut it (example removes 11s–30s):
   FF=$(node -e "console.log(require('@ffmpeg-installer/ffmpeg').path)")
   "$FF" -y -i out/<name>.mp4 -filter_complex \
     "[0:v]trim=0:11,setpts=PTS-STARTPTS[a];[0:v]trim=30,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1[out]" \
     -map "[out]" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -an out/<name>-cut.mp4
5. Make a web-optimized 1080p encode (small + fast-loading; keep the 4K as a local master):
   "$FF" -y -i out/<name>-cut.mp4 -vf "scale=1920:1080:flags=lanczos,format=yuv420p" \
     -c:v libx264 -preset slow -crf 24 -movflags +faststart -an out/<name>-web.mp4
6. Copy assets into the portfolio:
   cp out/<name>-web.mp4 /Users/saimadhav/madhav-portfolio/assets/⟨card-id⟩-demo-web.mp4
   (also drop a poster screenshot if the card doesn't already have one)
7. In /Users/saimadhav/madhav-portfolio/index.html, inside <article id="⟨card-id⟩">,
   replace the screenshot <div class="project-visual project-visual--img">…<img></div>
   with the inline <video> block below, and DELETE that card's "Demo Video" button.
8. In /Users/saimadhav/madhav-portfolio/css/styles.css, ensure the
   `.project-visual--video video` rule exists (it already does from RepoPulse —
   reuse it; don't duplicate).
9. Gitignore the heavy masters so only the ~7MB web file ships:
   echo "assets/⟨card-id⟩-demo-4k*.mp4" >> /Users/saimadhav/madhav-portfolio/.gitignore
10. Deploy: from /Users/saimadhav/madhav-portfolio run
    git add -A && git commit -m "Embed inline ⟨project⟩ demo video on project card" && git push origin main
    Then verify live: curl -sI https://madhavsuri.com/assets/⟨card-id⟩-demo-web.mp4 (expect 200 video/mp4).

The recording uses my real API keys if the app makes live calls, so it costs a
little per run — get the script right, then do one final clean recording.
```

---

## The inline `<video>` block (paste into the card's visual area)

```html
<div class="project-visual project-visual--video" aria-label="⟨Project⟩ product demo video">
  <video
    src="assets/⟨card-id⟩-demo-web.mp4"
    poster="assets/⟨card-id⟩-screenshot.png"
    autoplay
    muted
    loop
    playsinline
    controls
    preload="auto"
    aria-label="⟨Project⟩ product demo — guided walkthrough"
  ></video>
</div>
```

## The CSS (already in css/styles.css — reuse, don't duplicate)

```css
.project-visual--video video {
  display: block; width: 100%; height: auto;
  aspect-ratio: 16 / 9; object-fit: cover; background: #08080b;
  border: 1px solid var(--border-strong); border-radius: 14px;
  box-shadow: 0 2px 5px rgba(17,17,26,0.05), 0 24px 60px rgba(17,17,26,0.12);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.project:hover .project-visual--video video {
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(17,17,26,0.05), 0 28px 68px rgba(124,58,237,0.13);
}
```

---

## The recipe, step by step (what the prompt automates)

1. **Recorder** — `demo/record-demo.js` launches headless Chromium with video
   recording, injects an eased fake cursor + click ripple + lower-third captions +
   a top-right step chip + branded intro/outro cards, performs the real clicks/
   typing, then transcodes to a 4K H.264 MP4. Edit only `CONFIG` and `script(page, d)`.
2. **Director moves** inside `script`: `d.card/hideCard`, `d.step`, `d.caption`,
   `d.type(locator,text)`, `d.click(locator)`, `d.moveTo`, `d.scroll`, `d.pause`,
   `d.settle()` (waits out loading spinners — important, the sidebar nav full-
   reloads each page).
3. **Trim** dead time with the ffmpeg `trim+concat` filter (step 4 above).
4. **Optimize** to a 1080p ~7 MB web encode (step 5). 4K inline in a small card is
   wasted bytes and won't load fast; keep the 4K as a local master only.
5. **Embed** by swapping the card's `--img` visual for the `--video` block and
   removing that card's "Demo Video" button.
6. **Deploy** by pushing the portfolio repo to `main` — Vercel auto-builds and
   madhavsuri.com updates within ~a minute. Verify with `curl -sI` on the asset.

### Gotchas learned the hard way
- A 40+ MB 4K file won't autoplay inline (black box) — always ship the ~7 MB web
  encode; gitignore the masters.
- Sidebar/nav links that are plain `<a href>` cause full page reloads that wipe
  the overlay — the recorder re-applies the caption/step after each nav (already
  handled); just keep using `d.settle()` after navigations.
- Browser/phone cache: HTML is `max-age=0, must-revalidate` (always fresh) but
  assets cache for a day. If you reuse a filename, hard-refresh to see changes; to
  guarantee instant updates for everyone, bump the filename (e.g. `…-web.v2.mp4`).
