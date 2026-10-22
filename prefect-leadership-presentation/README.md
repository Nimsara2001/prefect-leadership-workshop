# Lead Others Without Losing Yourself

A two-hour leadership workshop presentation for a school Prefect Board.
Subtitle: *Leadership, Responsibility & Time Management for School Prefects.*

Plain HTML, CSS and vanilla JavaScript. No backend, build step, package manager, API key or database.

## Run it

- **Simplest:** open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari).
- **Local server (optional):** from this folder run `python -m http.server 8000` and open `http://localhost:8000`.

Fonts load from Google Fonts. If you are offline, the presentation falls back to system sans-serif fonts and still works. Icons and illustrations are inline SVG and CSS, so no images are needed.

## Controls

| Key | Action |
| --- | --- |
| Right, Down, Space | Next slide |
| Left, Up, Backspace | Previous slide |
| Home / End | First / last slide |
| F | Toggle fullscreen (Esc exits) |
| N | Toggle speaker notes (presenter panel) |
| G | Slide overview grid |
| T | Start or pause the timer on the current slide (slides 15 and 16) |
| R | Show or hide the prompts on the current slide (slides 3, 10, 14) |
| ? | Help overlay |
| Esc | Close overlay or notes |

Also: on-screen buttons (top right, fade when idle), touch swipe, throttled mouse wheel. The URL hash (`#12`) stores the current slide, so refreshing or bookmarking returns you to the same slide. Keys are ignored while typing in an input, textarea, or editable element.

## Timing (120 minutes)

| Section | Slides | Minutes |
| --- | --- | --- |
| A. Opening and Introduction | 1-4 | 10 |
| B. Understanding Leadership (includes 15 min activity) | 5-15 | 40 |
| C. Break | 16 | 5 |
| D. Balancing Leadership and Studies | 17-25 | 35 |
| E. Practical Weekly Planning Activity | 26-28 | 20 |
| F. Reflection and Closing | 29-30 | 10 |
| **Total** | 30 | **120** |

The original brief's section times added up to 105 minutes, so 15 minutes were added to Sections B and D. Change them if you prefer a different split.

## Project structure

```text
prefect-leadership-presentation/
├── index.html            Slides (one <section class="slide"> each), notes, overlays
├── css/styles.css        Theme, layouts, animations, print styles
├── js/presentation.js    Navigation, notes, overview, timers, reveals
├── assets/images/        Reserved for optional images (none required)
└── README.md
```

## Editing the content

- **Slide text:** edit the matching `<section class="slide ...">` in `index.html`. Slides appear in document order.
- **Speaker notes:** edit the `<aside class="notes" hidden>` inside each slide. They are shown only in the `N` panel and never on the slide.
- **Titles and timing:** each slide has `data-title`, `data-section` (A to F) and `data-minutes`. Section totals are defined in the `SECTIONS` object at the top of `js/presentation.js`. The console warns if slide minutes do not match the section totals or the 120 minute total.
- **Adding or removing a slide:** copy an existing `<section>`, keep `class="slide"` and the data attributes. The slide count, progress bar and overview update automatically.
- **Entrance animation:** add `class="a"` to any element that should animate in. Order in the HTML sets the stagger.
- **Light slides:** add `light` to the slide class. Slightly different dark panel: add `alt`.
- **Timers:** add `data-timer="SECONDS"` to a `.timer` block (copy the markup from slide 15).
- **Colours and fonts:** see the variables at the top of `css/styles.css`.

## Printing a handout

Use the browser's Print dialog (landscape, background graphics on). Each slide prints on its own page; controls, footer and notes are hidden.

## Attribution

- Fonts: [Manrope](https://fonts.google.com/specimen/Manrope) and [Inter](https://fonts.google.com/specimen/Inter), SIL Open Font License 1.1, via Google Fonts.
- Icons: path data from [Lucide](https://lucide.dev), ISC License.
- Illustrations are original CSS and SVG. No photographs or third-party templates are used.

## Known limitations

- The notes panel appears on the same window; there is no separate presenter window. Close it (N) before showing the audience, or mirror only a second display.
- Slides use a fixed 1920 x 1080 canvas scaled to fit. On very small or portrait phone screens it is readable only as a small letterboxed slide.
- Fullscreen depends on browser support and user permission.
