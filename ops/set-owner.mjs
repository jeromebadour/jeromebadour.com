// Sets the one owner account: creates it, or changes its email and password. Run on the box inside the app image,
// connected as the database owner (site_app can't touch owner_account):
//   docker compose run --rm -T -e OWNER_EMAIL=... -e OWNER_DATABASE_URL=... app node ops/set-owner.mjs < password-file
// The password is read from standard input, never from the command line or the environment.
import { hash } from "@node-rs/argon2";
import pg from "pg";

const email = (process.env.OWNER_EMAIL ?? "").trim().toLowerCase();
const url = process.env.OWNER_DATABASE_URL;
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("OWNER_EMAIL is not an email address");
if (!url) throw new Error("OWNER_DATABASE_URL is not set");

let input = "";
for await (const chunk of process.stdin) input += chunk;
const password = input.replace(/\r?\n$/, "");
if (password.length < 12) throw new Error("The password must be at least 12 characters");

const passwordHash = await hash(password, { algorithm: 2, memoryCost: 19_456, timeCost: 2, parallelism: 1 });
const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query("begin");
  const { rowCount } = await client.query("update owner_account set email = $1, password_hash = $2", [email, passwordHash]);
  if (rowCount === 0) await client.query("insert into owner_account (email, password_hash) values ($1, $2)", [email, passwordHash]);
  // A new password ends every session.
  await client.query("delete from owner_sessions");
  await client.query("insert into audit_log (action, target) values ('owner.set', $1)", [email]);
  await client.query("commit");
  console.log(rowCount === 0 ? `owner created: ${email}` : `owner updated: ${email} (every session ended)`);
} finally {
  await client.end();
}
