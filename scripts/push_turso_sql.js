#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('TURSO_DATABASE_URL or TURSO_AUTH_TOKEN not set in environment');
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  const sqlPath = path.join(__dirname, '..', 'db', 'drizzle', '0000_blue_the_order.sql');
  const content = fs.readFileSync(sqlPath, 'utf8');

  // split on the drizzle-generated statement-breakpoint markers
  const statements = content.split('--> statement-breakpoint').map(s => s.trim()).filter(Boolean);

  for (const stmt of statements) {
    try {
      console.log('Executing statement...');
      await client.execute(stmt);
      console.log('OK');
    } catch (err) {
      console.error('Failed to execute statement:', err);
      process.exit(1);
    }
  }

  console.log('All statements executed.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
