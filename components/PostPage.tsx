import type { ReactNode } from "react";
import { EFooter, EHeader, ETabbar } from "./Shell";
import { Glyph } from "./Glyph";
import { page } from "@/lib/links";
import { POSTS, postDate, postPath, type Post } from "@/lib/posts";

// A post (/writing/<slug>), drawn from its markdown word for word. The draft uses only these: "## " headings, "---"
// breaks, paragraphs, "- " lists, **bold**, fenced code, one table, and "[Screenshot NN: caption]" lines, each
// replaced by its picture with the caption under it (04 is two pages side by side).

// The pictures, cleaned by Freelance Strategy (oracle-post-pictures.zip, 2026-11-18): file, width, height.
const PICS: Record<string, [string, number, number][]> = {
  "01": [["01-payment-declined-aug3.png", 1700, 830]],
  "02": [["02-my-email-to-oracle-aug3.png", 1700, 605]],
  "03": [["03-services-ready-aug4.png", 1700, 915]],
  "04": [["04-oracle-invoice-p1.png", 935, 1210], ["04-oracle-invoice-p2.png", 935, 1210]],
  "05": [["05-console-regions-down-aug4.png", 1705, 858]],
  "06": [["06-support-chat-cant-sign-in-aug4.png", 385, 625]],
  "07": [["07-support-chat-terminated-aug4.png", 380, 620]],
  "08": [["08-support-chat-appeal-aug4.png", 385, 625]],
};

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/).map((s, i) => (s.startsWith("**") && s.endsWith("**") ? <b key={i}>{s.slice(2, -2)}</b> : s));
}

const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function Figure({ marker }: { marker: string }) {
  const m = marker.match(/^\[Screenshot (\d\d)[^:]*: ([\s\S]*)\]$/);
  if (!m || !PICS[m[1]]) throw new Error(`post: unknown picture ${marker}`);
  const pics = PICS[m[1]];
  // A caption is the marker's words after the colon, its first letter capitalised (Freelance Strategy 2026-11-18).
  const cap = m[2].charAt(0).toUpperCase() + m[2].slice(1);
  const narrow = pics[0][1] < 600;
  return (
    <figure className={`p-fig${pics.length > 1 ? " p-two" : ""}${narrow ? " p-narrow" : ""}`}>
      <div className="p-shots">
        {pics.map(([f, w, h]) => (
          <a key={f} href={`/writing/oracle/${f}`} className="p-shot"><img src={`/writing/oracle/${f}`} width={w} height={h} alt={cap} loading="lazy" /></a>
        ))}
      </div>
      <figcaption>{cap}</figcaption>
    </figure>
  );
}

export function renderBody(md: string): ReactNode[] {
  const lines = md.split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  const k = () => out.length;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    if (l.startsWith("```")) {
      const code: string[] = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) code.push(lines[i]);
      i++;
      out.push(<pre key={k()} className="p-code" tabIndex={0}><code>{code.join("\n")}</code></pre>);
      continue;
    }
    if (l.trim() === "---") { out.push(<hr key={k()} className="p-hr" />); i++; continue; }
    if (l.startsWith("## ")) { const t = l.slice(3); out.push(<h2 key={k()} id={slug(t)}>{t}</h2>); i++; continue; }
    if (l.startsWith("[Screenshot")) {
      const buf = [l];
      while (!buf[buf.length - 1].trimEnd().endsWith("]")) buf.push(lines[++i]);
      i++;
      out.push(<Figure key={k()} marker={buf.join(" ").replace(/\s+/g, " ")} />);
      continue;
    }
    if (l.startsWith("|")) {
      const rows: string[][] = [];
      for (; i < lines.length && lines[i].startsWith("|"); i++) rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim()));
      const [head, , ...body] = rows;
      out.push(
        <div key={k()} className="p-table" tabIndex={0}>
          <table><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>{body.map((r, n) => <tr key={n}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>)}</tbody></table>
        </div>,
      );
      continue;
    }
    if (l.startsWith("- ")) {
      const items: string[] = [];
      for (; i < lines.length && (lines[i].startsWith("- ") || lines[i].startsWith("  ")); i++) {
        if (lines[i].startsWith("- ")) items.push(lines[i].slice(2)); else items[items.length - 1] += " " + lines[i].trim();
      }
      out.push(<ul key={k()}>{items.map((t, n) => <li key={n}>{inline(t)}</li>)}</ul>);
      continue;
    }
    const para: string[] = [];
    for (; i < lines.length && lines[i].trim() && !/^(```|## |---\s*$|\[Screenshot|\||- )/.test(lines[i]); i++) para.push(lines[i].trim());
    out.push(<p key={k()}>{inline(para.join(" "))}</p>);
  }
  return out;
}

export function PostPage({ post }: { post: Post }) {
  return (
    <div className="page" data-v="e">
      <EHeader />
      <article className="p-post">
        <header className="p-head">
          <div className="w-crumb"><a href="/writing"><Glyph name="how" size={13} />Writing</a></div>
          <h1>{post.title}</h1>
          <div className="p-by">
            <a href={page.about} className="p-author"><img src="/jerome.jpg" alt="" width={34} height={34} /><b>Jerome Badour</b></a>
            <time dateTime={post.published}>{postDate(post)}</time>
          </div>
        </header>
        <div className="p-body">{renderBody(post.body)}</div>
      </article>
      <EFooter />
      <ETabbar />
    </div>
  );
}

export function WritingPage() {
  return (
    <div className="page" data-v="e">
      <EHeader />
      <section className="p-index">
        <div className="e-how-head"><span className="e-k"><Glyph name="how" size={13} />Writing</span></div>
        <h1>Writing</h1>
        <ul>
          {POSTS.map((p) => (
            <li key={p.slug}>
              <a href={postPath(p)}>
                <time dateTime={p.published}>{postDate(p)}</time>
                <b>{p.title}</b>
                <span>{p.summary}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <EFooter />
      <ETabbar />
    </div>
  );
}
