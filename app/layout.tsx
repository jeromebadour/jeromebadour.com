import "./globals.css";
import { SocialsProvider } from "@/components/Socials";
import { shownSocials } from "@/lib/server/socials";
import { headers } from "next/headers";
import { UpworkMode } from "@/components/UpworkMode";
import { THEME_SCRIPT } from "@/components/ThemeSwitch";

// Link previews need full addresses; APP_URL is the site's own (https://jeromebadour.com on the box).
export const metadata = { metadataBase: new URL(process.env.APP_URL ?? "https://jeromebadour.com"), title: "Jerome Badour" };
// Every page reads the socials kept in the console, so a change shows at once without a deploy.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-via="upwork": a visit from Upwork (proxy.ts); the contact routes are hidden by CSS.
    // data-theme: set by THEME_SCRIPT before paint when the visitor picked light or dark; otherwise the computer decides.
    <html lang="en" data-via={(await headers()).get("x-via") === "upwork" ? "upwork" : undefined} suppressHydrationWarning>
      <head><meta name="color-scheme" content="dark light" /><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
      <body><SocialsProvider value={await shownSocials()}>{children}</SocialsProvider><UpworkMode /></body>
    </html>
  );
}
