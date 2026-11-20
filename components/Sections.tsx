import Link from "next/link";
import { S } from "@/lib/strings";

const wrap = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.14em] text-accent";
const h2 = "mt-3 text-3xl font-semibold leading-[1.1] sm:text-5xl";
const card = "rounded-3xl border border-line bg-paper shadow-card";

export function Banner() {
  return (
    <p className="border-b border-line bg-mint px-4 py-2 text-center text-[13px] font-medium text-accent-deep">
      {S.previewBanner}
    </p>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0b9b5b" /><stop offset="1" stopColor="#055a35" /></linearGradient></defs>
        <rect width="28" height="28" rx="8" fill="url(#lg)" />
        <path d="M11 8.5v11l9-5.5z" fill="#fff" />
      </svg>
      <span className={light ? "text-white" : ""}>{S.appName}</span>
    </span>
  );
}

export function Nav() {
  const link = "flex min-h-11 items-center text-sm font-medium text-muted transition-colors hover:text-ink";
  return (
    <nav className={`${wrap} flex items-center justify-between py-3`} aria-label="Main">
      <Link href="/" className="flex min-h-11 items-center"><Logo /></Link>
      <div className="hidden items-center gap-8 md:flex">
        <a className={link} href="#how">How it works</a>
        <a className={link} href="#pricing">Pricing</a>
        <a className={link} href="#privacy">Privacy</a>
        <a className={link} href="#faq">FAQ</a>
      </div>
      <a href="#tool" className="btn inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-accent-deep">Try it free</a>
    </nav>
  );
}

/** Three vertical clips, front one with TikTok-style captions. Static SVG: no images, no animation. */
export function HeroArt() {
  return (
    <svg viewBox="0 0 540 470" role="img" aria-label="Three short vertical clips with captions and a hook score" className="h-auto w-full">
      <defs>
        <linearGradient id="pa" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#0f3d29" /><stop offset="1" stopColor="#067a46" /></linearGradient>
        <linearGradient id="pb" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stopColor="#e9f8f0" /><stop offset="1" stopColor="#a9e0c2" /></linearGradient>
        <linearGradient id="pc" x1="0" y1="0" x2="0.5" y2="1"><stop offset="0" stopColor="#1a2a22" /><stop offset="1" stopColor="#0b1410" /></linearGradient>
      </defs>

      {/* back-left */}
      <g transform="translate(24 78) rotate(-8 80 150)">
        <rect width="170" height="320" rx="26" fill="url(#pb)" stroke="#d3e8dc" />
        <circle cx="85" cy="112" r="30" fill="#fff" opacity=".55" /><path d="M32 220c4-46 28-66 53-66s49 20 53 66z" fill="#fff" opacity=".55" />
        <rect x="26" y="250" width="118" height="24" rx="8" fill="#fff" /><text x="85" y="266" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0b1410">I was wrong</text>
      </g>
      {/* back-right */}
      <g transform="translate(344 78) rotate(8 80 150)">
        <rect width="170" height="320" rx="26" fill="url(#pc)" />
        <circle cx="85" cy="112" r="30" fill="#fff" opacity=".14" /><path d="M32 220c4-46 28-66 53-66s49 20 53 66z" fill="#fff" opacity=".14" />
        <rect x="26" y="250" width="118" height="24" rx="8" fill="#fff" /><text x="85" y="266" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0b1410">Wait for this</text>
      </g>

      {/* front */}
      <g transform="translate(172 22)">
        <rect width="196" height="388" rx="30" fill="#0b1410" />
        <rect x="4" y="4" width="188" height="380" rx="26" fill="url(#pa)" />
        <circle cx="98" cy="138" r="38" fill="#fff" opacity=".18" /><path d="M36 262c5-56 34-80 62-80s57 24 62 80z" fill="#fff" opacity=".18" />
        <rect x="16" y="18" width="46" height="22" rx="11" fill="#0b1410" opacity=".55" />
        <text x="39" y="33" textAnchor="middle" fontSize="11" fontWeight="600" fill="#fff">0:42</text>
        <rect x="102" y="18" width="78" height="22" rx="11" fill="#fff" />
        <text x="141" y="33" textAnchor="middle" fontSize="11" fontWeight="700" fill="#055a35">Hook 92</text>
        {/* captions */}
        <rect x="22" y="284" width="106" height="28" rx="9" fill="#fff" /><text x="75" y="303" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0b1410">Nobody tells</text>
        <rect x="22" y="316" width="62" height="28" rx="9" fill="#fff" /><text x="53" y="335" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0b1410">you</text>
        <rect x="88" y="316" width="86" height="28" rx="9" fill="#12c176" /><text x="131" y="335" textAnchor="middle" fontSize="14" fontWeight="800" fill="#0b1410">this…</text>
        <rect x="22" y="364" width="152" height="4" rx="2" fill="#fff" opacity=".28" /><rect x="22" y="364" width="64" height="4" rx="2" fill="#fff" />
      </g>
    </svg>
  );
}

