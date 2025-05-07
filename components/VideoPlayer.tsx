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
  src: string;
  poster?: string;
  subtitles?: SubtitleTrack[];
}

const adData = [
  {
    title: "تبلیغ تستی",
    type: "pre-roll",
    media: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    skipAfter: 5,
    clickThrough: "https://mobinhost.com",
  },
];

const VideoPlayer: React.FC<PlayerProps> = ({ src, poster, subtitles }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);

  const initializePlayer = () => {
    if (!videoRef.current) return;

    // اضافه کردن دستی تگ‌های زیرنویس به تگ <video>
    if (subtitles?.length) {
      subtitles.forEach((track) => {
        const trackElement = document.createElement("track");
        trackElement.kind = "subtitles";
        trackElement.label = track.label;
        trackElement.src = track.src;
        trackElement.srclang = track.srclang;
        if (track.default) trackElement.default = true;
        videoRef.current!.appendChild(trackElement);
      });
    }

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: "auto",
      fluid: true,
      poster,
    });

    playerRef.current = player;

    player.ready(() => {
      // کیفیت برای HLS
      player.hlsQualitySelector({ displayCurrentQuality: true });

      const ad = adData[0];
      const mainSource = {
        src,
        type: "application/x-mpegURL",
      };

      let adPlaying = true;
      player.src({ src: ad.media, type: "video/mp4" });

      const playMainVideo = () => {
        adPlaying = false;
        player.src(mainSource);
        player.play();
      };

      player.on("ended", () => {
        if (adPlaying) playMainVideo();
      });

      // دکمه رد کردن تبلیغ
      if (ad.skipAfter !== undefined) {
        setTimeout(() => {
          const skipBtn = document.createElement("button");
          skipBtn.textContent = "رد کردن تبلیغ";
          Object.assign(skipBtn.style, {
            position: "absolute",
            bottom: "20px",
            right: "20px",
            zIndex: "999",
            padding: "8px 12px",
            background: "#000",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          });
          skipBtn.onclick = () => {
            skipBtn.remove();
            playMainVideo();
          };
          player.el()?.appendChild(skipBtn);
        }, ad.skipAfter * 1000);
      }

      player.el()?.addEventListener("click", () => {
        if (adPlaying && ad.clickThrough) {
          window.open(ad.clickThrough, "_blank");
        }
      });

      // فعال کردن زیرنویس
      player.on("loadedmetadata", () => {
        const tracks = player.textTracks();
        for (let i = 0; i < tracks.length; i++) {
          if (tracks[i].kind === "subtitles") {
            tracks[i].mode = "showing";
          }
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
