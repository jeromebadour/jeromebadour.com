import "./globals.css";
import { SocialsProvider } from "@/components/Socials";
import { shownSocials } from "@/lib/server/socials";

export const metadata = { title: "Jerome Badour" };
// Every page reads the socials kept in the console, so a change shows at once without a deploy.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><SocialsProvider value={await shownSocials()}>{children}</SocialsProvider></body>
    </html>
  );
}
