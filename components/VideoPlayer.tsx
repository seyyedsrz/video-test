"use client";

import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import "videojs-contrib-quality-levels";
import "videojs-hls-quality-selector";

interface SubtitleTrack {
  label: string;
  src: string;
  srclang: string;
  default?: boolean;
}

interface PlayerProps {
  src: string; // آدرس master.m3u8
  poster?: string;
  subtitles?: SubtitleTrack[];
}

const adData = [
  {
    title: "تبلیغ تستی",
    type: "pre-roll",
    media: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4", // ویدیوی تبلیغاتی
    skipAfter: 5,
    clickThrough: "https://mobinhost.com",
  },
];

const VideoPlayer: React.FC<PlayerProps> = ({ src, poster, subtitles }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  const initializePlayer = () => {
    if (!videoRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: "auto",
      fluid: true,
      poster,
      sources: [],
    });

    playerRef.current = player;

    // افزودن قابلیت انتخاب کیفیت برای HLS
    player.hlsQualitySelector({ displayCurrentQuality: true });

    // افزودن زیرنویس‌ها (در صورت وجود)
    if (subtitles?.length) {
      subtitles.forEach((track) => {
        player.addRemoteTextTrack(
          {
            kind: "subtitles",
            label: track.label,
            src: track.src,
            srclang: track.srclang,
            default: track.default || false,
          },
          false
        );
      });
    }

    const ad = adData[0];
    const mainSource = {
      src,
      type: "application/x-mpegURL",
    };

    player.ready(() => {
      // شروع با تبلیغ
      player.src({ src: ad.media, type: "video/mp4" });

      let adPlaying = true;

      const playMainVideo = () => {
        adPlaying = false;
        player.src(mainSource);
        player.play();
      };

      player.on("ended", () => {
        if (adPlaying) playMainVideo();
      });

      // افزودن دکمه رد کردن تبلیغ
      if (ad.skipAfter !== undefined) {
        setTimeout(() => {
          const skipBtn = document.createElement("button");
          skipBtn.textContent = "رد کردن تبلیغ";
          skipBtn.style.position = "absolute";
          skipBtn.style.bottom = "20px";
          skipBtn.style.right = "20px";
          skipBtn.style.zIndex = "999";
          skipBtn.style.padding = "8px 12px";
          skipBtn.style.background = "#000";
          skipBtn.style.color = "#fff";
          skipBtn.style.border = "none";
          skipBtn.style.cursor = "pointer";
          skipBtn.onclick = () => {
            skipBtn.remove();
            playMainVideo();
          };
          player.el()?.appendChild(skipBtn);
        }, ad.skipAfter * 1000);
      }

      // کلیک روی تبلیغ
      player.el()?.addEventListener("click", () => {
        if (adPlaying && ad.clickThrough) {
          window.open(ad.clickThrough, "_blank");
        }
      });
    });
  };

  useEffect(() => {
    initializePlayer();
    return () => {
      playerRef.current?.dispose();
    };
  }, [src]);

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        id="videojs-player"
        crossOrigin="anonymous"
        playsInline
        className="video-js vjs-big-play-centered vjs-default-skin"
      />
    </div>
  );
};

export default VideoPlayer;
