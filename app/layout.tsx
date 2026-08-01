import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit, Noto_Naskh_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-urdu",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Loop/90 — Diabetes Remission Challenge",
    template: "%s | Loop/90",
  },
  description:
    "A 90-day cohort-based type-2 diabetes remission program with a real care pod and an always-on AI coach.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Loop/90",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Loop/90 — Diabetes Remission Challenge",
    description:
      "90 days. Your care pod. Real remission science.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0C4A39",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  const isUrdu = locale === "ur";

  return (
    <html
      lang={locale}
      dir={isUrdu ? "rtl" : "ltr"}
      className={`${fraunces.variable} ${outfit.variable} ${notoNaskhArabic.variable}`}
    >
      <body className={isUrdu ? "font-urdu" : ""}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
