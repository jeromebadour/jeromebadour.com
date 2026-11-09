import { LegalDoc, type LegalSection } from "./LegalDoc";
import { appNames } from "@/lib/apps";

const mail = <a href="mailto:jerome@jeromebadour.com">jerome@jeromebadour.com</a>;

const sections: LegalSection[] = [
  {
    id: "scope",
    title: "Scope",
    clauses: [
      <>These terms cover your use of jeromebadour.com: its pages, <b>Ask</b>, the message form and its status links,
        and the proposal pages under /for/.</>,
      <>The site is run by <b>Jerome Badour, an individual</b>. Contact: {mail}.</>,
      <>They sit alongside the <a href="/privacy">Privacy Policy</a>. Where these terms describe the use of the site
        and the policy describes your data, both apply. Using the site means you accept both.</>,
    ],
  },
  {
    id: "site",
    title: "What this site is",
    clauses: [
      <>A portfolio and a way to get in touch. It shows work I have built and the kinds of work I take on.</>,
      <>Nothing on the site is an offer with a price, a quote or a contract. <b>Prices are never set here.</b></>,
    ],
  },
  {
    id: "ask",
    title: "Answers from Ask",
    clauses: [
      <>Ask&apos;s answers are <b>written by an AI model</b> from this site&apos;s own pages. They can be incomplete
        or wrong.</>,
      <>An answer is not a quote, a promise or a commitment to do any work. Where an answer and the page it cites
        differ, the page is what counts.</>,
      <>Ask only answers questions about my work. Other questions are refused.</>,
      <>Each visitor can ask <b>10 questions an hour and 30 a day</b>. Ask can be paused at any time.</>,
    ],
  },
  {
    id: "messages",
    title: "Messages",
    clauses: [
      <>Sending a message starts a conversation. It does not create a contract or oblige either of us to anything.</>,
      <>Do not send anything you are not allowed to share, such as another person&apos;s private data or confidential
        documents.</>,
      <>Messages sent automatically, in bulk or to advertise something are not answered and may be deleted.</>,
    ],
  },
  {
    id: "hiring",
    title: "Hiring me",
    clauses: [
      <>Any work is agreed in writing before it starts: what will be built, by when, and for how much.</>,
      <>When the work is agreed on <b>Upwork</b>, the contract is made there and Upwork&apos;s own terms apply to it.</>,
      <>A proposal page under /for/ is made for one Upwork job. The conversation about that job stays on Upwork.</>,
    ],
  },
  {
    id: "use",
    title: "Fair use",
    clauses: [
      <>Do not flood the site, copy it in bulk with automated tools, try to get around its limits, or try to break
        into it or slow it down.</>,
      <>Access that breaks these terms may be limited or blocked.</>,
    ],
  },
  {
    id: "ownership",
    title: "Content and ownership",
    clauses: [
      <>The site&apos;s text, design and code belong to Jerome Badour. <b>All rights reserved.</b> The code is public
        to read, not to reuse.</>,
      <>{appNames()}, their names, logos and screens, are shown as examples of my own work.</>,
      <>Other names and logos on the site, such as Upwork, GitHub and Discord or the tools in &quot;Built with&quot;,
        belong to their owners.</>,
      <>Linking to any page on the site is welcome.</>,
    ],
  },
  {
    id: "links",
    title: "Other sites",
    clauses: [
      <>The site links to other sites, such as w3arena.pro, Distill, GitHub and Upwork. Their own terms apply there.</>,
    ],
  },
  {
    id: "liability",
    title: "No guarantee",
    clauses: [
      <>The site is provided as it is. It may change, or be offline for a while, without notice.</>,
      <>Numbers on the site are true on the date their page was last changed and can move after it.</>,
      <>As far as the law allows, I am not liable for decisions made only on what the site or Ask says.</>,
    ],
  },
  {
    id: "changes",
    title: "Changes and contact",
    clauses: [
      <>When these terms change, the date at the top changes with it.</>,
      <>Questions about these terms: {mail}.</>,
    ],
  },
];

export function TermsPage() {
  return <LegalDoc title="Terms of Use" sections={sections} />;
}
