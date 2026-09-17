/**
 * Client-side image reader and high-efficiency canvas optimizer.
 * Handles high-resolution images from phones/cameras, converts to optimized JPEG/WebP base64,
 * and guarantees safety timeouts with complete error handling so uploads never freeze.
 */
export async function processAndOptimizeImageFile(
  file: File,
  maxDimension = 1400,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 1. Validate file exists
    if (!file) {
      return reject(new Error("No file provided"));
    }

    // 2. Validate file type & extension
    const isImageMime = file.type && file.type.startsWith("image/");
    const isImageExt = /\.(jpe?g|png|webp|gif|avif|bmp|jfif|svg)$/i.test(file.name);

    if (!isImageMime && !isImageExt) {
      return reject(new Error(`"${file.name}" is not a supported image format.`));
    }

    // 3. Safety timeout: prevent indefinite freeze if OS file lock happens
    const timeoutId = setTimeout(() => {
      reject(new Error(`Timeout reading "${file.name}". File might be locked or inaccessible.`));
    }, 15000);

    const reader = new FileReader();

    reader.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to read "${file.name}".`));
    };

    reader.onabort = () => {
      clearTimeout(timeoutId);
      reject(new Error(`Reading of "${file.name}" was aborted.`));
    };

    reader.onload = (event) => {
      clearTimeout(timeoutId);
      const rawResult = event.target?.result as string;
      if (!rawResult) {
        return reject(new Error(`File "${file.name}" was empty.`));
      }

      // If already small or SVG/GIF, return as is
      if (
        file.size < 200 * 1024 ||
        file.type === "image/svg+xml" ||
        file.type === "image/gif" ||
        file.name.toLowerCase().endsWith(".gif") ||
        file.name.toLowerCase().endsWith(".svg")
      ) {
        return resolve(rawResult);
      }

      // 4. Resize and compress using HTML5 Canvas
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data url if canvas fails
        resolve(rawResult);
      };

      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d", { willReadFrequently: false });
          if (!ctx) {
            return resolve(rawResult);
          }

          // Smooth rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Try WEBP first, fallback to JPEG
          let optimized = "";
          try {
            optimized = canvas.toDataURL("image/webp", quality);
            if (!optimized.startsWith("data:image/webp")) {
              optimized = canvas.toDataURL("image/jpeg", quality);
            }
          } catch {
            optimized = canvas.toDataURL("image/jpeg", quality);
          }

          resolve(optimized || rawResult);
        } catch {
          resolve(rawResult);
        }
      };

      img.src = rawResult;
    };

    reader.readAsDataURL(file);
  });
}
