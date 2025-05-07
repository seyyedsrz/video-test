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
        ads={[
          {
            title: "تبلیغ تستی",
            type: "pre-roll",
            media: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            skipAfter: 5,
            clickThrough: "https://mobinhost.com",
          },
        ]}
        watermarkText="reza@example.com"
      />
    </main>
  );
}
