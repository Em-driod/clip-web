import { get, set, del, keys } from "idb-keyval";

export type Job = {
  id: string; name: string; size: number; lastModified: number;
  duration: number; clips: number; extractionDone: boolean; segTotal: number | null; uploaded: number[];
};
const JOB = "job:current";
const segKey = (id: string, i: number) => `seg:${id}:${i}`;

export const loadJob = () => get<Job>(JOB);
export const saveJob = (j: Job) => set(JOB, j);
export const saveSegment = (id: string, i: number, d: ArrayBuffer) => set(segKey(id, i), d);
export const loadSegment = (id: string, i: number) => get<ArrayBuffer>(segKey(id, i));
export const dropSegment = (id: string, i: number) => del(segKey(id, i));
export async function clearJob() {
  for (const k of await keys()) if (typeof k === "string" && (k === JOB || k.startsWith("seg:"))) await del(k);
}
