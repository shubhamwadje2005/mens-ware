"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Curated frame step (every 3rd frame = 100 frames) provides silky smooth 60fps scrub
// while reducing memory by 67% and preventing mobile & production browser freezes
const FRAME_STEP = 3;
const RAW_TOTAL_FRAMES = 300;
const FRAME_FOLDER = "/ezgif-8ec0382492b97893-png-split";

// Pre-generate the list of frame numbers: [1, 4, 7, ..., 300]
const FRAME_NUMBERS: number[] = [];
for (let i = 1; i <= RAW_TOTAL_FRAMES; i += FRAME_STEP) {
  FRAME_NUMBERS.push(i);
}
if (FRAME_NUMBERS[FRAME_NUMBERS.length - 1] !== RAW_TOTAL_FRAMES) {
  FRAME_NUMBERS.push(RAW_TOTAL_FRAMES);
}

const TOTAL_FRAMES = FRAME_NUMBERS.length;

export function useImageSequence() {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadedIndicesRef = useRef<Set<number>>(new Set());

  // Helper to find the nearest already-loaded frame for zero-stutter rendering
  const getRenderableImage = useCallback((targetIndex: number): HTMLImageElement | null => {
    const images = imagesRef.current;
    const direct = images[targetIndex];
    if (direct && direct.complete && direct.naturalWidth) {
      return direct;
    }

    const loaded = Array.from(loadedIndicesRef.current);
    if (loaded.length === 0) return null;

    let closest = loaded[0];
    let minDiff = Math.abs(loaded[0] - targetIndex);
    for (let i = 1; i < loaded.length; i++) {
      const diff = Math.abs(loaded[i] - targetIndex);
      if (diff < minDiff) {
        minDiff = diff;
        closest = loaded[i];
      }
    }
    return images[closest] || null;
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadFrame = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        if (imagesRef.current[index]) {
          resolve(imagesRef.current[index]!);
          return;
        }
        const img = new Image();
        const frameNum = FRAME_NUMBERS[index];
        const numStr = String(frameNum).padStart(3, "0");
        img.src = `${FRAME_FOLDER}/ezgif-frame-${numStr}.png`;
        img.onload = () => {
          if (!isCancelled) {
            imagesRef.current[index] = img;
            loadedIndicesRef.current.add(index);
          }
          resolve(img);
        };
        img.onerror = () => {
          resolve(img);
        };
      });
    };

    // Phase 1: Load FIRST FRAME immediately (<100ms) for instant display
    loadFrame(0).then(() => {
      if (!isCancelled) {
        setFirstFrameLoaded(true);
      }

      // Phase 2: Load key milestone frames (every 10th frame) for rapid 360 rotation coverage
      const milestoneIndices: number[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i += 10) {
        if (i !== 0) milestoneIndices.push(i);
      }

      Promise.all(milestoneIndices.map(loadFrame)).then(() => {
        if (isCancelled) return;

        // Phase 3: Concurrently stream remaining frames in non-blocking batches of 4
        const remainingIndices: number[] = [];
        for (let i = 0; i < TOTAL_FRAMES; i++) {
          if (!loadedIndicesRef.current.has(i)) {
            remainingIndices.push(i);
          }
        }

        let currentBatch = 0;
        const BATCH_SIZE = 4;

        const loadNextBatch = () => {
          if (isCancelled || currentBatch >= remainingIndices.length) {
            if (!isCancelled) setImagesLoaded(true);
            return;
          }
          const batch = remainingIndices.slice(currentBatch, currentBatch + BATCH_SIZE);
          currentBatch += BATCH_SIZE;
          Promise.all(batch.map(loadFrame)).then(() => {
            if (typeof window !== "undefined" && "requestIdleCallback" in window) {
              (window as any).requestIdleCallback(loadNextBatch, { timeout: 150 });
            } else {
              setTimeout(loadNextBatch, 40);
            }
          });
        };

        loadNextBatch();
      });
    });

    return () => {
      isCancelled = true;
    };
  }, []);

  const setFrame = useCallback((progress: number) => {
    const frameIndex = Math.min(
      Math.floor(progress * TOTAL_FRAMES),
      TOTAL_FRAMES - 1
    );
    setCurrentFrame(frameIndex);
  }, []);

  return {
    currentFrame,
    imagesLoaded,
    firstFrameLoaded,
    setFrame,
    images: imagesRef.current,
    getRenderableImage,
    totalFrames: TOTAL_FRAMES,
  };
}
