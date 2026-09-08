import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { SearchProvider } from "@/context/SearchContext";
import { OrderProvider } from "@/context/OrderContext";
import ReduxProvider from "@/components/layout/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NOIR—STUDIO | Premium Menswear & Luxury Clothing",
    template: "%s | NOIR—STUDIO",
  },
  description:
    "Discover timeless luxury. Premium oversized t-shirts, silk shirts, cargo pants, hoodies, jackets, sneakers and accessories. Crafted with intention.",
  keywords: [
    "luxury clothing",
    "premium menswear",
    "oversized t-shirts",
    "silk shirts",
    "cargo pants",
    "hoodies",
    "designer sneakers",
    "noir studio",
  ],
  authors: [{ name: "NOIR—STUDIO" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "NOIR—STUDIO",
    title: "NOIR—STUDIO | Premium Menswear & Luxury Clothing",
    description: "Discover timeless luxury. Premium clothing crafted with intention.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NOIR—STUDIO | Premium Menswear & Luxury Clothing",
    description: "Discover timeless luxury. Premium clothing crafted with intention.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('noir_theme');
      var theme = stored;
      if (!theme || theme === 'system') {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      var root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      root.setAttribute('data-theme', theme);
      root.style.colorScheme = theme;
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen transition-colors duration-300" suppressHydrationWarning>
        <ReduxProvider>
          <ThemeProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <ToastProvider>
                    <SearchProvider>
                      <OrderProvider>
                        <div className="noise-overlay" />
                        {children}
                      </OrderProvider>
                    </SearchProvider>
                  </ToastProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
