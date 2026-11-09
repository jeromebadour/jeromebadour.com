"use server";
import { redirect } from "next/navigation";
import { sendMessage, type FieldErrors } from "@/lib/server/messages";
import { visitorKeys } from "@/lib/server/visitor";

export type MessageState = { errors?: FieldErrors; values?: Record<string, string | string[]> };

export async function sendMessageAction(_: MessageState, form: FormData): Promise<MessageState> {
  const input = {
    name: String(form.get("name") ?? "").slice(0, 200),
    email: String(form.get("email") ?? "").slice(0, 300),
    brief: String(form.get("brief") ?? "").slice(0, 5000),
    builtWith: form.getAll("built_with").map(String).slice(0, 10),
    howSoon: String(form.get("how_soon") ?? ""),
    fromQuestionId: (form.get("from") as string | null) || null,
    trap: String(form.get("website") ?? ""),
  };
  // A filled trap field is a bot: it gets the home page and nothing is stored or sent.
  if (input.trap) redirect("/");
  const r = await sendMessage(input, await visitorKeys());
  if (!r.ok) return { errors: r.errors, values: { name: input.name, email: input.email, brief: input.brief, built_with: input.builtWith, how_soon: input.howSoon } };
  redirect(`/m/${r.token}`);
}
