import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { GlobalShell } from "@/components/providers/GlobalShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CodeBits | Mumbai University Academic Vault & Institutional Portal",
  description:
    "Centralized, controlled academic repository and institutional gateway for Mumbai University engineering students under Rev-2019 'C' Scheme. Guided by Prof. Rohit Falake (M.R.F).",
  keywords: [
    "CodeBits",
    "Mumbai University",
    "Engineering Question Papers",
    "PYQ",
    "Engineering Notes",
    "Rev-2019 C Scheme",
    "Prof. MRF",
  ],
  authors: [{ name: "Prof. Rohit Falake (M.R.F) & CodeBits Academic Team" }],
  icons: {
    icon: "/LOGO CB.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-[var(--bg-base)] text-[var(--text-primary)]">
        <ThemeProvider>
          <SmoothScroll>
            <GlobalShell>{children}</GlobalShell>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
