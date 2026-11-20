export type NetState = "idle" | "uploading" | "retrying" | "offline";

/** Sequential, resumable segment uploader: retries with backoff, pauses while offline. */
export class Uploader {
  private q: { index: number; load: () => Promise<ArrayBuffer | undefined> }[] = [];
  private running = false;
  constructor(
    private uploadId: string,
    private cb: { onUploaded: (i: number) => void; onNet: (s: NetState) => void; onFatal: (msg: string) => void },
    private endpoint = "/api/transcribe",
  ) {}

  enqueue(index: number, load: () => Promise<ArrayBuffer | undefined>) {
    this.q.push({ index, load });
    void this.run();
  }
  get pending() { return this.q.length + (this.running ? 1 : 0); }

  private async waitOnline() {
    if (navigator.onLine) return;
    this.cb.onNet("offline");
    await new Promise<void>((r) => window.addEventListener("online", () => r(), { once: true }));
  }

  private async run() {
    if (this.running) return;
    this.running = true;
    while (this.q.length) {
      const item = this.q[0];
      const data = await item.load();
      if (!data) { this.cb.onFatal("Saved audio was lost. Please start over."); this.q = []; break; }
      let attempt = 0;
      for (;;) {
        await this.waitOnline();
        this.cb.onNet(attempt ? "retrying" : "uploading");
        try {
          const res = await fetch(this.endpoint, {
            method: "POST",
            headers: { "x-upload-id": this.uploadId, "x-segment-index": String(item.index), "content-type": "application/octet-stream" },
            body: data,
          });
          if (res.ok) break;
          if (res.status >= 400 && res.status < 500 && res.status !== 429 && res.status !== 408) {
            this.cb.onFatal(`Server rejected the audio (${res.status}).`); this.q = []; this.running = false; return;
          }
        } catch { /* network error: fall through to backoff */ }
        attempt++;
        await new Promise((r) => setTimeout(r, Math.min(15000, 500 * 2 ** Math.min(attempt, 5))));
      }
      this.q.shift();
      this.cb.onUploaded(item.index);
    }
    this.running = false;
    this.cb.onNet("idle");
  }
}
