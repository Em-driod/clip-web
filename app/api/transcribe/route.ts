// Step 1: validate + discard. Step 2 adds Whisper. Audio is never written to disk.
export const runtime = "nodejs";
const MAX_SEGMENT = 4 * 1024 * 1024; // Vercel body limit is 4.5MB

function looksLikeAudio(b: Uint8Array) {
  const s = (o: number, t: string) => t.split("").every((c, i) => b[o + i] === c.charCodeAt(0));
  return s(0, "OggS") || s(4, "ftyp") || s(0, "ID3") || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) || s(0, "RIFF");
}

export async function POST(req: Request) {
  const id = req.headers.get("x-upload-id") ?? "";
  const idx = Number(req.headers.get("x-segment-index"));
  if (!/^[a-z0-9-]{8,64}$/i.test(id) || !Number.isInteger(idx) || idx < 0 || idx > 1000)
    return Response.json({ error: "bad-request" }, { status: 400 });
  const body = new Uint8Array(await req.arrayBuffer());
  if (body.length === 0 || body.length > MAX_SEGMENT) return Response.json({ error: "bad-size" }, { status: 413 });
  if (!looksLikeAudio(body)) return Response.json({ error: "not-audio" }, { status: 415 });
  return Response.json({ ok: true, index: idx, bytes: body.length });
}
