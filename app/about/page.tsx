import { pageMeta } from "@/lib/meta";
import { AboutPage } from "@/components/AboutPage";

export const metadata = pageMeta("about");
export default function Page() { return <AboutPage />; }
