import { pageMeta } from "@/lib/meta";
import { ServicesPage } from "@/components/ServicesPage";

export const metadata = pageMeta("services");
export default function Page() { return <ServicesPage />; }
