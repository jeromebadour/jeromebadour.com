"use client";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Brand, Glyph, type GlyphName } from "./Glyph";
import { slugify } from "@/lib/slug";
import { createProposalAction, type ProposalState } from "@/app/actions/console";

export type ProofChoice = { id: string; title: string; g: GlyphName };

function Make() {
  const { pending } = useFormStatus();
  return <button type="submit" className="e-btn e-hire" disabled={pending}><Glyph name="tested" size={15} />{pending ? "Making" : "Make page"}</button>;
}

const Err = ({ text }: { text?: string }) => (text ? <span className="m-err"><Glyph name="close" size={13} />{text}</span> : null);

/** The New page dialog: the job's title and Upwork link, two lines for the client, exactly three proofs, and an
 *  optional headline for each picked proof (empty: the proof keeps its own title). */
export function ProposalForm({ choices }: { choices: ProofChoice[] }) {
  const [state, action] = useActionState<ProposalState, FormData>(createProposalAction, {});
  const v = state.values;
  const e = state.errors ?? {};
  const [title, setTitle] = useState(v?.title ?? "");
  const [picked, setPicked] = useState<string[]>(v?.proofs ?? []);
  const [heads, setHeads] = useState<Record<string, string>>(v?.headlines ?? {});
  const byId = new Map(choices.map((c) => [c.id, c]));
  const flip = (id: string) => setPicked((x) => (x.includes(id) ? x.filter((p) => p !== id) : x.length < 3 ? [...x, id] : x));
  return (
    <form action={action} className="c-dlg-form">
      <label className="m-field"><span className="m-l"><Glyph name="release" size={14} />Job title</span><input name="title" maxLength={120} required value={title} onChange={(x) => setTitle(x.target.value)} aria-invalid={!!e.title} /><Err text={e.title} /></label>
      <label className="m-field"><span className="m-l"><Brand name="upwork" size={14} />Job on Upwork</span><input name="job_url" type="url" required placeholder="https://www.upwork.com/jobs/~…" defaultValue={v?.jobUrl} aria-invalid={!!e.jobUrl} /><Err text={e.jobUrl} /></label>
      <label className="m-field"><span className="m-l"><Glyph name="message" size={14} />Note (two lines)</span><textarea name="note" rows={2} maxLength={400} required defaultValue={v?.note} aria-invalid={!!e.note} /><Err text={e.note} /></label>
      <div className="m-field"><span className="m-l"><Glyph name="tested" size={14} />Proofs (pick 3)<em className="c-picked">{picked.length} of 3</em></span>
        <div className="m-chips">
          {picked.map((id) => <input key={id} type="hidden" name="proofs" value={id} />)}
          {choices.map((c) => {
            const on = picked.includes(c.id);
            return <button key={c.id} type="button" className={on ? "on" : ""} aria-pressed={on} disabled={!on && picked.length >= 3} onClick={() => flip(c.id)}><Glyph name={on ? "tested" : c.g} size={13} />{c.title}</button>;
          })}
        </div>
        <Err text={e.proofs} />
      </div>
      {picked.length > 0 && (
        <div className="m-field"><span className="m-l"><Glyph name="release" size={14} />Headlines (optional)</span>
          <div className="c-hls">
            {picked.map((id, n) => {
              const c = byId.get(id);
              return (
                <label key={id} className="c-hl">
                  <span><span className="h-n">{String(n + 1).padStart(2, "0")}</span>{c && <Glyph name={c.g} size={13} />}</span>
                  <input name={`headline:${id}`} maxLength={80} placeholder={c?.title} value={heads[id] ?? ""} onChange={(x) => setHeads((h) => ({ ...h, [id]: x.target.value }))} aria-label={`Headline for ${c?.title ?? id}`} />
                </label>
              );
            })}
          </div>
          <Err text={e.headlines} />
        </div>
      )}
      <div className="c-addr"><Glyph name="web" size={13} />jeromebadour.com/for/<b>{slugify(title || "job")}</b></div>
      {e.form && <p className="m-err">{e.form}</p>}
      <footer><a className="e-btn e-ghost" href="?tab=proposals">Cancel</a><Make /></footer>
    </form>
  );
}
