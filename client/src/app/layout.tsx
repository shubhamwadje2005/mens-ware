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
    default: "Maitri Men's Wear | The Classy Men's Wear",
    template: "%s | Maitri Men's Wear",
  },
  description:
    "Discover timeless elegance with Maitri Men's Wear - The Classy Men's Wear. Premium shirts, formal blazers, ethnic wear, oversized t-shirts, and luxury menswear crafted with style.",
  keywords: [
    "maitri mens wear",
    "maitri men's wear",
    "the classy men's wear",
    "luxury menswear",
    "premium clothing",
    "formal blazers",
    "ethnic wear",
    "shirts",
  ],
  authors: [{ name: "Maitri Men's Wear" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Maitri Men's Wear",
    title: "Maitri Men's Wear | The Classy Men's Wear",
    description: "Discover timeless style with Maitri Men's Wear - The Classy Men's Wear.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Maitri Men's Wear | The Classy Men's Wear",
    description: "Discover timeless style with Maitri Men's Wear - The Classy Men's Wear.",
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
