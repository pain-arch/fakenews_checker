import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fake or Real | Understand the story behind the story",
  description:
    "Reader-friendly news analysis with neutral summaries, sentiment, and AI-estimated political framing.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <ClerkProvider
          afterSignOutUrl="/"
          appearance={{
            variables: {
              borderRadius: "8px",
              colorBackground: "#ffffff",
              colorBorder: "#dce3de",
              colorDanger: "#8b3f25",
              colorForeground: "#063b25",
              colorMuted: "#f1f5f1",
              colorMutedForeground: "#596860",
              colorPrimary: "#0a5d2d",
              colorPrimaryForeground: "#ffffff",
              colorRing: "#78e66b",
              colorSuccess: "#247a4b",
              fontFamily: "Roboto, Arial, sans-serif",
              spacing: "1rem",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
