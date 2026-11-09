# jeromebadour.com

The portfolio site of **Jerome Badour**, full-stack developer: websites, web apps, Windows desktop apps, AI features
and the servers behind them.

It is built like the products it shows: every claim on it carries its proof, and that proof is a live site, a public
release, a demo, the code or a real screen.

![Home: the role line, three numbers, the product board and everything I work with.](docs/home.png)

## What is on it

- **The apps, shown as they really are.** W3Arena is an online gaming and community platform I built end to end and
  run on my own: a website and forum, a Windows app, a shop, an admin console and a fleet of game servers. Each part
  has its own page with the need, what was built, the result and its real screens. Distill is a web app whose AI
  summaries trace every point back to its source.
- **What I work with.** 44+ languages, libraries and services in 8 groups. Every one of them links to the pages where
  it is used, so nothing on that list is a keyword without a project behind it.
- **Services and How I work.** What to hire me for, each offer next to the work that proves it, and how I deliver
  work, each promise with its proof.
- **Ask about my work.** A question in plain words gets an answer drawn only from this site's pages, each point with
  links to its proof. The answer can become a short brief and a message, and every message gets a status page:
  Received, Read, Replied.
- **Proposal pages.** A page made for one Upwork job: a short note and the three proofs that fit it. The conversation
  stays on Upwork.
- **Plain legal pages.** A privacy policy and terms of use that say what the site really keeps and for how long.

![W3Arena: the platform, its numbers and how its parts fit together.](docs/w3arena.png)

## Where it stands

Every page is built and connected: Ask answers from the site's pages, messages reach me with a status page for the
sender, proposal pages are made in the owner console, and the console shows visits, spend, brakes and socials. Next:
the server setup and launch.

## How it is built

- **Next.js, TypeScript and PostgreSQL** in Docker Compose behind Nginx. The site connects to its database as a role
  that owns nothing and can only do what its grants allow; every owner action lands in an append-only log.
- **Every address and outside link in one place** (`lib/links.ts`): a proof chip with no address fails the build.
- **Ask about my work** reads the site's own pages and answers with Claude Haiku 5.5. A proof the model invents is
  dropped, and so is a point left without one. Per-visitor limits and two spend caps stop it calmly before any cost.
- **No accounts for visitors.** A message's status link is a random token whose hash is all the database keeps. The
  visit counter reads the server's own log, which keeps no IP address, and nothing is kept longer than the Privacy
  Policy says.
- **Three screen sizes from the start:** phone, laptop and desktop, measured so nothing spills off the screen.
- **Brands only with their official marks** ([Simple Icons](https://simpleicons.org)), never redrawn by hand.
- **CI on every push:** the build, the types and the database suites, then the real container stack with every
  browser suite against it (a stand-in for the AI model and for email, so no test costs anything), the backup and its
  restore, and the encrypted off-box copy.

## Run it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3102. The connected parts need PostgreSQL (`DATABASE_URL`, migrations in `db/`); the
browser suites run with `scripts/test-e2e.sh` against a running site and the stand-in model in `tests/e2e/`.

## Work with me

[Hire me on Upwork](https://www.upwork.com/freelancers/~018fb626b478552f9f).

## Licence

Copyright (c) 2026 Jerome Badour. All rights reserved. The code is public to read, not to reuse (see `LICENSE`).
