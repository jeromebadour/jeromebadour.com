"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Brand, Glyph, type BrandName } from "./Glyph";
import { brakeAction, saveSocialAction, type FormState } from "@/app/actions/console";

function Submit({ label, busy, glyph, danger = false }: { label: string; busy: string; glyph: "pause" | "tested"; danger?: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" className={`e-btn ${danger ? "c-danger" : "e-hire"}`} disabled={pending}><Glyph name={glyph} size={15} />{pending ? busy : label}</button>;
}
const Err = ({ text }: { text?: string }) => (text ? <span className="m-err"><Glyph name="close" size={13} />{text}</span> : null);

/** The Pause dialog: a pause needs a reason, kept on record. */
export function PauseForm({ name, what }: { name: string; what: string }) {
  const [state, action] = useActionState<FormState, FormData>(brakeAction.bind(null, name, true), {});
  return (
    <form action={action} className="c-dlg-form">
      <p className="c-sub">Visitors see a calm note instead of {what}. Nothing else changes.</p>
      <label className="m-field"><span className="m-l"><Glyph name="pause" size={14} />Reason</span><input name="reason" maxLength={200} required defaultValue={state.values?.reason} placeholder="Checking spend" /><Err text={state.error} /></label>
      <footer><a className="e-btn e-ghost" href="?tab=brakes">Cancel</a><Submit label="Pause" busy="Pausing" glyph="pause" danger /></footer>
    </form>
  );
}

const KINDS: [string, string][] = [["discord", "Discord"], ["github", "GitHub"], ["upwork", "Upwork"], ["linkedin", "LinkedIn"], ["x", "X"], ["youtube", "YouTube"], ["other", "Other"]];
const BRANDS = new Set(["discord", "github", "upwork"]);

/** Add or edit an account shown on the site. */
export function SocialForm({ id, initial }: { id: string | null; initial: { kind: string; label: string; url: string; onProposals: boolean } }) {
  const [state, action] = useActionState<FormState, FormData>(saveSocialAction.bind(null, id), {});
  const v = state.values;
  const e = state.errors ?? {};
  const [kind, setKind] = useState(v?.kind ?? initial.kind);
  return (
    <form action={action} className="c-dlg-form">
      <div className="m-field"><span className="m-l"><Glyph name="about" size={14} />Account</span>
        <input type="hidden" name="kind" value={kind} />
        <div className="m-chips">
          {KINDS.map(([k, l]) => (
            <button key={k} type="button" className={kind === k ? "on" : ""} aria-pressed={kind === k} onClick={() => setKind(k)}>
              {kind === k ? <Glyph name="tested" size={13} /> : BRANDS.has(k) ? <Brand name={k as BrandName} size={13} /> : <Glyph name="web" size={13} />}{l}
            </button>
          ))}
        </div>
        <Err text={e.kind} />
      </div>
      <label className="m-field"><span className="m-l"><Glyph name="release" size={14} />Name on the chip</span><input name="label" maxLength={30} required defaultValue={v?.label ?? initial.label} /><Err text={e.label} /></label>
      <label className="m-field"><span className="m-l"><Glyph name="web" size={14} />Address</span><input name="url" type="url" required defaultValue={v?.url ?? initial.url} placeholder="https://" /><Err text={e.url} /></label>
      <label className="c-check"><input type="checkbox" name="on_proposals" value="1" defaultChecked={v ? !!v.onProposals : initial.onProposals} />Shown on proposal pages</label>
      <footer><a className="e-btn e-ghost" href="?tab=socials">Cancel</a><Submit label="Save" busy="Saving" glyph="tested" /></footer>
    </form>
  );
}
