// Unit-economics model for Clips Web. Run: node scripts/cost-model.mjs
// ALL PRICES ARE ASSUMPTIONS from memory. Verify against current provider pricing before launch.
const A = {
  whisperPerAudioHour: 0.04, // Groq whisper-large-v3-turbo, $/audio-hour (assumed)
  cheapIn: 1.0, cheapOut: 5.0, // $/M tokens, "Haiku-class" pass 1 (assumed)
  strongIn: 3.0, strongOut: 15.0, // $/M tokens, "Sonnet-class" pass 2 (assumed)
  tokensPerTranscriptHour: 14000, // ~9-10k words/hour of speech incl. timestamps overhead
  shortlistFactor: 3, // pass 1 shortlists 3x the clips wanted
  tokensPerCandidate: 350, // text of one candidate + audio-signal tags
  rubricTokens: 600,
  outTokensPerPick: 90, // title, hook line, score, start/end ids as JSON
  outTokensPerShortlist: 40,
  retryRate: 0.1, // 10% of runs need the one allowed retry
  fxNgnPerUsd: 1600, // assumed
};
const M = 1e6;

function perVideo(hours, clips) {
  const whisper = hours * A.whisperPerAudioHour;
  const short = clips * A.shortlistFactor;
  const p1 = (hours * A.tokensPerTranscriptHour * A.cheapIn + short * A.outTokensPerShortlist * A.cheapOut) / M;
  const p2In = A.rubricTokens + short * A.tokensPerCandidate;
  const p2 = (p2In * A.strongIn + clips * A.outTokensPerPick * A.strongOut) / M;
  const total = (whisper + p1 + p2) * (1 + A.retryRate);
  return { whisper, p1, p2, total };
}

const money = (n) => "$" + n.toFixed(3);
console.log("Cost per video (USD / NGN), incl. 10% retry overhead\n");
console.log("length  clips   whisper   pass1    pass2    TOTAL    NGN");
for (const h of [0.5, 1, 2])
  for (const c of [10, 30, 50]) {
    const r = perVideo(h, c);
    console.log(
      `${String(h + "h").padEnd(7)} ${String(c).padEnd(6)}  ${money(r.whisper)}   ${money(r.p1)}   ${money(r.p2)}   ${money(r.total)}   ₦${(r.total * A.fxNgnPerUsd).toFixed(0)}`,
    );
  }

const free = perVideo(1, 10).total;
console.log("\nFree tier (1h video, 10 clips):", money(free), "per video");
for (const cap of [5, 10, 25]) console.log(`  daily spend cap $${cap} -> ~${Math.floor(cap / free)} free videos/day total (all users)`);

console.log("\nPack pricing sanity (1h video; price must cover cost + ~5% payment fee + 3x margin):");
for (const [clips, videos] of [[30, 5], [50, 5]]) {
  const cost = perVideo(1, clips).total * videos;
  const floor = (cost * 3) / 0.95;
  console.log(`  ${clips}-clip pack x${videos} videos: cost ${money(cost)} -> price floor ~$${floor.toFixed(2)} (~₦${(floor * A.fxNgnPerUsd).toFixed(0)})`);
}

console.log("\nSegments/upload size: 24kbps Opus = 10.8MB/hour; at 4.5MB Vercel body limit ->");
console.log("  5-min segment = 0.9MB (safe). Measured in-browser: 9MB/hour (6.06MB for 40 min).");
console.log("\nHonest limit: a 10-minute video cannot yield 50 distinct 20-60s clips. Clip count is a CEILING (\"up to N\").");
console.log("  Max non-overlapping 30s clips from a video of L minutes = L*2. 50 clips needs >= 25 min of speech; 30 needs >= 15 min.");
