import { db } from '@/db/db.config';

export async function GET() {
  try {
    const res = await db.execute(`
      SELECT name, sql
      FROM sqlite_master
      WHERE type='table'
        AND name NOT LIKE 'sqlite_%'
        AND name NOT LIKE '__drizzle%'
      ORDER BY name
    `);

    const tables = res.rows.map((row: Record<string, unknown>) => ({
      name: row.name as string,
      definition: row.sql as string,
    }));

    return Response.json({ ok: true, tables });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch schema';
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
