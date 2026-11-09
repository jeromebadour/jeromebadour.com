"use server";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/server/owner";
import { replyTo } from "@/lib/server/messages";
import { redirect } from "next/navigation";
import { createProposal, setProposalOn, type ProposalErrors } from "@/lib/server/proposals";
import { removeSocial, saveSocial } from "@/lib/server/socials";
import { setBrake } from "@/lib/server/brakes";

export type ReplyState = { error?: string; sent?: boolean };

export async function replyAction(id: string, _: ReplyState, form: FormData): Promise<ReplyState> {
  await requireOwner();
  const r = await replyTo(id, String(form.get("reply") ?? "").slice(0, 9000));
  revalidatePath("/admin");
  return r.ok ? { sent: true } : { error: r.error };
}

export type ProposalState = { errors?: ProposalErrors; values?: { title: string; jobUrl: string; note: string; proofs: string[]; headlines: Record<string, string> } };

export async function createProposalAction(_: ProposalState, form: FormData): Promise<ProposalState> {
  await requireOwner();
  const values = {
    title: String(form.get("title") ?? "").slice(0, 200),
    jobUrl: String(form.get("job_url") ?? "").slice(0, 500),
    note: String(form.get("note") ?? "").slice(0, 600),
    proofs: form.getAll("proofs").map(String).slice(0, 10),
    headlines: {} as Record<string, string>,
  };
  for (const id of values.proofs) values.headlines[id] = String(form.get(`headline:${id}`) ?? "").slice(0, 200);
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

export type FormState = { error?: string; errors?: Record<string, string>; values?: Record<string, string> };

export async function brakeAction(name: string, paused: boolean, _: FormState, form: FormData): Promise<FormState> {
  await requireOwner();
  const reason = String(form.get("reason") ?? "").slice(0, 300);
  const error = await setBrake(name, paused, reason);
  if (error) return { error, values: { reason } };
  revalidatePath("/admin");
  redirect("/admin?tab=brakes");
}

export async function saveSocialAction(id: string | null, _: FormState, form: FormData): Promise<FormState> {
  await requireOwner();
  const values = { kind: String(form.get("kind") ?? ""), label: String(form.get("label") ?? "").slice(0, 60), url: String(form.get("url") ?? "").slice(0, 400), onProposals: form.get("on_proposals") === "1" ? "1" : "" };
  const r = await saveSocial({ id, kind: values.kind, label: values.label, url: values.url, onProposals: !!values.onProposals });
  if (!r.ok) return { errors: r.errors as Record<string, string>, values };
  revalidatePath("/", "layout");
  redirect("/admin?tab=socials");
}

export async function removeSocialAction(form: FormData) {
  await requireOwner();
  await removeSocial(String(form.get("id")));
  revalidatePath("/", "layout");
  redirect("/admin?tab=socials");
}

export async function resumeAction(form: FormData) {
  await requireOwner();
  await setBrake(String(form.get("name")), false, "");
  revalidatePath("/admin");
}
