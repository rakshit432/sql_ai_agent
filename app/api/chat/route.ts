import {
  streamText,
  tool,
  convertToModelMessages,
} from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { db } from '@/db/db.config';

// 🧠 SYSTEM PROMPT
const SYSTEM_PROMPT = `
You are an AI SQL agent.

You MUST follow this reasoning loop:

1. Analyze user query
2. Call getDatabaseSchema
3. Generate SQL query
4. Call queryDatabase
5. AFTER receiving results:
   - Analyze them
   - Explain clearly to the user

STRICT:
- Tool output is NOT final answer
- ALWAYS generate final explanation
- NEVER stop after tool execution
`;

export async function POST(req: Request) {
  try {
    console.log('\n==============================');
    console.log('🚀 NEW REQUEST');
    console.log('==============================');

    const body = await req.json();
    console.log('📩 USER:', JSON.stringify(body.messages, null, 2));

    let step = 1;
    let lastRows: any[] = [];

    const result = streamText({
      model: google('gemini-2.5-flash'),
      messages: await convertToModelMessages(body.messages),
      system: SYSTEM_PROMPT,
      maxSteps: 8,

      tools: {
        // 🔍 SCHEMA TOOL
        getDatabaseSchema: tool({
          description: 'Get DB schema',
          parameters: z.object({}),
          execute: async () => {
            console.log(`\n📊 STEP ${++step}: SCHEMA`);

            return {
              tables: [
                {
                  name: 'products',
                  columns: [
                    'id',
                    'name',
                    'category',
                    'price',
                    'stock',
                    'created_at',
                  ],
                },
                {
                  name: 'sales',
                  columns: [
                    'id',
                    'product_id',
                    'quantity',
                    'total_amount',
                    'sale_date',
                    'customer_name',
                    'region',
                  ],
                  relationships: ['product_id → products.id'],
                },
              ],
            };
          },
        }),

        // ⚡ QUERY TOOL
        queryDatabase: tool({
          description: 'Execute SQL query',
          parameters: z.object({
            query: z.string(),
          }),

          execute: async ({ query }) => {
            console.log(`\n🧾 STEP ${++step}: QUERY`);
            console.log('🧾 SQL:', query);

            try {
              if (!query.toLowerCase().startsWith('select')) {
                return {
                  success: false,
                  error: 'Only SELECT allowed',
                };
              }

              const res = await db.execute(query);

              lastRows = res.rows; // 🔥 STORE FOR SECOND PASS

              console.log('✅ QUERY SUCCESS');
              console.log('📦 ROWS:', JSON.stringify(res.rows, null, 2));

              return {
                success: true,
                rows: res.rows,
                count: res.rows.length,
              };
            } catch (err: any) {
              return {
                success: false,
                error: err.message,
              };
            }
          },
        }),
      },

      onFinish: (event) => {
        console.log(`\n🧠 STEP ${++step}: FINAL RESPONSE`);

        if (!event.text || event.text.trim() === '') {
          console.log('⚠️ NO FINAL RESPONSE FROM LLM');
        } else {
          console.log('✅ FINAL RESPONSE:');
          console.log(event.text);
        }

        console.log('==============================\n');
      },
    });

    // 🔥 CHECK IF LLM FAILED TO RESPOND
    const text = await result.text;

    if (!text || text.trim() === '') {
      console.log('🔁 SECOND PASS TRIGGERED');

      // 👉 SECOND PASS (LLM EXPLAINS RESULT)
      const explanation = streamText({
        model: google('gemini-2.5-flash'),
        messages: [
          {
            role: 'user',
            content: `
The SQL query has already been executed.

Here is the result:
${JSON.stringify(lastRows, null, 2)}

Now explain this result clearly in natural language.
            `,
          },
        ],
      });

      return explanation.toUIMessageStreamResponse();
    }

    return result.toUIMessageStreamResponse();

  } catch (error: any) {
    console.error('🔥 API ERROR:', error.message);

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}