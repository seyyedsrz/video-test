import VideoPlayer from "@/components/VideoPlayer";

export default function Home() {
  return (
    <main className="p-6">
      <VideoPlayer
        src="http://localhost:3000/master.m3u8"
        subtitles={[
          {
            label: "فارسی",
            src: "http://localhost:3000/sbtitles/output.vtt",
            srclang: "fa",
            default: true,
          },
        ]}
      />
    </main>
  );
}
