import { LegalDoc, type LegalSection } from "./LegalDoc";
import { APPS } from "@/lib/apps";

const RETENTION = "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention";
const mail = <a href="mailto:privacy@jeromebadour.com">privacy@jeromebadour.com</a>;

const sections: LegalSection[] = [
  {
    id: "scope",
    title: "Scope",
    clauses: [
      <>This policy covers jeromebadour.com: its pages, <b>Ask</b>, the message form and its status links, and the
        proposal pages under /for/.</>,
      <>The site is run by <b>Jerome Badour, an individual</b>, who decides what is collected and why. Contact: {mail}.</>,
      <>Apps shown on this site, such as {APPS.map((a, i) => (
        <span key={a.id}>{i > 0 && (i === APPS.length - 1 ? " and " : ", ")}<a href={a.privacy}>{a.name}</a></span>
      ))}, run on their own sites and have their own privacy policies. This policy does not cover them.</>,
      <>It sits alongside the <a href="/terms">Terms of Use</a>. Where this policy describes your data and the terms
        describe the use of the site, both apply.</>,
    ],
  },
  {
    id: "keep",
    title: "What I keep",
    clauses: [
      <><b>Questions on Ask:</b> the question you type and the answer it gets.</>,
      <><b>Messages:</b> your name, your email address, what you need, and the options you picked (what it is built
        with, how soon).</>,
      <><b>Status links:</b> a long random link tied to your message, and the message's status (received, read,
        replied) with its times.</>,
      <><b>Limits:</b> an anonymous cookie and your IP address, used only to count how many questions and messages
        are sent.</>,
      <><b>Visits:</b> the web server's own log: the page asked for, the time and the site you came from. Your IP
        address is not kept in it.</>,
      <>There are <b>no accounts</b> on this site, so no passwords and no profiles.</>,
    ],
  },
  {
    id: "ask",
    title: "What you type into Ask",
    clauses: [
      <>To write an answer, your question is sent to <b>Anthropic&apos;s Claude API</b>, which processes it for this
        site. How long Anthropic keeps API inputs and outputs is set out in its own{" "}
        <a href={RETENTION}>data retention policy for the API</a>.</>,
      <>Answers are written only from this site&apos;s own pages. Ask does not look anything up about you.</>,
      <>Do not type anything private or confidential into Ask, such as another person&apos;s details or documents you
        have no right to share.</>,
    ],
  },
  {
    id: "why",
    title: "Why I keep it",
    clauses: [
      <>To answer your question, read your message, reply to it, and show you its status.</>,
      <>To stop abuse: the limits keep Ask and the message form from being flooded.</>,
      <>To see which pages are read and where visitors come from, counted from the server&apos;s log.</>,
    ],
  },
  {
    id: "who",
    title: "Who else sees it",
    clauses: [
      <><b>Anthropic</b> sees questions typed into Ask, to write the answers.</>,
      <><b>Resend</b> sends the emails about your message, so it sees your email address and what those emails say.</>,
      <>No one else. Nothing is sold or passed on. There are <b>no ads, no analytics company and no tracking</b> on
        this site.</>,
    ],
  },
  {
    id: "where",
    title: "Where it is held",
    clauses: [
      <>On my own server, in the site&apos;s database and the web server&apos;s log.</>,
      <>Questions also pass through Anthropic, and message emails through Resend, as described above.</>,
    ],
  },
  {
    id: "long",
    title: "How long it is kept",
    clauses: [
      <><b>Questions on Ask:</b> 30 days, then deleted.</>,
      <><b>Messages:</b> 12 months, then deleted.</>,
      <><b>Status links:</b> open for 90 days, then they show that the message is closed.</>,
      <><b>Limits:</b> a day at most.</>,
      <><b>Visits:</b> 30 days, then deleted.</>,
    ],
  },
  {
    id: "rights",
    title: "Copy and deletion",
    clauses: [
      <>You can ask for a copy of anything you sent, or for it to be deleted, at any time by writing to {mail}.</>,
      <>Every request is answered within 30 days.</>,
    ],
  },
  {
    id: "cookies",
    title: "Cookies and storage",
    clauses: [
      <>One cookie, used only for the limits above. It carries no name and does not follow you to other sites.</>,
      <>No tracking cookies and no advertising cookies.</>,
      <>If you pick light or dark with the theme switch, that choice is kept in your own browser. It is never sent to
        this site; clearing your browser&apos;s site data removes it.</>,
    ],
  },
  {
    id: "changes",
    title: "Changes and contact",
    clauses: [
      <>When this policy changes, the date at the top changes with it.</>,
      <>Questions about this policy: {mail}.</>,
    ],
  },
];

export function PrivacyPage() {
  return <LegalDoc title="Privacy Policy" sections={sections} />;
}
