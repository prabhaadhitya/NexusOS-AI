import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listFreeModels() {
  const response = await fetch("https://openrouter.ai/api/v1/models");
  const data = await response.json();
  const freeModels = data.data.filter((m: any) => m.id.endsWith(':free')).map((m: any) => m.id);
  console.log("Found Free Models:", freeModels);
}

listFreeModels();
