import Image from "next/image";

interface BrandLogoProps {
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
}

/**
 * BrandLogo: Adaptive Men's Wear Brand Logo
 * - In Dark Mode: Displays white lettering, beard, glasses and details (logo-dark.png)
 * - In Light Mode: Displays crisp black lettering, beard, glasses and details (logo-light.png)
 * - Preserves signature orange turban, orange "म", and red tilak in both modes
 * - Zero hydration mismatch and zero flash using pure CSS selectors
 */
export default function BrandLogo({
  width = 65,
  height = 44,
  className = "h-9 w-auto object-contain",
  priority = false,
  alt = "Maitri Men's Wear",
}: BrandLogoProps) {
  return (
    <>
      <Image
        src="/logo-dark.png"
        alt={alt}
        width={width}
        height={height}
        className={`${className} logo-dark-mode`}
        priority={priority}
        style={{ width: "auto" }}
      />
      <Image
        src="/logo-light.png"
        alt={alt}
        width={width}
        height={height}
        className={`${className} logo-light-mode`}
        priority={priority}
        style={{ width: "auto" }}
      />
    </>
  );
}
