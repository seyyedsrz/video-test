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

interface AdTrack {
  title: string;
  type: "pre-roll";
  media: string;
  skipAfter?: number;
  clickThrough?: string;
}

interface PlayerProps {
  src: string;
  poster?: string;
  subtitles?: SubtitleTrack[];
  ads?: AdTrack[];
  watermarkText?: string;
}

const VideoPlayer: React.FC<PlayerProps> = ({
  src,
  poster,
  subtitles,
  ads = [],
  watermarkText,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<Player | null>(null);
  const wasPlayingRef = useRef(false);

  const addWatermark = (player: Player, text: string) => {
    const watermark = document.createElement("div");
    watermark.innerText = text;
    watermark.classList.add("watermark");

    Object.assign(watermark.style, {
      position: "absolute",
      opacity: "0.4",
      color: "white",
      fontSize: "12px",
      zIndex: 9999,
      pointerEvents: "none",
      transition: "all 0.5s ease",
    });

    const positions = [
      { top: "10px", left: "10px" },
      { top: "10px", right: "10px", left: "" },
      { bottom: "10px", left: "10px", top: "", right: "" },
      { bottom: "10px", right: "10px", top: "", left: "" },
    ];

    let current = 0;

    const moveWatermark = () => {
      const pos = positions[current];
      Object.assign(watermark.style, {
        top: pos.top || "",
        right: pos.right || "",
        bottom: pos.bottom || "",
        left: pos.left || "",
      });
      current = (current + 1) % positions.length;
    };

    const interval = setInterval(moveWatermark, 10000);
    moveWatermark();

    player.el()?.appendChild(watermark);

    player.on("dispose", () => {
      clearInterval(interval);
    });
  };

  const initializePlayer = () => {
    if (!videoRef.current) return;

    if (
      subtitles?.length &&
      videoRef.current.querySelectorAll("track").length === 0
    ) {
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
      player.hlsQualitySelector({ displayCurrentQuality: true });

      const ad = ads[0];
      const mainSource = {
        src,
        type: "application/x-mpegURL",
      };

      let adPlaying = false;

      if (ad) {
        adPlaying = true;
        player.src({ src: ad.media, type: "video/mp4" });

        const playMainVideo = () => {
          adPlaying = false;
          player.src(mainSource);
          player.play();
        };

        player.on("ended", () => {
          if (adPlaying) playMainVideo();
        });

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
      } else {
        player.src(mainSource);
      }

      player.on("loadedmetadata", () => {
        const tracks = player.textTracks();
        for (let i = 0; i < tracks.length; i++) {
          if (tracks[i].kind === "subtitles") {
            tracks[i].mode = "showing";
          }
        }
      });

      if (watermarkText) {
        addWatermark(player, watermarkText);
      }
    });
  };

  useEffect(() => {
    initializePlayer();

    const handleVisibility = () => {
      const player = playerRef.current;
      const playerEl = player?.el();
      if (!player || !playerEl) return;

      const existingOverlay = document.getElementById("pause-overlay");

      if (document.visibilityState === "hidden") {
        if (!player.paused()) {
          wasPlayingRef.current = true;
          player.pause();
        } else {
          wasPlayingRef.current = false;
        }

        if (!existingOverlay) {
          const overlay = document.createElement("div");
          overlay.id = "pause-overlay";
          Object.assign(overlay.style, {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            zIndex: "10000",
          });
          overlay.innerText = "برای ادامه، لطفاً به تب مرورگر بازگردید.";
          playerEl.appendChild(overlay);
        }
      } else {
        const overlay = document.getElementById("pause-overlay");
        if (overlay) overlay.remove();
        if (wasPlayingRef.current) {
          player.muted(false);
          player.play();
        }
      }
    };

    const disableRightClick = (e: MouseEvent) => {
      if (videoRef.current && videoRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("contextmenu", disableRightClick);

    return () => {
      playerRef.current?.dispose();
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, [src, watermarkText]);

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
