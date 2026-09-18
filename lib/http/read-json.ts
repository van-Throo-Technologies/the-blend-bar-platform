/**
 * Reads a JSON request body, refusing anything over `maxBytes` without buffering it.
 * The declared Content-Length is checked first; the stream is then counted as it arrives,
 * because the header can be absent or wrong.
 */
export type LimitedJson = { ok: true; value: unknown } | { ok: false; reason: 'too_large' | 'invalid' }

export async function readJsonWithLimit(request: Request, maxBytes: number): Promise<LimitedJson> {
  const declared = Number(request.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, reason: 'too_large' }
  if (!request.body) return { ok: false, reason: 'invalid' }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    received += value.byteLength
    if (received > maxBytes) {
      await reader.cancel()
      return { ok: false, reason: 'too_large' }
    }
    chunks.push(value)
  }

  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(Buffer.concat(chunks))) }
  } catch {
    return { ok: false, reason: 'invalid' }
  }
}
