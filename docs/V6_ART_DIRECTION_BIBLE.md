# V6 Art Direction Bible

This document is the non-negotiable visual source of truth for LK Student Space V6. It governs every active V6 screen, shared primitive, navigation surface, copy decision, and responsive composition choice.

V6 is not an admin dashboard with a better theme. V6 is a premium, cinematic, mobile-first operating system for a dance academy: backstage calm, stage light, artistic discipline, parent trust, teacher speed, and product-grade operational clarity.

## Emotional Tone

- Calm authority: the interface should lower anxiety and make the next action obvious.
- Artistic maturity: every screen should feel edited, rehearsed, and intentional.
- Warm belonging: students and parents should feel held by a studio culture, not processed by software.
- Backstage intelligence: operational users should feel that the system already knows what matters.
- Expensive restraint: fewer objects, fewer borders, fewer colors, stronger hierarchy.

Never use feature-showcase energy, debug language, generic SaaS optimism, school-software clutter, or noisy notification panic.

## Visual Tone

The world is a controlled dark theater with premium mobile product craft.

- Base atmosphere: deep charcoal, velvet purple, burgundy undertones, low house lights.
- Signature light: champagne, ivory, warm amber, soft mint, and rare platinum highlights.
- Domain signals: emerald for healthy studio flow, burgundy/gold for performance energy, royal blue for management, platinum/violet for Super Admin, champagne/mint for shop.
- Materials: velvet depth, editorial glass, soft rim light, stage-floor glow, subtle grain, polished floor reflections.
- Shapes: generous rounded rectangles, capsules, medallions, stage plinths, and sheet-like surfaces. Avoid toy-like blobs.

Every major surface should look lit, not simply colored.

## Color Philosophy

Color is hierarchy and atmosphere, not decoration.

- One dominant temperature per screen.
- One accent family per screen, plus neutral champagne highlights.
- Primary CTAs use ivory/champagne/mint and must be visually rare.
- Warnings use controlled rose/burgundy, never aggressive red floods.
- Success uses emerald with calm confidence.
- Metadata uses white opacity, not gray slabs.

Avoid flat gray panels, random gradients, rainbow accents, harsh white borders, and equal glow on every object.

## Lighting Philosophy

Lighting creates the product identity.

- The app canvas owns the ambient theater light.
- Each screen gets one hero beam or halo.
- Supporting content receives shallow rim light only.
- A section can have a floor glow, curtain gradient, or stage silhouette when it clarifies mood.
- Do not stack unrelated lighting systems in one viewport.

If every surface is equally bright, the screen has no art direction.

## Spacing Philosophy

The rhythm is mobile-first, dense, and breathable.

- Design first for roughly 390px wide iPhone viewports.
- One centered column is the default mobile composition.
- Heroes get air; supporting widgets get compact rhythm.
- Use 2-3 content clusters, then a visual pause.
- Avoid long uninterrupted lists and tile walls.
- Bottom navigation must never overlap meaningful content.

Spacing should feel like a composed scene, not a grid dump.

## Typography Hierarchy

Hebrew RTL is primary.

- Hero headlines: large, tight, emotional, short, and confident.
- Section titles: compact, operational, not decorative.
- Kicker labels: tiny, spaced, cinematic, used sparingly.
- Body copy: warm, concise, studio-specific.
- Metadata: soft and quiet.
- Numbers: Apple Watch complication-like, compact and immediately readable.

Avoid clipped Hebrew, LTR artifacts, repeated generic labels, and technical wording in user-facing surfaces.

## Card And Surface Rules

Do not create a card just because content exists.

Allowed surface types:

- Atmosphere canvas: global theater depth, never interactive.
- Hero surface: one per screen, strongest focal point, one clear next action.
- Editorial section: grouped content with quiet title and breathing room.
- Compact widget: small operational signal, one meaning, no over-explaining.
- Feed row: dense update or message, not a mini-card stack.
- Sheet/dialog: premium mobile overlay with sticky action clarity.
- Raw tool surface: only for Super Admin and only deeper in the hierarchy.

Forbidden patterns:

