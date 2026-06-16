import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { db } from '@/db/db.config';

const SYSTEM_PROMPT = `
You are an expert AI SQL Database Agent.

Your workflow MUST follow these steps in order:
1. Identify what data the user is asking for.
2. IMMEDIATELY call \`getDatabaseSchema\` to understand the exact tables and columns. Never skip this.
3. After receiving the schema, write a SQLite SELECT query using ONLY the real table/column names from the schema.
4. Call \`queryDatabase\` with your query.
5. After receiving the results, write a clear, insightful explanation for the user summarizing what the data shows.

STRICT Rules:
- NEVER guess table or column names. Always call getDatabaseSchema first.
- Do NOT call both tools at the same time. Schema first, then query.
- Do NOT write any text between tool calls — only write your final response after getting query results.
- Only SELECT queries are allowed. Never mutate data.
- If a query fails, analyze the error, fix the SQL, and retry.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    let step = 0;

    const result = streamText({
      model: google('gemini-2.5-flash'),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      stopWhen: stepCountIs(10),
      tools: {
        getDatabaseSchema: tool({
          description: 'Fetch the real database schema: table names and their SQL definitions.',
          inputSchema: z.object({
            reason: z.string().optional().describe('Why you need the schema'),
          }),
          execute: async () => {
            console.log(`\n📊 STEP ${++step}: DYNAMIC SCHEMA FETCH`);
            try {
              const res = await db.execute(`
                SELECT name, sql 
                FROM sqlite_master 
                WHERE type='table' 
                  AND name NOT LIKE 'sqlite_%' 
                  AND name NOT LIKE '__drizzle%'
              `);

              const schema = res.rows.map((row: Record<string, unknown>) => ({
                tableName: row.name,
                definition: row.sql,
              }));

              console.log(`✅ SCHEMA FETCHED — ${schema.length} tables found`);
              return { success: true, schema };
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Unknown schema error';
              console.error('🔥 SCHEMA ERROR:', message);
              return { success: false, error: message };
            }
          },
        }),

        queryDatabase: tool({
          description: 'Execute a read-only SQL SELECT query against the database.',
          inputSchema: z.object({
            query: z.string().describe('A valid SQLite SELECT statement.'),
          }),
          execute: async ({ query }) => {
            console.log(`\n🧾 STEP ${++step}: EXECUTE QUERY`);
            console.log('🧾 SQL:', query);

            if (!query.trim().toLowerCase().startsWith('select')) {
              return { success: false, error: 'Only SELECT queries are permitted.' };
            }

            try {
              const res = await db.execute(query);
              console.log(`✅ QUERY SUCCESS — ${res.rows.length} rows returned`);
              return {
                success: true,
                count: res.rows.length,
                rows: res.rows,
              };
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Unknown query error';
              console.error('🔥 QUERY ERROR:', message);
              return { success: false, error: `SQL Error: ${message}` };
            }
          },
        }),
      },

      onFinish: () => {
        console.log(`\n✅ STEP ${++step}: RESPONSE COMPLETE`);
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown API error';
    console.error('🔥 API ERROR:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
