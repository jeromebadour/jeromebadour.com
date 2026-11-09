"use client";
import { useEffect, useState, type ReactNode } from "react";
import { EFooter, EHeader, ETabbar } from "./Shell";
import { LEGAL_UPDATED } from "@/lib/legal";

export type LegalSection = { id: string; title: string; clauses: ReactNode[] };

export function LegalDoc({ title, sections }: { title: string; sections: LegalSection[] }) {
  const [on, setOn] = useState(sections[0].id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const pick = () => {
      let cur = sections[0].id;
      for (const el of els) if (el.getBoundingClientRect().top < 140) cur = el.id;
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) cur = els[els.length - 1].id;
      setOn(cur);
    };
    pick();
    window.addEventListener("scroll", pick, { passive: true });
    return () => window.removeEventListener("scroll", pick);
  }, []);

  return (
    <div className="page" data-v="e">
      <EHeader on="none" />

      <div className="pv-wrap">
        <article className="pv-doc">
          <h1>{title}</h1>
          <p className="pv-date">Last updated {LEGAL_UPDATED}</p>

          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="pv-sec">
              <h2><span className="pv-n">{i + 1}.</span>{s.title}</h2>
              {s.clauses.map((c, j) => (
                <div key={j} className="pv-cl">
                  <span className="pv-cn">{i + 1}.{j + 1}</span>
                  <p>{c}</p>
                </div>
              ))}
            </section>
          ))}
        </article>

        <nav className="pv-toc" aria-label="On this page">
          <div className="pv-toc-h">On this page</div>
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className={on === s.id ? "on" : undefined}>
              <span>{i + 1}</span>{s.title}
            </a>
          ))}
        </nav>
      </div>

      <EFooter />
      <ETabbar on="none" />
    </div>
  );
}
