import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkEnvVars() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENROUTER_API_KEY'
  ];
  let allSet = true;
  for (const req of required) {
    if (!process.env[req] || process.env[req] === 'your-openrouter-key-here' || process.env[req]?.includes('placeholder')) {
      console.log(`❌ Missing or invalid environment variable: ${req}`);
      allSet = false;
    } else {
      console.log(`✅ Environment variable set: ${req}`);
    }
  }
  return allSet;
}

async function checkOpenRouter() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1",
        messages: [{ role: "user", content: "Ping! Please reply with exactly one word: Pong" }],
        max_tokens: 10
      })
    });

    if (response.ok) {
      console.log(`✅ OpenRouter API call successful`);
      return true;
    } else {
      console.log(`❌ OpenRouter API call failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ OpenRouter API call threw an error:`, error);
    return false;
  }
}

async function checkSupabase() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.from('businesses').select('id').limit(1);

    if (error) {
      console.log(`❌ Supabase query failed:`, error.message);
      return false;
    }

    if (data && data.length > 0) {
      console.log(`✅ Supabase connection successful, found seed data (businesses count > 0)`);
      return true;
    } else {
      console.log(`❌ Supabase connected, but no seed data found in businesses table`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Supabase check threw an error:`, error);
    return false;
  }
}

async function runPreflight() {
  console.log("=== PREFLIGHT CHECK START ===\n");
  const envOk = await checkEnvVars();
  if (!envOk) {
    console.log("\n❌ Preflight failed: Missing environment variables. Please check your .env.local file.");
    process.exit(1);
  }

  console.log("");
  const orOk = await checkOpenRouter();
  const sbOk = await checkSupabase();

  console.log("\n=== PREFLIGHT CHECK COMPLETE ===");
  if (orOk && sbOk) {
    console.log("🚀 All systems ready! The demo is safe to run.");
  } else {
    console.log("⚠️ Some checks failed. Please resolve the issues above before the demo.");
  }
}

runPreflight();
