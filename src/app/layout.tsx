import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { Toaster } from "@/components/ui/misc";
import { SITE } from "@/lib/config";
import { vazir } from "@/lib/fonts";
import { SimProvider } from "@/lib/store/sim-provider";
import { simNow } from "@/lib/market/model";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", locale: "fa_IR", siteName: SITE.name, url: SITE.url, title: `${SITE.name} | ${SITE.tagline}`, description: SITE.description },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};
export const viewport: Viewport = { themeColor: "#0a111f", width: "device-width", initialScale: 1 };

// Applies the saved theme before first paint (no flash). Stores only the string "dark" | "light".
const themeScript = `try{var t=localStorage.getItem("shomaaa-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await connection();
  return (
    <html lang="fa" dir="rtl" className={vazir.variable} data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:right-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink">
          پرش به محتوای اصلی
        </a>
        <SimProvider serverNow={simNow()}>
          {children}
          <Toaster />
        </SimProvider>
      </body>
    </html>
  );
}