- Card inside card inside card.
- Equal-weight dashboard grids.
- Tables as the first expression of a screen.
- Big empty panels with placeholder text.
- Harsh borders pretending to be structure.

## Imagery Rules

Real assets are not required for this pass, but visual imagery is required.

When photography is absent, create art-directed placeholders:

- Stage light cones.
- Curtain and velvet gradients.
- Rehearsal-floor arcs.
- Boutique plinths.
- Product window silhouettes.
- Performance memory panels.
- Initial medallions for people, never raw initials in flat circles.

Shop products must be image-first and curated. Media surfaces should feel like studio memories, not upload widgets.

## Motion Rules

Motion should feel like breath and stage cues.

- Use tactile press feedback on buttons and rows.
- Use small fades/lifts for screen entry and sheets.
- Success should be confirmed quietly through toast or state.
- No playful bounce.
- No attention-seeking loops.
- Respect reduced motion globally.

Motion supports focus; it is not decoration.

## Navigation Rules

Navigation is an iOS dock, not a web tab bar.

- Floating, compact, safe-area aware, centered.
- Active state is luminous and obvious.
- Inactive state is quiet but readable.
- The dock should feel light, expensive, and touch-native.
- Header chrome must support identity without stealing the screen focal point.
- No heavy gray bars, no overlap, no noisy badges.

## Density Rules

Each screen must answer in this order:

1. What matters right now?
2. What is the next action?
3. What supports that action?
4. What can stay quiet or hidden?

Show less by default. Prefer compact signals, horizontal rhythm, and editorial grouping over exhaustive display.

## RTL Rules

- Hebrew text aligns naturally right.
- Action rows should preserve right-to-left reading order.
- Icons support meaning but do not break flow.
- Mixed Hebrew/English labels should be rare and intentional.
- Copy should sound warm, precise, and studio-native.
- Avoid UI terms like dashboard, CRM, debug, panel, and feature unless they are truly required.

## Shop Art Direction

Shop is a premium boutique for parents, students, show moments, and studio identity.

- Temperature: champagne, warm amber, cream, soft mint.
- Hero: curated collection, event emotion, one buying path.
- Product cards: image-first stage/plinth area, title, emotional description, price capsule, CTA.
- Event tickets: Apple Wallet-inspired, performance-night energy.
- Private lessons: concierge, premium coordination, not a form.
- Order/payment status: trust-building and calm, never checkout clutter.

## Management Art Direction

Management is a calm command center, not analytics software.

- Temperature: royal blue, sapphire, cool platinum, restrained violet.
- Hero: what needs attention now.
- Content: unresolved messages, attendance risks, private lesson bottlenecks, event readiness, payments/orders, teacher activity.
- Metrics are compact complications.
- Avoid dense tables, generic analytics panels, and loud admin color.

## Super Admin Art Direction

Super Admin is a luxury product operations cockpit.

- Temperature: platinum, violet, deep charcoal, rare champagne.
- Hero: system health and trust state.
- Content: data integrity, broken flows, permission risks, AI diagnostics, recent audit, critical tools.
- Raw/dangerous tools are deeper, quieter, and explicitly framed.
- The mood is precise and powerful, never developer-console raw.

## Screen Temperature Map

- Login: backstage access, warm stage spill, velvet/champagne.
- Home: warm stage/violet, role-aware emotional control center.
- Bottom Nav/App Shell: light iOS dock, champagne active state.
- Shop: champagne/mint boutique.
- More: curated control room.
- User Management: royal blue identity cockpit.
- Private Lessons: concierge champagne/mint.
- Lessons: studio schedule with emerald and discipline.
- Messages: community warmth with controlled urgency.
- Management: royal blue command center.
- Super Admin: platinum/violet product ops cockpit.

## Screen Quality Gate

A V6 screen is not recovered until it passes all checks:

- It has one focal point.
- It has one obvious next action.
- It feels custom-made for LK.
- It reads beautifully at mobile width around 390px.
- It is naturally RTL.
- It is not a stack of equal cards.
- It is not a Tailwind template.
- It is not generic dark SaaS.
- It preserves existing behavior, handlers, permissions, data flow, and audit paths.
- A premium dance academy would proudly show it to parents.
