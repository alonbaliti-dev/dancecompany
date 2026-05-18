# Product logic + visual audit - 2026-05-18

Scope: V6 real app surfaces only. No backend/schema/API changes approved here.

## Findings

- Home: role-aware data exists, but action wording was too generic (`פתיחת מצב`, `פתיחת היום`, `עדכון קצר`). The visual layout also made those vague actions feel like dashboard modules instead of immediate next steps.
- Home: quick actions were mostly permission-aware, but not purpose-aware enough per role. Super Admin could still see general studio actions before operational system actions.
- Shop: `בוטיק לפני במה` was poetic but less clear than a real commerce surface. The primary product CTA `רכישה` implied checkout even though the current action creates a shop order/notification, not payment.
- Shop: payment method buttons (`Apple Pay`, `Bit`, `אשראי`) behaved like selectable preferences but did not persist or start payment. That is a product-logic mismatch.
- Product cards: card anatomy is closer to commerce, but CTA wording and footer hierarchy needed to reflect the actual action.
- More/settings: sections are grouped, but the AI summary block (`העוזרת החכמה`) reads like a generic dashboard add-on and distracts from settings/navigation purpose.
- Page headers: internal admin screens still contain `LK Stage OS`, which is not user-purpose language.

## Decisions applied safely

- Use clearer Home CTAs based on the actual destination/action.
- Make Home quick actions role-specific using existing roles and permissions.
- Rename the Shop surface to `חנות הסטודיו`.
- Change product CTA from `רכישה` to `הזמנה` because the current frontend creates an order request, not payment checkout.
- Remove fake payment selection buttons from the visible Shop flow.
- Hide the generic AI suggestion block from More/settings until it has a clearer operational purpose.
- Replace `LK Stage OS` kicker with a purpose-neutral `ניהול`.

## Decisions still needed

- Admin-managed home composition needs a persisted model for module ordering, section visibility, role visibility, labels, and CTA labels.
- Shop checkout needs an approved payment flow decision before showing Apple Pay/Bit/credit-card choices as actionable UI.
- AI summaries need a clear product contract: who sees them, what actions they drive, and whether they are editable/approvable by management.
