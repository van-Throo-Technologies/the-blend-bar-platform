# The Blend Bar Platform V1

Production-oriented MVP for **The Blend Bar by Natural Hair Therapist**, beginning with the **Conditioner Edition**.

This is a real Next.js platform rather than a marketing-only landing page. It includes public acquisition, authentication, Stripe Checkout architecture, webhook-driven purchase entitlements, My Blend Bar, Hair Need Assessment V1, Hair Need results, Blend Brief V1, workshop preparation/content placeholders, Supabase persistence and RLS, and a Resend onboarding email.

## Product guardrails built into V1

- Hair Need is based on reported hair behaviour and current condition, not ethnicity or traditional hair typing.
- Hair Characteristics, Current Condition, Hair Need and Blend Brief remain separate concepts in both UX and data/result structure.
- Proprietary decision logic lives only in `lib/assessment/engine.ts`, which is imported by a server route and never shipped to the customer-facing assessment component.
- Customer results do not reveal raw scores, weights or matched rules.
- Conditioner Edition Performance Edit: D-Panthenol, Polyquaternium-7, Sodium PCA, Hydrolyzed Rice Protein, Silk Amino Acids.
- Protein is framed as an informed optional choice, never a universal requirement.
- V1 uses Supabase as the operational back office. No admin UI is included.
- V1 intentionally stops short of a full LMS/video platform. Workshop media uses replaceable content placeholders.

## Architecture

- **Framework:** Next.js App Router + TypeScript
- **UI:** Tailwind CSS
- **Auth / DB:** Supabase
- **Payments:** Stripe hosted Checkout
- **Entitlements:** webhook-driven Supabase `entitlements` rows
- **Email:** Resend + React Email
- **Hosting:** Vercel

### Core flow

1. Visitor explores the public Conditioner Edition landing page.
2. Visitor creates/signs into a Supabase account.
3. My Blend Bar checks `entitlements` for `conditioner-edition-v1`.
4. If not entitled, customer launches Stripe Checkout.
5. `checkout.session.completed` webhook records the purchase and grants entitlement.
6. Resend sends the purchase/onboarding email.
7. Entitled customer completes Hair Need Assessment V1.
8. Server-side assessment engine stores answers plus customer-safe result.
9. Customer sees separate Hair Characteristics, Current Condition, Hair Need and Blend Brief sections.
10. Customer proceeds to workshop preparation and short-video content slots.

## Local setup

### 1. Install

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
```

Fill every required value.

### 3. Supabase

1. Create a Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.
4. In Authentication > URL Configuration, set Site URL to `http://localhost:3000` for local development.
5. Add your production Vercel URL as an allowed redirect URL before launch.
6. Copy Project URL and anon key into `.env.local`.
7. Copy the service role key into `SUPABASE_SERVICE_ROLE_KEY`. **Never expose this value to the browser.**

### 4. Stripe

1. Create a Stripe product for `The Blend Bar — Conditioner Edition`.
2. Create the price you want to sell at. V1 intentionally does not hard-code pricing because pricing is a brand/commercial decision.
3. Put the Stripe Price ID into `STRIPE_CONDITIONER_EDITION_PRICE_ID`.
4. Add the secret key to `STRIPE_SECRET_KEY`.
5. For local webhook testing with the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

6. Copy the resulting signing secret to `STRIPE_WEBHOOK_SECRET`.
7. In production, create a webhook endpoint:

```text
https://YOUR_DOMAIN/api/stripe/webhook
```

Subscribe at minimum to `checkout.session.completed`.

### 5. Resend

1. Create/verify a sending domain in Resend.
2. Create an API key.
3. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
4. The V1 purchase email is in `emails/purchase-welcome.tsx`.

### 6. Run

```bash
npm run dev
```

Visit `http://localhost:3000`.

## GitHub

```bash
git init
git add .
git commit -m "Build Blend Bar Platform V1"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Do not commit `.env.local`.

## Vercel deployment

1. Import the GitHub repository into Vercel.
2. Framework preset should resolve to Next.js automatically.
3. Add every `.env.example` variable to Vercel Project Settings > Environment Variables.
4. Set `NEXT_PUBLIC_APP_URL` to the final production URL/domain, without a trailing slash.
5. Deploy.
6. Add that Vercel/domain URL to Supabase Authentication redirect URLs.
7. Configure the production Stripe webhook URL after the deployment exists.
8. Perform a real/test purchase and confirm:
   - Stripe Checkout succeeds.
   - `purchases` receives a row.
   - `entitlements` receives/updates the active entitlement.
   - onboarding email sends.
   - My Blend Bar unlocks.
   - assessment can be completed and result persists.

## V1 content replacement points

- Landing page copy: `app/(public)/page.tsx`
- Workshop content/video placeholders: `app/(customer)/my-blend-bar/workshop/page.tsx`
- Purchase email: `emails/purchase-welcome.tsx`
- Hair Need Journey copy, chapters and question order: `lib/assessment/journey.ts` (client-safe content only; no scoring)
- Hair Need Journey UI: `components/hair-need-journey.tsx` (state, progress, submission) and `components/hair-need-journey-screens.tsx` (screens)
- Input validation: `lib/assessment/schema.ts`
- Protected decision engine: `lib/assessment/engine.ts`

## Important implementation note on IP

The current Hair Need engine is a **V1 private heuristic layer**, deliberately modest and isolated. It is appropriate for the MVP build pattern, but it should not be treated as the complete NHT methodology. As the proprietary methodology matures, replace or version the internals of the server-only engine while preserving the stable customer-facing result contract. Do not move scores, weights, rules, or formulation logic into client components, public JSON, URL parameters or marketing copy.

## Recommended two-day launch boundary

Ship this V1 once the integrations, final workshop price, brand assets, production copy review and real content links are connected. Do not add a custom admin, complex course progression, community features, certificates, inventory management, formulation calculator or advanced personalization before validating purchase → assessment → Blend Brief → workshop completion.
