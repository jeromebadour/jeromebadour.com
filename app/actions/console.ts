"use server";
import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/server/owner";
import { replyTo } from "@/lib/server/messages";

export type ReplyState = { error?: string; sent?: boolean };

export async function replyAction(id: string, _: ReplyState, form: FormData): Promise<ReplyState> {
  await requireOwner();
  const r = await replyTo(id, String(form.get("reply") ?? "").slice(0, 9000));
  revalidatePath("/admin");
  return r.ok ? { sent: true } : { error: r.error };
}
