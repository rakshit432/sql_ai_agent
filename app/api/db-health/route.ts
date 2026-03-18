import { db } from '../../../db/db.config';

export async function GET() {
  // Simple connectivity check for Turso/libsql.
  // If the DB is reachable and credentials are correct, this returns { ok: true }.
  await db.execute('select 1 as ok');

  return Response.json({ ok: true });
}

