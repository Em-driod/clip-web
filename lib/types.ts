export type WorkerIn = { type: "start"; file: File; segmentSeconds?: number; forceCodec?: "opus" | "aac" | "mp3" };
export type WorkerOut =
  | { type: "info"; duration: number; codec: string | null }
  | { type: "progress"; fraction: number }
  | { type: "segment"; index: number; startSec: number; durSec: number; mime: string; ext: string; data: ArrayBuffer }
  | { type: "done"; segments: number; encoder: string }
  | { type: "error"; code: "no-audio" | "cant-decode" | "no-encoder" | "other"; message: string };

export const TARGET_RATE = 16000;
export const MAX_DURATION_SEC = 2 * 3600;
export const MAX_FILE_BYTES = 4 * 1024 ** 3;
