# LK Student Space Payments Architecture

This is the production payment foundation for LK Student Space. It does not collect card data in React and does not call a real payment provider until LK selects and configures a provider contract.

## Provider Direction

Recommended Israeli providers:

- Tranzila: strong local Israeli acquiring footprint, hosted payment pages, credit card support, Apple Pay / Google Pay support depending on terminal setup, and Bit support through supported acquiring flows. Good candidate when LK wants direct terminal control.
- Cardcom: mature Israeli payment gateway with hosted pages, invoices/receipts options, recurring/payment links, Apple Pay / Google Pay options, and Bit support depending on package. Good candidate when office workflows and receipts matter.
- Grow by Meshulam: fast onboarding, Israeli wallet coverage, Bit and often PayBox-oriented flows, hosted checkout, and small-business operations tooling. Good candidate for quick launch and local wallet UX.

Required method coverage:

- Credit Card: supported by all candidates via hosted/tokenized provider page.
- Apple Pay: supported through provider wallet configuration where enabled.
- Google Pay: supported through provider wallet configuration where enabled.
- bit: preferred Israeli wallet; validate exact provider package before launch.
- PayBox: likely best through Grow/Meshulam-style flows; confirm availability before committing UX copy.
- Manual office payment: supported as an audited management fallback, not as a client-side payment bypass.

## Server Flow

1. Frontend creates an order draft from the cart, ticket, workshop/camp, or private lesson request.
2. Frontend calls `POST /api/payments/create-session` with no card data.
3. Server resolves the amount from database products or private lesson records. Client `amount` is treated only as an expected value and mismatches are rejected.
4. Server creates a provider-hosted payment session through the configured adapter.
5. User completes payment on the provider page, wallet flow, Bit, or PayBox.
6. Provider calls `POST /api/payments/webhook`.
7. Server requires `PAYMENT_WEBHOOK_SECRET`, verifies the HMAC signature, sanitizes metadata, and updates the transaction status.
8. App status is read through `GET /api/payments/status`.
9. Notification and receipt state are derived from `paid`, `failed`, `cancelled`, or `refunded`.
10. Every payment status change creates an audit record.

Legacy aliases:

- `POST /api/payments/create-intent` bridges to the same server-side session behavior.
- `GET /api/payments/verify` is read-only and no longer auto-marks wallet payments as paid.

## Data Models

The typed payment layer defines:

- `PaymentProviderConfig`: academy provider selection, terminal/merchant identifiers, public config, secret reference, enabled methods, active flag.
- `PaymentTransaction`: academy/order/user/provider references, amount, currency, method, status, provider transaction id, timestamps, and safe webhook metadata.
- `ShopOrderPaymentModel`: order id, academy id, user id, line items, total amount, currency, payment status, fulfillment status, timestamps.
- `PrivateLessonPayment`: request id, selected slot id, teacher id, duration, amount, payment status, and `reservedOnlyAfterPaid: true`.

Production persistence should move these from the current in-memory placeholder into Supabase/Postgres tables with RLS and server-only mutation paths.

## Security Rules

- Never store credit card numbers, CVV, PAN, wallet tokens, or provider secrets.
- Never expose provider secret keys to browser code or `NEXT_PUBLIC_*` variables.
- Payment session creation is server-side only.
- Webhook verification is mandatory; unconfigured webhook secrets return an error.
- Amounts are calculated server-side from database products or private lesson records.
- The client cannot decide final price.
- Payment status transitions must be idempotent and audited.
- Refunds require management intent and provider API implementation before real money moves.

## Shop Order Flow

Shop checkout sends product ids and quantities in `checkoutDraft`. The server loads products from the database, verifies they are active and in stock, calculates the total, and rejects mismatches with the client expected amount. Event tickets use the same product flow with `event_ticket` category. Workshops and camps use the `workshop` category.

Statuses:

- `pending`: provider session created or manual/bank transfer waiting.
- `paid`: verified webhook or audited office confirmation.
- `failed`: provider decline/failure webhook.
- `cancelled`: provider/user cancellation.
- `refunded`: provider refund webhook or future refund operation.

## Private Lesson Flow

Private lesson payment opens only after:

- Teacher suggested one or more slots.
- Student/parent selected a slot.
- Request status is `ready_for_payment`.

The server validates `requestId`, `selectedSlotId`, `teacherId`, and `durationMinutes`. Booking is reserved only after payment is confirmed. The older direct booking path must not create online payments because it skips the teacher-slot agreement.

## Manual Office Payment

Management can mark an order paid by office cash, bank transfer, or office terminal through a guarded domain operation. This is an audited fallback and must require management permissions in UI/API before it is exposed.

## Production Checklist

- Select provider: Tranzila, Cardcom, or Grow by Meshulam.
- Confirm method coverage: credit card, Apple Pay, Google Pay, bit, and PayBox if required.
- Store provider secrets in Vercel environment variables or a secret manager.
- Configure webhook URL: `/api/payments/webhook`.
- Configure HMAC/webhook secret and verify provider-specific signature format.
- Replace placeholder hosted session creation with provider SDK/API calls.
- Persist `PaymentProviderConfig`, `PaymentTransaction`, orders, and private lesson payments in Supabase/Postgres.
- Add idempotency keys for session creation and webhook event ids.
- Add receipt generation and notification dispatch after `paid`.
- Add refund API implementation behind management permission guard.
- Run end-to-end sandbox tests for success, failure, cancellation, refund, duplicate webhook, and amount mismatch.
