"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { CLIP_OPTIONS, S } from "@/lib/strings";
import { MAX_DURATION_SEC, MAX_FILE_BYTES, type WorkerOut } from "@/lib/types";
import { clearJob, dropSegment, loadJob, loadSegment, saveJob, saveSegment, type Job } from "@/lib/store";
import { Uploader, type NetState } from "@/lib/uploader";

type View =
  | { s: "upload"; notice?: string; warnFile?: File }
  | { s: "processing" }
  | { s: "clips" }
  | { s: "error"; msg: string };

type WakeLockLike = { release(): Promise<void> };
const isMedia = (f: File) => /^(video|audio)\//.test(f.type) || /\.(mp4|mov|m4v|webm|mkv|mp3|m4a|wav|3gp)$/i.test(f.name);

export default function Tool() {
  const [view, setView] = useState<View>({ s: "upload" });
  const [count, setCount] = useState<number>(10);
  const [extract, setExtract] = useState(0);
  const [sent, setSent] = useState({ done: 0, total: null as number | null });
  const [net, setNet] = useState<NetState>("idle");
  const [resumeJob, setResumeJob] = useState<Job | null>(null);
  const job = useRef<Job | null>(null);
  const worker = useRef<Worker | null>(null);
  const uploader = useRef<Uploader | null>(null);
  const wake = useRef<WakeLockLike | null>(null);

  useEffect(() => {
    loadJob().then((j) => {
      if (j && !(j.extractionDone && j.uploaded.length === j.segTotal)) setResumeJob(j);
    });
  }, []);

  const keepAwake = async () => {
    try {
      const nav = navigator as Navigator & { wakeLock?: { request(t: "screen"): Promise<WakeLockLike> } };
      wake.current = (await nav.wakeLock?.request("screen")) ?? null;
    } catch { /* not supported or denied: non-fatal */ }
  };
  useEffect(() => {
    const onVis = () => { if (document.visibilityState === "visible" && view.s === "processing") void keepAwake(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [view.s]);

  const stop = useCallback(() => {
    worker.current?.terminate(); worker.current = null; uploader.current = null;
    void wake.current?.release();
  }, []);
  const fail = useCallback((msg: string) => { stop(); setView({ s: "error", msg }); }, [stop]);

  const checkDone = useCallback(() => {
    const j = job.current;
    if (j && j.extractionDone && j.uploaded.length === j.segTotal) { void wake.current?.release(); setView({ s: "clips" }); }
  }, []);

  const makeUploader = useCallback((j: Job) => new Uploader(j.id, {
    onNet: setNet,
    onFatal: fail,
    onUploaded: (i) => {
      if (!j.uploaded.includes(i)) j.uploaded.push(i);
      void saveJob(j); void dropSegment(j.id, i);
      setSent({ done: j.uploaded.length, total: j.segTotal });
      checkDone();
    },
  }), [fail, checkDone]);

  const begin = useCallback(async (file: File) => {
    if (!isMedia(file)) return setView({ s: "upload", notice: S.notVideo });
    if (file.size > MAX_FILE_BYTES) return setView({ s: "upload", notice: S.tooBig });
    setView({ s: "processing" }); setExtract(0); setSent({ done: 0, total: null }); setResumeJob(null);
    const prev = await loadJob();
    const same = !!prev && prev.name === file.name && prev.size === file.size && prev.lastModified === file.lastModified;
    if (!same) await clearJob();
    const j: Job = same ? { ...prev!, clips: count } : {
      id: crypto.randomUUID(), name: file.name, size: file.size, lastModified: file.lastModified,
      duration: 0, clips: count, extractionDone: false, segTotal: null, uploaded: [],
    };
    job.current = j; await saveJob(j);
    setSent({ done: j.uploaded.length, total: null });
    void keepAwake();
    const up = (uploader.current = makeUploader(j));
    const w = (worker.current = new Worker(new URL("../workers/extract.worker.ts", import.meta.url), { type: "module" }));
    w.onerror = () => fail(S.workerFailed);
    w.onmessage = async (e: MessageEvent<WorkerOut>) => {
      const m = e.data;
      if (m.type === "info") {
        j.duration = m.duration;
        if (m.duration > MAX_DURATION_SEC) { stop(); setView({ s: "upload", notice: S.tooLong }); }
      } else if (m.type === "progress") {
        setExtract(m.fraction);
      } else if (m.type === "segment") {
        if (j.uploaded.includes(m.index)) return; // resumed: server already has it
        await saveSegment(j.id, m.index, m.data);
        up.enqueue(m.index, () => loadSegment(j.id, m.index));
      } else if (m.type === "done") {
        j.extractionDone = true; j.segTotal = m.segments; await saveJob(j);
        setSent({ done: j.uploaded.length, total: m.segments }); checkDone();
      } else if (m.type === "error") {
        fail(m.code === "no-audio" ? S.noAudio : m.code === "cant-decode" ? S.cantDecode : `${S.cantDecode} (${m.message})`);
      }
    };
    const enc = new URLSearchParams(location.search).get("enc"); // test hook: force a codec path
    w.postMessage({ type: "start", file, forceCodec: enc === "mp3" || enc === "aac" || enc === "opus" ? enc : undefined });
  }, [fail, stop, makeUploader, checkDone, count]);

  const onPick = (f?: File | null) => {
    if (!f) return;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (mem && mem <= 4 && f.size > 1.5 * 1024 ** 3) return setView({ s: "upload", warnFile: f });
    void begin(f);
  };

  const resumeUploads = async () => {
    const j = resumeJob!; job.current = j; setResumeJob(null); setView({ s: "processing" });
    setExtract(1); setSent({ done: j.uploaded.length, total: j.segTotal }); void keepAwake();
    const up = (uploader.current = makeUploader(j));
    for (let i = 0; i < (j.segTotal ?? 0); i++) if (!j.uploaded.includes(i)) up.enqueue(i, () => loadSegment(j.id, i));
    checkDone();
  };
  const reset = async () => { stop(); await clearJob(); job.current = null; setResumeJob(null); setView({ s: "upload" }); };

  const pct = (n: number) => `${Math.round(n * 100)}%`;
  const btn = "btn inline-flex min-h-14 w-full items-center justify-center rounded-full bg-ink px-6 text-base font-semibold text-white hover:bg-accent-deep";
  const ghost = "btn inline-flex min-h-12 w-full items-center justify-center rounded-full border border-line bg-paper px-6 text-base font-semibold hover:border-ink";
  const alertBox = "rounded-2xl border border-danger/25 bg-[#fef3f2] p-4 text-sm font-medium text-danger";

  return (
    <div className="rounded-[28px] border border-line bg-paper p-4 shadow-lift sm:p-5" id="tool">
      {view.s === "upload" && (
        <section className="flex flex-col gap-4" aria-label="Upload">
          <fieldset>
            <legend className="sr-only">{S.howMany}</legend>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-sm font-semibold text-muted" aria-hidden="true">{S.howMany}</span>
              <div className="flex rounded-full bg-mint p-1 sm:w-auto" role="radiogroup">
                {CLIP_OPTIONS.map((o) => (
                  <label key={o.n} className={`relative flex min-h-11 flex-1 flex-col sm:min-w-[4.5rem] sm:flex-none items-center justify-center rounded-full px-3 text-center ${o.free ? "cursor-pointer" : "cursor-not-allowed"} ${count === o.n ? "bg-paper shadow-card" : ""}`}>
                    <input type="radio" name="clips" className="peer sr-only" value={o.n} checked={count === o.n} disabled={!o.free} onChange={() => setCount(o.n)} />
                    <span className={`text-[15px] font-semibold leading-none ${count === o.n ? "text-accent-deep" : "text-muted"}`}>{o.n}</span>
                    <span className={`mt-0.5 text-[10px] font-semibold uppercase leading-none tracking-wide ${count === o.n ? "text-accent" : "text-muted"}`}>{o.free ? S.freeTag : S.proTag}</span>
                  </label>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">Up to {count} clips. Short videos give fewer, because we never repeat a moment.</p>
          </fieldset>

          {resumeJob && (
            <div role="status" className="rounded-2xl border border-line bg-mint p-4">
              <p className="font-semibold">{S.resumeFound}</p>
              <p className="break-all text-sm text-muted">{resumeJob.name}</p>
              <div className="mt-3 flex flex-col gap-2">
                {resumeJob.extractionDone
                  ? <button data-testid="resume" className={btn} onClick={resumeUploads}>{S.resume}</button>
                  : <p className="text-sm font-medium">{S.reselect}</p>}
                <button className={ghost} onClick={reset}>{S.startOver}</button>
              </div>
            </div>
          )}
          {view.notice && <p role="alert" className={alertBox}>{view.notice}</p>}
          {view.warnFile && (
            <div role="alert" className={alertBox}>
              <p>{S.tooBig}</p>
              <div className="mt-3 flex flex-col gap-2 text-ink">
                <button className={ghost} onClick={() => void begin(view.warnFile!)}>Continue anyway</button>
                <button className={ghost} onClick={() => setView({ s: "upload" })}>Choose another</button>
              </div>
            </div>
          )}

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files[0]); }}
            className="group flex min-h-60 cursor-pointer flex-col items-center justify-center gap-1 rounded-3xl border border-dashed border-accent/50 bg-gradient-to-b from-mint to-white p-6 text-center transition-colors hover:border-accent focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-2 focus-within:outline-accent"
          >
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-card">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true"><path d="M13 20V7m0 0-5.5 5.5M13 7l5.5 5.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className="text-xl font-semibold tracking-tight">{S.pick}</span>
            <span className="text-sm text-muted">{S.pickHint}</span>
            <span className="btn mt-4 inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-sm font-semibold text-white group-hover:bg-accent-deep">Select video</span>
            <span className="mt-3 text-xs text-muted">{S.pickSub}</span>
            <input data-testid="file" type="file" accept="video/*,audio/*" className="sr-only" onChange={(e) => { onPick(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        </section>
      )}

      {view.s === "processing" && (
        <section className="flex flex-col gap-5 p-1" aria-live="polite">
          <Bar label={S.extracting} value={extract} text={pct(extract)} />
          <Bar label={S.uploading} value={sent.total ? sent.done / sent.total : 0} text={sent.total ? `${sent.done}/${sent.total}` : "…"} />
          {(net === "offline" || net === "retrying") && (
            <p role="status" className="rounded-2xl border border-line bg-mint p-3 text-sm font-medium">{net === "offline" ? S.resuming : S.retrying}</p>
          )}
          <p className="text-sm text-muted">{S.keepOpen}</p>
          <button className={ghost} onClick={reset}>{S.startOver}</button>
        </section>
      )}

      {view.s === "clips" && (
        <section className="flex flex-col gap-4 p-1" aria-live="polite">
          <p data-testid="done" className="flex items-center gap-3 rounded-2xl bg-mint p-4 font-semibold text-accent-deep">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white" aria-hidden="true">✓</span>
            {S.done} ({sent.done} parts)
          </p>
          <button className={ghost} onClick={reset}>{S.startOver}</button>
        </section>
      )}

      {view.s === "error" && (
        <section className="flex flex-col gap-4 p-1">
          <p role="alert" data-testid="error" className={alertBox}>{view.msg}</p>
          <button className={btn} onClick={reset}>{S.retry}</button>
        </section>
      )}

      <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1.5 2.5 3.3v3.4c0 2.7 1.9 4.6 4.5 5.8 2.6-1.2 4.5-3.1 4.5-5.8V3.3z" stroke="#067a46" strokeWidth="1.4" strokeLinejoin="round" /></svg>
        Your video never leaves your phone
      </p>
    </div>
  );
}

function Bar({ label, value, text }: { label: string; value: number; text: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-semibold"><span>{label}</span><span className="tabular-nums text-muted">{text}</span></div>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} className="h-2 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-soft" style={{ width: `${value * 100}%` }} />
      </div>
    </div>
  );
}
