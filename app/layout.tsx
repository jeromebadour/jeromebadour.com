import "./globals.css";
import { SocialsProvider } from "@/components/Socials";
import { shownSocials } from "@/lib/server/socials";

// Link previews need full addresses; APP_URL is the site's own (https://jeromebadour.com on the box).
export const metadata = { metadataBase: new URL(process.env.APP_URL ?? "https://jeromebadour.com"), title: "Jerome Badour" };
// Every page reads the socials kept in the console, so a change shows at once without a deploy.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><SocialsProvider value={await shownSocials()}>{children}</SocialsProvider></body>
    </html>
  );
}
