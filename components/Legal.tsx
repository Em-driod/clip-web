import Link from "next/link";

export default function Legal({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href="/" className="font-bold text-accent underline">← Back to Clips Web</Link>
      <h1 className="mt-6 text-4xl font-extrabold">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated {updated}. Plain language, no tricks.</p>
      <div className="mt-8 space-y-4 text-lg leading-relaxed [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-extrabold [&_ul]:list-disc [&_ul]:pl-6">{children}</div>
    </main>
  );
}
