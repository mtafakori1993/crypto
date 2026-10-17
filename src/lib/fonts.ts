import localFont from "next/font/local";

// Vazir v16.1.0 — copied from the local font package into src/fonts (bundled; no absolute path at runtime).
export const vazir = localFont({
  variable: "--font-vazir",
  display: "swap",
  src: [
    { path: "../fonts/Vazir.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Vazir-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Vazir-Bold.woff2", weight: "700", style: "normal" },
  ],
  fallback: ["Tahoma", "system-ui", "sans-serif"],
});
