"use client";

import { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 300;
const FRAME_FOLDER = "/ezgif-8ec0382492b97893-png-split";

export function useImageSequence() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedCount = useRef(0);

  useEffect(() => {
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      const num = String(i).padStart(3, "0");
      img.src = `${FRAME_FOLDER}/ezgif-frame-${num}.png`;
      img.onload = () => {
        loadedCount.current++;
        if (loadedCount.current === TOTAL_FRAMES) {
          setImagesLoaded(true);
        }
      };
      images.push(img);
    }

    imagesRef.current = images;
  }, []);

  const setFrame = (progress: number) => {
    const frameIndex = Math.min(
      Math.floor(progress * TOTAL_FRAMES),
      TOTAL_FRAMES - 1
    );
    setCurrentFrame(frameIndex);
  };

  return { currentFrame, imagesLoaded, setFrame, images: imagesRef.current };
}
