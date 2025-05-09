import VideoPlayer from "@/components/VideoPlayer";

export default function Home() {
  return (
    <main className="p-6">
      <VideoPlayer
        // src="https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_ts/master.m3u8"
        src="http://localhost:8080/short/short.m3u8"
        subtitles={[
          {
            label: "فارسی",
            src: "http://localhost:8080/sbtitles/output1.vtt",
            srclang: "fa",
            default: true,
          },
        ]}
        ads={[
          {
            title: "تبلیغ تستی",
            type: "pre-roll",
            media:
              "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
            skipAfter: 5,
            clickThrough: "https://mobinhost.com",
          },
        ]}
        watermarkText="reza@example.com"
        questions={[
          {
            question_text: "عنوان سوال اول",
            status: "active",
            time: "00:00:10",
            video: 1,
            type: "selective",
            choices: ["بله", "خیر"],
          },
          {
            question_text: "عنوان سوال دوم",
            status: "active",
            time: "00:00:20",
            video: 1,
            type: "selective",
            choices: ["گزینه ۱", "گزینه ۲", "گزینه ۳", "گزینه ۴"],
          },
        ]}
      />
    </main>
  );
}
