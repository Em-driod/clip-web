/// <reference lib="webworker" />
import {
  Input, ALL_FORMATS, BlobSource, AudioSampleSink, AudioSample, AudioSampleSource,
  Output, OggOutputFormat, Mp4OutputFormat, Mp3OutputFormat, BufferTarget,
  getFirstEncodableAudioCodec,
} from "mediabunny";
import { TARGET_RATE, type WorkerIn, type WorkerOut } from "@/lib/types";

const post = (m: WorkerOut, transfer: Transferable[] = []) => (self as unknown as Worker).postMessage(m, transfer);

type Codec = "opus" | "aac" | "mp3";
const BITRATE = 24000;

async function pickCodec(force?: Codec): Promise<Codec> {
  const opts = { numberOfChannels: 1, sampleRate: TARGET_RATE, bitrate: BITRATE };
  let c = force === "mp3" ? null : await getFirstEncodableAudioCodec(force ? [force] : ["opus", "aac"], opts);
  if (c) return c as Codec;
  // Safari / some Android WebViews: WASM MP3 encoder (lazy, only loaded when needed).
  const { registerMp3Encoder } = await import("@mediabunny/mp3-encoder");
  registerMp3Encoder();
  c = await getFirstEncodableAudioCodec(["mp3"], opts);
  if (c) return c as Codec;
  throw Object.assign(new Error("No audio encoder available"), { code: "no-encoder" });
}

async function encodeSegment(pcm: Float32Array, codec: Codec) {
  const format = codec === "opus" ? new OggOutputFormat() : codec === "aac" ? new Mp4OutputFormat() : new Mp3OutputFormat();
  const target = new BufferTarget();
  const output = new Output({ format, target });
  const source = new AudioSampleSource({ codec, bitrate: BITRATE });
  output.addAudioTrack(source);
  await output.start();
  const CH = TARGET_RATE; // feed 1s at a time to respect backpressure
  for (let i = 0; i < pcm.length; i += CH) {
    const part = pcm.slice(i, i + CH);
    const s = new AudioSample({ data: part, format: "f32", numberOfChannels: 1, sampleRate: TARGET_RATE, timestamp: i / TARGET_RATE });
    await source.add(s);
    s.close();
  }
  source.close();
  await output.finalize();
  const mime = codec === "opus" ? "audio/ogg" : codec === "aac" ? "audio/mp4" : "audio/mpeg";
  const ext = codec === "opus" ? "ogg" : codec === "aac" ? "m4a" : "mp3";
  return { buf: target.buffer!, mime, ext };
}

/** Index of the quietest 200ms window in pcm[from,to) — used to cut between words. */
function quietestCut(pcm: Float32Array, from: number, to: number): number {
  const win = Math.floor(TARGET_RATE * 0.2), hop = Math.floor(TARGET_RATE * 0.05);
  let best = to, bestE = Infinity;
  for (let i = from; i + win <= to; i += hop) {
    let e = 0;
    for (let j = i; j < i + win; j += 4) e += pcm[j] * pcm[j];
    if (e < bestE) { bestE = e; best = i + (win >> 1); }
  }
  return best;
}

self.onmessage = async (ev: MessageEvent<WorkerIn>) => {
  if (ev.data.type !== "start") return;
  const segSec = ev.data.segmentSeconds ?? 300;
  try {
    const input = new Input({ source: new BlobSource(ev.data.file), formats: ALL_FORMATS });
    const track = await input.getPrimaryAudioTrack();
    if (!track) return post({ type: "error", code: "no-audio", message: "no audio track" });
    if (!(await track.canDecode())) return post({ type: "error", code: "cant-decode", message: `cannot decode ${track.codec}` });
    const duration = await input.computeDuration();
    post({ type: "info", duration, codec: track.codec });
    const codec = await pickCodec(ev.data.forceCodec);

    const sink = new AudioSampleSink(track);
    const segLen = segSec * TARGET_RATE;
    let buf = new Float32Array(segLen + 30 * TARGET_RATE); // room to look ahead for a quiet cut
    let fill = 0, segIndex = 0, emittedSamples = 0;
    // resampler state: box-average decimation (fine for speech; avoids aliasing)
    let acc = 0, accN = 0, srcPos = 0;

    const flush = async (cutAt: number) => {
      const slice = buf.slice(0, cutAt);
      const { buf: data, mime, ext } = await encodeSegment(slice, codec);
      post({ type: "segment", index: segIndex++, startSec: emittedSamples / TARGET_RATE, durSec: cutAt / TARGET_RATE, mime, ext, data }, [data]);
      emittedSamples += cutAt;
      buf.copyWithin(0, cutAt, fill);
      fill -= cutAt;
    };

    for await (const sample of sink.samples()) {
      const ch = sample.numberOfChannels, n = sample.numberOfFrames, sr = sample.sampleRate;
      const planes: Float32Array[] = [];
      for (let c = 0; c < ch; c++) {
        const p = new Float32Array(n);
        sample.copyTo(p, { planeIndex: c, format: "f32-planar" });
        planes.push(p);
      }
      const ratio = sr / TARGET_RATE;
      for (let i = 0; i < n; i++) {
        let v = 0;
        for (let c = 0; c < ch; c++) v += planes[c][i];
        acc += v / ch; accN++;
        srcPos++;
        if (srcPos >= ratio) {
          srcPos -= ratio;
          if (fill >= buf.length) { /* safety: never overflow */ await flush(segLen); }
          buf[fill++] = acc / accN; acc = 0; accN = 0;
        }
      }
      sample.close();
      post({ type: "progress", fraction: Math.min(0.999, (emittedSamples + fill) / TARGET_RATE / Math.max(duration, 1)) });
      if (fill >= segLen + 20 * TARGET_RATE) await flush(quietestCut(buf, segLen - 20 * TARGET_RATE, segLen + 20 * TARGET_RATE));
    }
    if (fill > TARGET_RATE / 2) await flush(fill);
    post({ type: "progress", fraction: 1 });
    post({ type: "done", segments: segIndex, encoder: codec });
  } catch (e) {
    const err = e as Error & { code?: string };
    post({ type: "error", code: (err.code as "no-encoder") ?? "other", message: err.message || String(e) });
  }
};
