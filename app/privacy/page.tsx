import Legal from "@/components/Legal";

export const metadata = { title: "Privacy · Clips Web" };

export default function Privacy() {
  return (
    <Legal title="Privacy" updated="19 November 2026">
      <p>Short version: your video never leaves your device. We only receive the sound, and we delete it after turning it into text.</p>
      <h2>What stays on your phone</h2>
      <ul>
        <li>Your video file.</li>
        <li>Cutting, captions and the finished clips.</li>
        <li>Work in progress, saved in your browser so a refresh does not lose it. You can clear it with &ldquo;Start over&rdquo;.</li>
      </ul>
      <h2>What we receive</h2>
      <ul>
        <li>A small, compressed audio file (about 9MB per hour of video), sent in pieces.</li>
        <li>Your IP address and a simple device marker, only to limit how many videos one person can process per day.</li>
      </ul>
      <h2>What happens to it</h2>
      <ul>
        <li>The audio is sent to a speech-to-text provider to make a transcript, and is not written to our disk or kept by us.</li>
        <li>The transcript is sent to an AI model to choose clips, and is kept only for your session.</li>
        <li>We have no accounts and no database of your content.</li>
        <li>If you press thumbs up or down on a clip, we store that rating anonymously to measure quality.</li>
      </ul>
      <h2>Third parties</h2>
      <p>The transcription and AI providers process your audio and text to give you a result. Their own policies apply to that processing. We will name them here before launch.</p>
      <h2>Questions</h2>
      <p>A contact address will be listed here before launch.</p>
    </Legal>
  );
}
