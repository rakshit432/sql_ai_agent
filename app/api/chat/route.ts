import {
  streamText,
  tool,
  convertToModelMessages,
  stepCountIs
} from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { db } from '@/db/db.config';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    console.log('\n==============================');
    console.log('🚀 NEW REQUEST');
    console.log('==============================');

    const body = await req.json();
    const messages = body.messages;

    console.log('📩 USER:', JSON.stringify(messages, null, 2));

    let lastRows: Record<string, unknown>[] = [];
    let step = 0;

    // 🔥 PHASE 1: TOOL EXECUTION
    const result = streamText({
      model: google('gemini-2.5-flash'),

      messages: await convertToModelMessages(messages),

      system: `You are an AI SQL agent.

Your ONLY job:
1. Call getDatabaseSchema
2. Generate SQL
3. Call queryDatabase

DO NOT explain results.
`,
      stopWhen: stepCountIs(5),

      tools: {
        // 🔍 SCHEMA TOOL
        getDatabaseSchema: tool({
          description: 'Get DB schema',
          inputSchema: z.object({}),
          execute: async ({}) => {
            console.log(`\n📊 STEP ${++step}: SCHEMA`);

            const schemaResult = await db.execute(`
              SELECT name, sql FROM sqlite_master 
              WHERE type='table' AND name NOT LIKE 'sqlite_%';
            `);

            console.log('📊 SCHEMA FETCHED');

            return {
              schema: schemaResult.rows,
            };
          },
        }),

        // ⚡ QUERY TOOL
        queryDatabase: tool({
          description: 'Execute SELECT query',
          inputSchema: z.object({
            query: z.string(),
          }),
          execute: async ({ query }: { query: string }) => {
            console.log(`\n🧾 STEP ${++step}: QUERY`);
            console.log('🧾 SQL:', query);

            if (!query.trim().toUpperCase().startsWith('SELECT')) {
              console.log('❌ BLOCKED NON-SELECT');

              return {
                success: false,
                error: 'Only SELECT queries allowed',
              };
            }

            const res = await db.execute(query);

            console.log('✅ QUERY SUCCESS');
            console.log('📦 ROW COUNT:', res.rows.length);

            return {
              success: true,
              rows: res.rows,
            };
          },
        }),
      },

      // 🔥 CAPTURE TOOL OUTPUT RELIABLY
      onStepFinish: (event) => {
        if (event.toolResults) {
          for (const toolResult of event.toolResults) {
            if (toolResult.toolName === 'queryDatabase') {
              console.log('🔥 TOOL RESULT CAPTURED');

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const result = (toolResult as any).result || (toolResult as any).output;

              if (result?.rows) {
                lastRows = result.rows;
                console.log('📦 CAPTURED ROWS:', lastRows.length);
              }
            }
          }
        }
      },
    });

    // 🔥 WAIT FOR TOOL EXECUTION TO COMPLETE
    await result.text;

    console.log('\n📦 FINAL DATA:', lastRows);

    // 🚨 SAFETY CHECK
    if (!lastRows || lastRows.length === 0) {
      console.log('⚠️ NO DATA FOUND');

      return streamText({
        model: google('gemini-2.5-flash'),
        messages: [
          {
            role: 'user',
            content: `The query returned no results. Inform the user clearly.`,
          },
        ],
      }).toUIMessageStreamResponse();
    }

    // 🔥 PHASE 2: LLM EXPLANATION
    console.log('\n🧠 GENERATING FINAL RESPONSE...\n');

    const explanation = streamText({
      model: google('gemini-2.5-flash'),

      messages: [
        {
          role: 'user',
          content: `
User question:
${messages[messages.length - 1].content}

Database result:
${JSON.stringify(lastRows, null, 2)}

Explain this clearly and concisely to the user.
`,
        },
      ],
    });

    return explanation.toUIMessageStreamResponse();

  } catch (error: unknown) {
    console.error('🔥 API ERROR:', error);

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500 }
    );
  }
}