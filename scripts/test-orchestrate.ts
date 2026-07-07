import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function test() {
  // THEN import orchestrate dynamically
  const { orchestrate } = await import('../lib/agents/ceo.js');
  const bId = "11111111-1111-1111-1111-111111111111";
  
  console.log("\n--- TEST 1: Conversational ---");
  console.log("Testing orchestrate for business:", bId);
  const res1 = await orchestrate(bId, "hi");
  console.log("Response 1:", res1.finalResponse);
  console.log("Agents Invoked:", res1.agentsInvoked);

  console.log("\n--- TEST 2: Conversational ---");
  const res2 = await orchestrate(bId, "thanks");
  console.log("Response 2:", res2.finalResponse);
  console.log("Agents Invoked:", res2.agentsInvoked);

  console.log("\n--- TEST 3: Business Query ---");
  const res3 = await orchestrate(bId, "Why did our revenue drop this month?");
  console.log("Response 3:", res3.finalResponse.substring(0, 100) + '...');
  console.log("Agents Invoked:", res3.agentsInvoked);
}

test();
