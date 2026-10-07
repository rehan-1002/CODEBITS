import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { GlobalShell } from "@/components/providers/GlobalShell";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://codebits-eight.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CodeBits | Mumbai University Engineering Portal & Academic Vault",
    template: "%s | CodeBits",
  },
  description:
    "Official CodeBits academic repository & institutional portal for Mumbai University engineering students. Question papers (PYQs), lecture notes, verified solutions, and curriculum roadmap guided by Prof. Rohit Falake (M.R.F).",
  applicationName: "CodeBits",
  keywords: [
    "CodeBits",
    "Codebits",
    "codebits mumbai",
    "codebits portal",
    "Prof. Rohit Falake",
    "Prof MRF",
    "Mumbai University Engineering",
    "Mumbai University Question Papers",
    "MU PYQ",
    "Engineering Question Papers",
    "Engineering Notes",
    "MU Solutions",
    "Academic Vault",
    "Rev-2019 C Scheme",
    "Computer Engineering",
    "Information Technology",
    "AI DS Mumbai University",
  ],
  authors: [{ name: "Prof. Rohit Falake (M.R.F)" }, { name: "CodeBits Academic Team" }],
  creator: "CodeBits",
  publisher: "CodeBits Academic Portal",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CodeBits | Mumbai University Engineering Portal & Academic Vault",
    description:
      "Centralized, curated academic vault for Mumbai University engineering students. Official question papers, notes, and faculty solutions.",
    url: siteUrl,
    siteName: "CodeBits",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/codebits-brand-logo.png",
        width: 1200,
        height: 630,
        alt: "CodeBits Mumbai University Academic Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeBits | Mumbai University Academic Vault",
    description: "Curated PYQs, notes, and vetted solutions for Mumbai University engineering.",
    images: ["/codebits-brand-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32" },
      { url: "/LOGO CB.png" },
    ],
    shortcut: "/favicon.png",
    apple: "/LOGO CB.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      name: "CodeBits",
      alternateName: ["CodeBits Portal", "CodeBits Mumbai University", "CodeBits Prof MRF"],
      url: siteUrl,
      logo: `${siteUrl}/LOGO%20CB.png`,
      founder: {
        "@type": "Person",
        name: "Prof. Rohit Falake (M.R.F)",
        jobTitle: "Professor & Academic Mentor",
      },
      description:
        "Centralized, authenticated academic repository and curriculum gateway designed specifically for Mumbai University engineering students.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "CodeBits",
      description: "Mumbai University Engineering Academic Vault & Institutional Portal",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={cn("antialiased", inter.variable, jetbrainsMono.variable, "font-sans", geist.variable, "light")}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem('codebits-theme');
                if (saved === 'dark') {
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
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
