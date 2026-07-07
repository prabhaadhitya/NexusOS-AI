import { NextResponse } from 'next/server';
import { z } from 'zod';
import { orchestrate } from '@/lib/agents/ceo';

export const maxDuration = 60;

const BodySchema = z.object({
  businessId: z.string().min(1, "businessId is required"),
  query: z.string().min(1, "query is required"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const { businessId, query } = parsed.data;

    const url = new URL(req.url);
    const streamMode = url.searchParams.get('stream') === 'true' || req.headers.get('accept') === 'text/event-stream';

    if (streamMode) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            await orchestrate(businessId, query, (event) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            });
          } catch (err: unknown) {
            console.error("SSE Orchestration Error:", err);
            const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          } finally {
            controller.close();
          }
        }
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    }

    const result = await orchestrate(businessId, query);
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error("Orchestration API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
