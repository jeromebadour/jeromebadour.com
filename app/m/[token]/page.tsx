import { StatusPage } from "@/components/StatusPage";

// A sender's status page. Shows the approved sample until messages are wired to the database.
export const metadata = { title: "Your message · Jerome Badour", robots: { index: false } };
export default function Page() { return <StatusPage />; }
