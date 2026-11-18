import { pageMeta } from "@/lib/meta";
import { WritingPage } from "@/components/PostPage";

export const metadata = pageMeta("writing");
export default function Page() { return <WritingPage />; }
