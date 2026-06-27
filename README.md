# 📽️ Augmented Reality Tool Based on mindAR

A web-based augmented reality tool that plays an animated video overlay triggered by a visual marker (image target). Designed for outdoor billboards, indoor exhibitions, social media displays, etc., with bilingual subtitle support. Designed to work on mobile devices, with phone orientation prompt option.

---

## Overview

This project displays an animated video on top of a physical image marker using web-based AR. It was developed as part of a local heritage initiative in Chepelare, Bulgaria, to present the history of the Rhodope mountain fish farms to the public.

The tool provides:
- **Image target detection** — video is triggered by scanning a physical marker
- **Video overlay** — plays an animated video anchored to the marker
- **Bilingual subtitles** — Bulgarian / English with a UI toggle
- **Start screen** in English for broad accessibility
- Export-ready layout for fullscreen billboard display

---

## Project Structure

```
/
├── index.html          # Main app — AR viewer with subtitle overlay
├── target.mind         # Image target marker (compiled with MindAR or equivalent)
├── overlay.mp4         # Animated video overlay
└── README.md
```

---

## The Video

The example video (`overlay.mp4`) is a fluid art painting — purple and white acrylic fluid flows on canvas — animated with **Kling 3.0** via Higgsfield AI, edited in **Final Cut Pro**, and compressed with **Compressor** (Apple Creative Suite).

This is a demonstration asset. Replace `assets/overlays/overlay.mp4` with your own video and `assets/targets/target.mind` to use the tool for a different project.

### Production pipeline

| Step | Tool |
|---|---|
| Image-to-video animation | Higgsfield AI — Kling 3.0 |
| Video editing | Final Cut Pro |
| Compression / export | Compressor (Apple) |

---

## Image Target

The marker file is `target.mind` — a compiled image target used to anchor the video overlay in AR space. The physical printed image must match this marker for detection to work.

To generate your own `target.mind` from a different image, use the [MindAR Image Target Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile).

---

## Subtitles

Subtitles are bilingual (Bulgarian / English) and fully configurable via the `captions` object in the source code.

```javascript
const captions = {
  bg: [
    { time: 3,  text: "Това е демонстрация на опцията субтитри." },
    { time: 8,  text: "" },
    { time: 10, text: "Само задайте момент на появяване." },
    { time: 14, text: "" },
  ],
  en: [
    { time: 3,  text: "This is a demonstration of the subtitles option." },
    { time: 8,  text: "" },
    { time: 10, text: "Just set the moment of appearance." },
    { time: 14, text: "" },
  ],
};
```

- `time` — seconds from video start when the caption appears
- `text: ""` — empty string creates a natural pause between captions

### Subtitle Controls

The UI includes a **subtitle toggle button** with three states, cycling on each tap:

| State | Display |
|---|---|
| Bulgarian | Shows BG captions |
| English | Shows EN captions |
| Off | Subtitles hidden |

The button is always visible during video playback, allowing the viewer to switch language or turn subtitles off at any point.

---

## Usage

1. Place your video file at `overlay.mp4`
2. Place your compiled image target at `target.mind`
3. Edit the `captions` object in `index.html` to match your video timing
4. Open `index.html` in any modern browser with camera access
5. Point the camera at the physical marker — the video will play automatically
6. Use the subtitle button to switch language (BG → EN → Off)

No build tools or dependencies required. Pure HTML/CSS/JavaScript.

---

## Credits

- **Concept & production:** Mountain Sharks STEM Team, Chepelare
- **AI video generation:** Higgsfield AI — Kling 3.0
- **Video editing:** Final Cut Pro
- **Video compression:** Compressor (Apple)

---

## License

MIT — free to use, adapt, and share with attribution.
