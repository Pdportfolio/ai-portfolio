import type { Metadata, Viewport } from "next";
import { ChatProvider } from "./components/ChatContext";
import { SmoothScroll } from "./components/SmoothScroll";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="relative bg-white text-zinc-950">
        <ChatProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ChatProvider>
      </body>
    </html>
  );
}
