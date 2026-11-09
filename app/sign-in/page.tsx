import { redirect } from "next/navigation";
import { SignInForm } from "@/components/SignInForm";
import { currentOwner } from "@/lib/server/owner";
import { page } from "@/lib/links";

// The owner's sign-in. Not linked from anywhere and not indexed; the console itself answers 404 until signed in.
export const metadata = { title: "Sign in · Jerome Badour", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  if (await currentOwner()) redirect("/admin");
  return (
    <div className="page si-page" data-v="e">
      <div className="si-card">
        <a className="e-brand" href={page.home}><span className="e-mono">JB</span>Console</a>
        <SignInForm />
      </div>
    </div>
  );
}
