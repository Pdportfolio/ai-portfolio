import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ChatProvider } from "./components/ChatContext";
import { Footer } from "./components/Footer";
import { SmoothScroll } from "./components/SmoothScroll";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

const themeInitScript = `(function(){try{var k="portfolio-theme";var t=localStorage.getItem(k);var d=t||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=d;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export const metadata: Metadata = {
  title: "Prakhar Dwivedi, AI/ML Engineer",
  description:
    "Portfolio of Prakhar Dwivedi, AI/ML Engineer. Production extraction, search, and tool-calling systems, plus ML for disease, metal, and local agents.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="relative">
        <Script id="portfolio-theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider>
          <ChatProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </ChatProvider>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
