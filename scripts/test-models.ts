import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testModel(model: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "ping" }]
    })
  });
  const data = await response.text();
  console.log(model, response.status, data.slice(0, 100));
}

async function run() {
  await testModel("google/gemini-2.0-flash-exp:free");
  await testModel("google/gemini-2.0-pro-exp-02-05:free");
  await testModel("qwen/qwen-2.5-72b-instruct:free");
  await testModel("cognitivecomputations/dolphin3.0-r1-mistral-24b:free");
}

run();
