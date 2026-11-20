import Legal from "@/components/Legal";

export const metadata = { title: "Terms · Clips Web" };

export default function Terms() {
  return (
    <Legal title="Terms" updated="19 November 2026">
      <p>By using Clips Web you agree to these simple terms.</p>
      <h2>Your content, your responsibility</h2>
      <p>Only use videos you own or have the right to use. You are responsible for the content you process and for how you post the clips. Do not use the service for anything illegal or abusive.</p>
      <h2>Free use and limits</h2>
      <p>The free service has daily limits, a maximum file size and a maximum length. If the service reaches its daily budget it may pause until later. We may change the limits.</p>
      <h2>AI can be wrong</h2>
      <p>Transcripts and clip choices are made by software. They can contain mistakes, especially in languages other than English. Please check captions before you post.</p>
      <h2>No guarantees</h2>
      <p>The service is provided as it is. It may be unavailable or change, and we are not liable for losses from using it, to the extent the law allows.</p>
      <h2>Changes</h2>
      <p>If we change these terms, we will update this page and the date above.</p>
    </Legal>
  );
}
