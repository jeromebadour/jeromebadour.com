"use server";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/server/owner";
import { visitorKeys } from "@/lib/server/visitor";

export type SignInState = { error?: string; email?: string };

export async function signInAction(_: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").slice(0, 200);
  const password = String(form.get("password") ?? "").slice(0, 200);
  if (!email || !password) return { error: "Enter your email and password.", email };
  const keys = await visitorKeys();
  const r = await signIn(email, password, keys.at(-1)!);
  if (!r.ok) return { error: r.reason === "slow_down" ? "Too many tries. Wait 15 minutes, then try again." : "That email and password don't match.", email };
  redirect("/admin");
}

export async function signOutAction() {
  await signOut();
  redirect("/");
}
