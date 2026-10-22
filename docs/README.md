# Lead Others Without Losing Yourself

A leadership workshop presentation for a school Prefect Board, available in English and Sinhala.
Subtitle: *Leadership, Responsibility & Time Management.*

Plain HTML, CSS and vanilla JavaScript. No backend, build step, package manager, API key or database.

## Run it

- **Simplest:** open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari).
- **Local server (optional):** from this folder run `python -m http.server 8000` and open `http://localhost:8000`.

Fonts (Manrope, Inter, Noto Sans Sinhala) load from Google Fonts. Offline, the presentation falls back to system fonts (Iskoola Pota or Nirmala UI for Sinhala on Windows) and still works. Icons and illustrations are inline SVG and CSS.

## Language (Sinhala / English)

- Click the language button in the top-right toolbar (shows `සිං` in English mode and `EN` in Sinhala mode), or press `L`.
- The choice is remembered in the browser (`localStorage`).
- Slide text, buttons, help and overview titles are translated. **Speaker notes stay in English.**
- Translations live in `js/i18n-si.js`. Each entry maps the exact English text of an element to its Sinhala HTML. Keep the same inline markup (`<b>`, `<mark>`, `<span class="gold">`, `<br>`) where the English has it.
- If you edit English text in `index.html`, update the matching key in `js/i18n-si.js`. In Sinhala mode, run `window.__i18nMissing` in the browser console to list English strings that have no Sinhala entry (they show in English until added). `window.__i18nKeys()` lists every translatable string.

## Controls

| Key | Action |
| --- | --- |
| Right, Down, Space | Next slide |
| Left, Up, Backspace | Previous slide |
| Home / End | First / last slide |
| F | Toggle fullscreen (Esc exits) |
| N | Toggle speaker notes (presenter panel) |
| G | Slide overview grid |
| L | Switch language |
| T | Start or pause the timer on the current slide (slides 18 and 19) |
| R | Show or hide the prompts on the current slide (slides 4, 13, 17) |
| ? | Help overlay |
| Esc | Close overlay or notes |

Also: on-screen buttons (top right, fade when idle), touch swipe, throttled mouse wheel. The URL hash (`#12`) stores the current slide, so refreshing or bookmarking returns you to the same slide. Keys are ignored while typing in an input, textarea, or editable element.

## Timers

The activity (slide 18) and break (slide 19) slides have manual countdown timers with Start, Pause, Reset, `-1 min` and `+1 min`. The defaults are 15 and 5 minutes; change `data-timer="SECONDS"` in `index.html` to set a different starting value. Timers never advance the slide.

## Slide order

1. Title
2. About the presenter
3. The central question
4. The school scenario
5. Our journey
6 to 18. Understanding leadership, including two slides on well-known good and harmful leaders (7 and 8), ending with the group activity
19. Break
20 to 21. Balancing leadership and studies
22. My experience (a personal story slide with a looping path animation)
23. Closing

## Project structure

```text
prefect-leadership-presentation/
├── index.html            Slides (one <section class="slide"> each), notes, overlays
├── css/styles.css        Theme, layouts, animations, Sinhala typography, print styles
├── js/presentation.js    Navigation, notes, overview, timers, reveals, language switch
├── js/i18n-si.js         Sinhala translations
├── assets/images/        Reserved for optional images (none required)
└── README.md
```

## Editing the content

- **Slide text:** edit the matching `<section class="slide ...">` in `index.html`. Slides appear in document order. Update `js/i18n-si.js` for the Sinhala version.
- **Speaker notes:** edit the `<aside class="notes" hidden>` inside each slide. They are shown only in the `N` panel and never on the slide.
- **Slide titles and sections:** each slide has `data-title` and `data-section` (A to F). Section names are defined at the top of `js/presentation.js` and shown in the footer.
- **Adding or removing a slide:** copy an existing `<section>`, keep `class="slide"` and the data attributes. The slide count, progress bar and overview update automatically.
- **Entrance animation:** add `class="a"` to any element that should animate in. Order in the HTML sets the stagger.
- **Light slides:** add `light` to the slide class. Slightly different dark panel: add `alt`.
- **Colours and fonts:** see the variables at the top of `css/styles.css`.

## Printing a handout

Use the browser's Print dialog (landscape, background graphics on). Each slide prints on its own page; controls, footer and notes are hidden. The print layout follows the current language.

## Attribution

- Fonts: [Manrope](https://fonts.google.com/specimen/Manrope), [Inter](https://fonts.google.com/specimen/Inter) and [Noto Sans Sinhala](https://fonts.google.com/noto/specimen/Noto+Sans+Sinhala), SIL Open Font License 1.1, via Google Fonts.
- Icons: path data from [Lucide](https://lucide.dev), ISC License.
- Illustrations are original CSS and SVG. No photographs or third-party templates are used.

## Known limitations

- The notes panel appears on the same window; there is no separate presenter window. Close it (N) before showing the audience, or mirror only a second display.
- Speaker notes are English only.
- Sinhala translations were written for this deck and should be reviewed by a Sinhala speaker before use.
- Slides use a fixed 1920 x 1080 canvas scaled to fit. On very small or portrait phone screens it is readable only as a small letterboxed slide.
- Fullscreen depends on browser support and user permission.
