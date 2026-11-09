"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Glyph } from "./Glyph";
import { replyAction, type ReplyState } from "@/app/actions/console";

function Send() {
  const { pending } = useFormStatus();
  return <button type="submit" className="e-btn e-hire" disabled={pending}><Glyph name="message" size={15} />{pending ? "Sending" : "Send reply"}</button>;
}

/** The reply box in the Inbox's message dialog: sends the email and puts the reply on the sender's status page. */
export function ReplyForm({ id, to }: { id: string; to: string }) {
  const [state, action] = useActionState<ReplyState, FormData>(replyAction.bind(null, id), {});
  return (
    <form action={action} className="c-reply">
      <label className="m-field">
        <span className="m-l"><Glyph name="message" size={14} />Reply to {to}</span>
        <textarea name="reply" rows={7} maxLength={8000} required />
      </label>
      {state.error && <p className="m-err"><Glyph name="close" size={13} />{state.error}</p>}
      <footer><a className="e-btn e-ghost" href="?tab=inbox">Close</a><Send /></footer>
    </form>
  );
}
