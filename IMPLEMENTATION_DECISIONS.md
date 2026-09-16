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

## Hair Need V1 — locked methodology decisions

**Definition.** A Hair Need is a functional area of support suggested by the hair fibre's
current condition and observable behaviour, interpreted from multiple relevant observations
rather than from a single product response, routine, hair type or isolated proxy.

- **No product-response inputs.** Conditioner response, product buildup and protein history
  are retired from scoring. They depended on owning and using particular products.
- **No water inputs.** Wetting speed, first-contact behaviour and drying speed are retired
  from scoring. They are not used as proxies for Hair Need, barrier condition, Cuticle
  Integrity Level or porosity.
- **CIL is not calculated in V1** and must never be presented as porosity under a new name.
- **Exposure is supporting evidence.** Colour, chemical and heat exposure can reinforce fibre
  evidence that already exists; it never creates a Hair Need on its own.
- **Strand feel is a Hair Characteristic.** It shapes formulation context and never creates a
  Hair Need.
- **Shedding is never a formulation need.** Where shedding or hair loss is reported it becomes
  a non-diagnostic Wider Hair Health Signal, and breakage only counts as fibre evidence once
  the participant has confirmed broken pieces rather than shed hairs.
- **Whole-person context does not score.** Fluid intake, stress and sleep produce Wider Hair
  Health Signals only.
- **Maintain & Support is a real outcome.** When no area reaches the evidence threshold the
  result is Maintain & Support. The engine never falls back to Hydration Support by tie order,
  and we do not manufacture a problem.
- **The gentle-tension observation is not scored.** It is participant-performed and
  uncontrolled — wetness, force, strand selection and interpretation all vary too much to treat
  it as evidence in this MVP. It stays in the journey as an observation and is recorded as a
  Hair Characteristic. Confirmed fibre breakage remains the core evidence for Strength Support.
- **Deterministic tie-breaking, not a hierarchy.** When two areas qualify with exactly equal
  evidence, a fixed order resolves it so identical answers always produce an identical result.
  That order carries no clinical meaning, does not rank one need above another, and is never
  described to participants as importance. The qualifying runner-up is still kept as the
  secondary need. Presenting concerns are never fed into scoring to break ties.
- **Retired answer keys stay optional in the schema** so historical payloads and stored rows
  remain readable. They are never read by the engine. No destructive migration was run.

### Environment — parked for V2+

Environmental conditions can materially influence hair behaviour and formulation performance.
They are recognised as part of the NHT holistic model but are intentionally outside the V1
Hair Need calculation until they can be captured with sufficient reliability.

This note is for the team. It is not shown to participants, and V1 adds no location, weather,
water-hardness or climate inputs.

## Deliberately not locked in code

### Workshop price
Commercial/brand decision. Managed via Stripe Price ID in environment configuration.

### Final workshop date / cohort model
Not provided as a stable V1 requirement. Content architecture works for live, cohort or evergreen delivery.

### Full proprietary Hair Need methodology
The platform boundary is ready for it, but V1 does not pretend the simplified heuristic is the complete NHT intellectual property.

### Final formula / exact formulation rules
Not exposed or encoded into public/customer UI. Blend Brief gives direction, not proprietary manufacturing logic.
