"use server";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/server/owner";
import { replyTo } from "@/lib/server/messages";
import { redirect } from "next/navigation";
import { createProposal, setProposalOn, type ProposalErrors } from "@/lib/server/proposals";

export type ReplyState = { error?: string; sent?: boolean };

export async function replyAction(id: string, _: ReplyState, form: FormData): Promise<ReplyState> {
  await requireOwner();
  const r = await replyTo(id, String(form.get("reply") ?? "").slice(0, 9000));
  revalidatePath("/admin");
  return r.ok ? { sent: true } : { error: r.error };
}

export type ProposalState = { errors?: ProposalErrors; values?: { title: string; jobUrl: string; note: string; proofs: string[] } };

export async function createProposalAction(_: ProposalState, form: FormData): Promise<ProposalState> {
  await requireOwner();
  const values = {
    title: String(form.get("title") ?? "").slice(0, 200),
    jobUrl: String(form.get("job_url") ?? "").slice(0, 500),
    note: String(form.get("note") ?? "").slice(0, 600),
    proofs: form.getAll("proofs").map(String).slice(0, 10),
  };
  const r = await createProposal(values);
  if (!r.ok) return { errors: r.errors, values };
  revalidatePath("/admin");
  redirect(`/admin?tab=proposals&made=${r.slug}`);
}

export async function toggleProposalAction(form: FormData) {
  await requireOwner();
  await setProposalOn(String(form.get("id")), form.get("on") === "1");
  revalidatePath("/admin");
}
