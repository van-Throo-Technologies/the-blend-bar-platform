# V1 Implementation Decisions

## Locked for the MVP

- Stripe-hosted Checkout rather than custom card UI: faster, more secure and lower implementation risk.
- Webhook is the source of truth for paid access; successful browser redirect is not sufficient to grant entitlement.
- Supabase Auth email/password is the first authentication method.
- Supabase functions as V1 back office.
- Assessment engine remains server-only and versioned.
- Every completed assessment is retained rather than overwritten, supporting future progress comparison without building that UI now.
- My Blend Bar is the customer-facing term throughout.
- Video areas are content slots/placeholders rather than an LMS.

## Deliberately not locked in code

### Workshop price
Commercial/brand decision. Managed via Stripe Price ID in environment configuration.

### Final workshop date / cohort model
Not provided as a stable V1 requirement. Content architecture works for live, cohort or evergreen delivery.

### Full proprietary Hair Need methodology
The platform boundary is ready for it, but V1 does not pretend the simplified heuristic is the complete NHT intellectual property.

### Final formula / exact formulation rules
Not exposed or encoded into public/customer UI. Blend Brief gives direction, not proprietary manufacturing logic.
