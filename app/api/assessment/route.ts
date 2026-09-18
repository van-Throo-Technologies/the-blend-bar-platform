import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assessmentSchema } from '@/lib/assessment/schema'
import { deriveCustomerResult } from '@/lib/assessment/engine'
import { getConditionerEntitlement } from '@/lib/commerce/entitlement'
import { CURRENT_EDITION } from '@/lib/commerce/editions'
import { readJsonWithLimit } from '@/lib/http/read-json'

// A complete answer set is well under 2 KB; anything far larger is not a genuine submission.
const MAX_BODY_BYTES = 16 * 1024

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // Phase 1A keeps the paid gate; it is removed when the Journey opens to Explorers.
  if (!await getConditionerEntitlement(user.id)) return NextResponse.json({ error: 'Active workshop access is required.' }, { status: 403 })

  const body = await readJsonWithLimit(request, MAX_BODY_BYTES)
  if (!body.ok) {
    return body.reason === 'too_large'
      ? NextResponse.json({ error: 'That submission is too large.' }, { status: 413 })
      : NextResponse.json({ error: 'Please complete all assessment questions.' }, { status: 400 })
  }
  const parsed = assessmentSchema.safeParse(body.value)
  if (!parsed.success) return NextResponse.json({ error: 'Please complete all assessment questions.' }, { status: 400 })

  // Scoring stays server-side. The Blend Brief is stored apart from the Hair Need result, so the
  // result a participant can read never carries it.
  const { blendBrief, ...hairNeedResult } = deriveCustomerResult(parsed.data)

  // Written with the server key after the session and answers are validated: browsers cannot
  // create assessment rows or Blend Briefs themselves. answers is jsonb, so participant context
  // (presenting concerns, whole-person answers) persists without a migration.
  const { error } = await createAdminClient().rpc('record_assessment', {
    p_user_id: user.id,
    p_edition_key: CURRENT_EDITION.key,
    p_answers: parsed.data,
    p_result: hairNeedResult,
    p_brief: blendBrief,
    p_method_version: 'hair-need-v2.0',
  })
  if (error?.message?.includes('assessment_rate_limited')) {
    return NextResponse.json({ error: 'You have completed the Hair Need Journey several times today. Please try again tomorrow — your answers are still saved on this device.' }, { status: 429 })
  }
  if (error) return NextResponse.json({ error: 'Assessment could not be saved.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
