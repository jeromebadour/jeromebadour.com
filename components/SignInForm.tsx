"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Glyph } from "./Glyph";
import { signInAction, type SignInState } from "@/app/actions/owner";

function Submit() {
  const { pending } = useFormStatus();
  return <button type="submit" className="e-btn e-hire si-go" disabled={pending}><Glyph name="arrow" size={15} />{pending ? "Signing in" : "Sign in"}</button>;
}

export function SignInForm() {
  const [state, action] = useActionState<SignInState, FormData>(signInAction, {});
  return (
    <form action={action} className="si-form">
      <label className="m-field"><span className="m-l"><Glyph name="mail" size={14} />Email</span><input name="email" type="email" autoComplete="username" required defaultValue={state.email} /></label>
      <label className="m-field"><span className="m-l"><Glyph name="shield" size={14} />Password</span><input name="password" type="password" autoComplete="current-password" required /></label>
      {state.error && <p className="si-err" role="alert"><Glyph name="close" size={14} />{state.error}</p>}
      <Submit />
    </form>
  );
}
