# UI gap analysis - 2026-05-18

Reference: `public/reference/lk-mobile-ux-blueprint.png`.

Baseline screenshots captured at 390px:

- `before-home-390-gap-analysis.png`
- `before-shop-product-cards-390-gap-analysis.png`
- `before-schedule-390-gap-analysis.png`
- `before-notifications-390-gap-analysis.png`
- `before-more-390-gap-analysis-retry.png`
- `before-bottom-nav-390-gap-analysis.png`
- `before-product-sheet-390-gap-analysis.png`

## Cross-screen root causes

- Layout structure gap: every screen still starts with a heavy global user chrome, then another large screen header. The reference uses a compact top bar and lets the current task own the first visual moment.
- Typography gap: screen titles remain too large and too bright relative to supporting text; form and card labels compete with titles.
- Spacing/density gap: rows are wrapped in repeated rounded surfaces, creating dashboard blocks rather than native list rhythm.
- Card anatomy gap: product cards and lesson rows have detached metadata and CTAs instead of a fixed anatomy where media/info/action belong to one scannable object.
- RTL hierarchy gap: several layouts use the right text edge correctly, but trailing actions and icons often float in ways that make the Hebrew reading path unclear.
- CTA placement gap: important actions often live in separate cards or duplicated sheet action areas instead of being attached to the row/form they affect.
- Visual atmosphere gap: dark/glass styling is present, but repeated large black panels make the product feel like an admin dashboard rather than a practical iPhone app.
- Interaction gap: the bottom nav and sheet structure consume too much vertical space; forms require too much scrolling before the actual task begins.

## Surface notes

### Home

- Why it feels wrong: the first screen is still a stacked dashboard with two headers before useful actions.
- Structural fix: shrink global chrome, make the home top a compact "today" strip, attach the next action directly to the status card, and turn secondary items into dense rows.

### Shop and product cards

- Why it feels wrong: product cards are horizontal rectangles with oversized placeholder media and detached edit/buy actions; storefront metrics still feel like admin stats.
- Structural fix: convert product cards into compact commerce tiles, attach price/actions to the product footer, remove fake metric emphasis, and use a denser product grid.

### Schedule

- Why it feels wrong: lessons read as repeated dark cards instead of a schedule; time and attendance action do not form a clear row system.
- Structural fix: use a list-first schedule row with time/status/action aligned as one unit.

### Notifications

- Why it feels wrong: notifications are split into multiple big panels, which adds dead space and weakens urgency.
- Structural fix: use one compact inbox structure with unread action in the header and feed rows grouped by section labels.

### More/settings

- Why it feels wrong: settings are presented as many oversized action cards with decorative surfaces.
- Structural fix: use native settings-list rows grouped by section, with smaller row height and clear chevrons.

### Bottom nav

- Why it feels wrong: the dock is visually heavy and tall; active state looks like another card.
- Structural fix: reduce dock height, border, radius, and active glow so it behaves like a native iPhone tab bar.

### Sheets/modals

- Why it feels wrong: product sheet repeats title/action content, starts with a giant summary card, and shows large fields immediately under a tall header.
- Structural fix: compact sheet chrome, one sticky bottom action group, tighter form groups, and no duplicated hero-style sheet header.