export function HowItWorks() {
  const steps = [
    { n: "01", t: "Drop your video", d: "We pull out only the sound, right on your phone. Your video never uploads." },
    { n: "02", t: "AI finds the hooks", d: "It reads the transcript and picks moments with a strong first three seconds and a real payoff." },
    { n: "03", t: "Tap, trim, share", d: "Tap a word to move the start or end. Pick a caption style. Send it to WhatsApp or TikTok." },
  ];
  return (
    <section id="how" className={`${wrap} py-20 sm:py-28`}>
      <p className={eyebrow}>How it works</p>
      <h2 className={h2}>Three steps. No sign-up.</h2>
      <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {steps.map((s) => (
          <li key={s.n} className="border-t border-ink pt-5">
            <span className="text-sm font-semibold tabular-nums text-accent">{s.n}</span>
            <h3 className="mt-6 text-2xl font-semibold">{s.t}</h3>
            <p className="mt-3 leading-relaxed text-muted">{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Features() {
  const words = ["so", "nobody", "ever", "told", "you", "this", "before", "right"];
  return (
    <section className="bg-mint py-20 sm:py-28">
      <div className={wrap}>
        <p className={eyebrow}>What you get</p>
        <h2 className={`${h2} max-w-2xl`}>Built for real phones and real data costs.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <div className={`${card} p-7 md:col-span-3`}>
            <h3 className="text-xl font-semibold">Hook score</h3>
            <p className="mt-2 text-muted">Every clip is scored on its opening, payoff and emotion, so you know what to post first.</p>
            <div className="mt-6 space-y-3" aria-hidden="true">
              {[["Opening", 92], ["Payoff", 85], ["Emotion", 78]].map(([l, v]) => (
                <div key={l as string} className="flex items-center gap-3 text-sm">
                  <span className="w-16 font-medium text-muted">{l}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-mint-deep"><span className="block h-full rounded-full bg-accent" style={{ width: `${v}%` }} /></span>
                  <span className="w-7 text-right font-semibold tabular-nums">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={`${card} p-7 md:col-span-3`}>
            <h3 className="text-xl font-semibold">Tap-a-word trimming</h3>
            <p className="mt-2 text-muted">No tiny timeline handles. Tap the word where the clip starts, then the word where it ends.</p>
            <p className="mt-6 flex flex-wrap gap-1.5 text-[15px]" aria-hidden="true">
              {words.map((w, i) => (
                <span key={i} className={`rounded-lg px-2.5 py-1.5 font-medium ${i >= 2 && i <= 5 ? "bg-accent text-white" : "bg-mint text-muted"}`}>{w}</span>
              ))}
            </p>
          </div>
          <div className={`${card} p-7 md:col-span-2`}>
            <h3 className="text-xl font-semibold">Captions that fit</h3>
            <p className="mt-2 text-muted">Three styles, big and high-contrast, with correct accents and tone marks.</p>
            <div className="mt-6 flex gap-2" aria-hidden="true">
              <span className="rounded-lg bg-ink px-3 py-2 text-sm font-extrabold text-white">Aa</span>
              <span className="rounded-lg bg-white px-3 py-2 text-sm font-extrabold ring-1 ring-ink">Aa</span>
              <span className="rounded-lg bg-accent px-3 py-2 text-sm font-extrabold text-white">Aà</span>
            </div>
          </div>
          <div className={`${card} p-7 md:col-span-2`}>
            <h3 className="text-xl font-semibold">WhatsApp-sized</h3>
            <p className="mt-2 text-muted">9:16 exports kept under the 16MB limit, with a data-saver 720p option.</p>
            <p className="mt-6 text-5xl font-semibold tracking-tight text-gradient" aria-hidden="true">&lt;16MB</p>
          </div>
          <div className={`${card} p-7 md:col-span-2`}>
            <h3 className="text-xl font-semibold">Your languages</h3>
            <p className="mt-2 text-muted">English, Pidgin, Yorùbá, Hausa and Igbo, with honest accuracy notes.</p>
            <p className="mt-6 text-5xl font-semibold tracking-tight" aria-hidden="true">5</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className={`${wrap} py-20 sm:py-28`}>
      <p className={eyebrow}>Pricing</p>
      <h2 className={h2}>Pick how many clips you want.</h2>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">Packs, not subscriptions. Pay once, use when you need. Naira packs with bank transfer, USSD and card are coming, and dollar packs for everyone else.</p>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <div className="relative flex flex-col overflow-hidden rounded-3xl bg-ink p-8 text-white shadow-lift">
          <span className="absolute right-6 top-6 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold">Available now</span>
          <p className="text-sm font-semibold text-white/70">Free</p>
          <p className="mt-6 text-7xl font-semibold leading-none tracking-tight">10</p>
          <p className="mt-2 font-medium text-white/80">clips per video</p>
          <p className="mt-6 flex-1 leading-relaxed text-white/70">No sign-up. No watermark. A few videos a day.</p>
          <a href="#tool" className="btn mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 font-semibold text-ink hover:bg-mint-deep">Start free</a>
        </div>
        {[
          { name: "Creator", n: 30, note: "For long podcasts, sermons and interviews." },
          { name: "Studio", n: 50, note: "For channels that post every day." },
        ].map((t) => (
          <div key={t.name} className={`${card} flex flex-col p-8`}>
            <p className="text-sm font-semibold text-muted">{t.name}</p>
            <p className="mt-6 text-7xl font-semibold leading-none tracking-tight">{t.n}</p>
            <p className="mt-2 font-medium text-muted">clips per video</p>
            <p className="mt-6 flex-1 leading-relaxed text-muted">{t.note}</p>
            <span aria-disabled="true" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-line px-6 font-semibold text-muted">Coming soon</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-muted">&ldquo;Up to&rdquo; is honest: a 10 minute video can&rsquo;t hold 50 different 30-second moments, so you get as many good clips as are really there.</p>
    </section>
  );
}

export function Privacy() {
  return (
    <section id="privacy" className="bg-ink py-20 text-white sm:py-28">
      <div className={`${wrap} grid items-center gap-12 lg:grid-cols-2`}>
        <div>
          <p className={`${eyebrow} !text-[#12c176]`}>Privacy by design</p>
          <h2 className={h2}>Your video stays on your phone.</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/75">We only send the sound, shrunk to about 9MB per hour, and delete it as soon as it becomes text. No video stored. No account.</p>
          <Link href="/privacy" className="btn mt-8 inline-flex min-h-12 items-center rounded-full border border-white/30 px-6 font-semibold hover:bg-white/10">Read the privacy policy</Link>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-ink" aria-label="Your phone keeps the video. Only small audio goes to the server and is deleted.">
          <div className="rounded-3xl bg-white p-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="9" y="3" width="14" height="26" rx="4" stroke="#067a46" strokeWidth="2" /><circle cx="16" cy="25" r="1.2" fill="#067a46" /></svg>
            <p className="mt-3 font-semibold">Your phone</p>
            <p className="mt-1 text-sm text-muted">Video, cutting, captions, finished clips</p>
          </div>
          <div className="flex flex-col items-center gap-1 text-center text-xs font-medium text-white/70">
            <span>audio only</span>
            <svg width="44" height="12" viewBox="0 0 44 12" fill="none" aria-hidden="true"><path d="M0 6h40m0 0-5-5m5 5-5 5" stroke="#12c176" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>~9MB/h</span>
          </div>
          <div className="rounded-3xl bg-mint-deep p-5">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="4" y="7" width="24" height="7" rx="2.5" stroke="#055a35" strokeWidth="2" /><rect x="4" y="18" width="24" height="7" rx="2.5" stroke="#055a35" strokeWidth="2" /></svg>
            <p className="mt-3 font-semibold">Server</p>
            <p className="mt-1 text-sm text-muted">Turns audio into text, then deletes it</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Languages() {
  const langs = [
    { n: "English", a: "Best accuracy", ok: true },
    { n: "Naija Pidgin", a: "Lower accuracy", ok: false },
    { n: "Yorùbá", a: "Lower accuracy", ok: false },
    { n: "Hausa", a: "Lower accuracy", ok: false },
    { n: "Igbo", a: "Lowest accuracy", ok: false },
  ];
  return (
    <section className={`${wrap} py-20 sm:py-28`}>
      <p className={eyebrow}>Languages</p>
      <h2 className={h2}>Your language, honestly.</h2>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">Speech recognition is strongest in English, including Nigerian accents. For other languages we tell you it is less accurate, and you can edit every caption before you export.</p>
      <ul className="mt-8 flex flex-wrap gap-3">
        {langs.map((l) => (
          <li key={l.n} className={`flex items-center gap-2 rounded-full border px-5 py-3 ${l.ok ? "border-accent bg-mint" : "border-line bg-paper"}`}>
            <span className={`h-2 w-2 rounded-full ${l.ok ? "bg-accent" : "bg-line"}`} aria-hidden="true" />
            <span className="font-semibold">{l.n}</span>
            <span className="text-sm text-muted">{l.a}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Faq() {
  const q = [
    ["Is it really free?", "Yes. You get 10 clips per video, no watermark and no account. There is a daily limit so the service stays free for everyone."],
    ["Does my video get uploaded?", "No. Only the audio is sent, and it is deleted after it is turned into text. Cutting and captions happen on your phone."],
    ["Will it work on my phone?", "It is designed for budget Android phones and slow data. Very large files may be too heavy for a phone's memory, and we warn you before that happens."],
    ["What if the upload stops halfway?", "It continues where it stopped. If you close the tab, reopen it and tap Resume."],
    ["Who owns the clips?", "You do, if you own the video. You are responsible for having the right to use the content you upload."],
  ];
  return (
    <section id="faq" className={`${wrap} pb-20 sm:pb-28`}>
      <p className={eyebrow}>FAQ</p>
      <h2 className={h2}>Questions</h2>
      <div className="mt-8 divide-y divide-line border-y border-line">
        {q.map(([a, b]) => (
          <details key={a}>
            <summary className="flex min-h-16 items-center justify-between gap-4 text-lg font-semibold">
              {a}
              <span className="plus text-3xl font-light text-accent transition-transform" aria-hidden="true">+</span>
            </summary>
            <p className="max-w-2xl pb-6 leading-relaxed text-muted">{b}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function Footer() {
  const l = "flex min-h-11 items-center text-sm font-medium text-muted hover:text-ink";
  return (
    <footer className="border-t border-line">
      <div className={`${wrap} flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="flex flex-col gap-1"><Logo /><p className="text-sm text-muted">Made for creators, starting in Nigeria.</p></div>
        <div className="flex gap-6">
          <Link className={l} href="/privacy">Privacy</Link>
          <Link className={l} href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
