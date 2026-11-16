import type { Metadata, Viewport } from "next";
import "./globals.css";
import SystemSignatureGuard from "@/components/SystemSignatureGuard";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1C6B53" },
    { media: "(prefers-color-scheme: dark)", color: "#0B2B21" },
  ],
};

export const metadata: Metadata = {
  title: "Annual Evaluation Dashboard",
  description: "Annual Evaluation & Performance Analytics Dashboard — Engineered by Omer Ayad",
  applicationName: "Annual Evaluation Dashboard",
  authors: [{ name: "Omer Ayad" }],
  creator: "Omer Ayad",
  publisher: "Omer Ayad",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Annual Evaluation",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Annual Evaluation" />
        <meta name="author" content="Omer Ayad" />
        <meta name="copyright" content="Omer Ayad" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('app_color_theme');if(!t){t='emerald';localStorage.setItem('app_color_theme','emerald');}document.documentElement.setAttribute('data-theme',t);var m=localStorage.getItem('theme');if(m==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased text-[#1F2937]">
        {children}
        <SystemSignatureGuard />
      </body>
    </html>
  );
}

