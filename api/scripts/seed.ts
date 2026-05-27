import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(here, '..', 'db', 'schema.sql'), 'utf8');
const seed = readFileSync(join(here, '..', 'db', 'seed.sql'), 'utf8');

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/deskline';

const client = new pg.Client({ connectionString });

async function main() {
  await client.connect();
  await client.query('drop table if exists comments, tickets, users cascade');
  await client.query(schema);
  await client.query(seed);
  const { rows } = await client.query(
    `select
       (select count(*) from users) as users,
       (select count(*) from tickets) as tickets,
       (select count(*) from comments) as comments`
  );
  console.log(
    `Seeded ${rows[0].users} users, ${rows[0].tickets} tickets, ${rows[0].comments} comments.`
  );
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
