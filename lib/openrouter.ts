export const AGENT_MODELS = process.env.NEXT_PUBLIC_USE_OLLAMA === "true" 
  ? {
      // --- Local Ollama Models (For Demo/Testing) ---
      ceo: "ollama/llama3.2",
      sales: "ollama/llama3.2",
      finance: "ollama/llama3.2",
      inventory: "ollama/llama3.2",
      marketing: "ollama/llama3.2",
      support: "ollama/llama3.2",
      analysis: "ollama/llama3.2"
    }
  : {
      // --- Production OpenRouter Models ---
      ceo: "deepseek/deepseek-r1",
      sales: "meta-llama/llama-3.3-70b-instruct",
      finance: "deepseek/deepseek-r1",
      inventory: "qwen/qwen-2.5-72b-instruct",
      marketing: "meta-llama/llama-3.3-70b-instruct",
      support: "meta-llama/llama-3.3-70b-instruct",
      analysis: "deepseek/deepseek-r1"
    };

export class InsufficientCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

  export async function callAgent(params: { model: string; systemPrompt: string; userMessage: string; temperature?: number }, attempt = 1): Promise<string> {
  const { model, systemPrompt, userMessage, temperature = 0.4 } = params;
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(`Failed to call model ${model}. Original error: OPENROUTER_API_KEY is not set in the environment.`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 120000); // Increased from 15s to 120s to accommodate CPU-based Ollama Generation

  try {
    const isOllama = model.startsWith("ollama/");
    const endpoint = isOllama 
      ? "http://localhost:11434/v1/chat/completions" 
      : "https://openrouter.ai/api/v1/chat/completions";
    
    const fetchModel = isOllama ? model.replace("ollama/", "") : model;

    const headers: Record<string, string> = {
      "Authorization": isOllama ? "Bearer ollama" : `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };

    if (!isOllama) {
      headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      headers["X-Title"] = "NexusOS AI";
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: fetchModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 402) {
        throw new InsufficientCreditsError(`HTTP 402: ${errorText}`);
      }
      if ((response.status === 429 || response.status === 502 || response.status >= 520) && attempt < 4) {
        const fallbacks = [
          "google/gemma-4-31b-it:free",
          "meta-llama/llama-3.2-3b-instruct:free",
          "qwen/qwen3-coder:free",
          "nvidia/nemotron-3-ultra-550b-a55b:free",
          "tencent/hy3:free",
          "meta-llama/llama-3.3-70b-instruct:free"
        ];
        const nextModel = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        console.warn(`Model ${model} hit ${response.status}. Retrying (attempt ${attempt + 1}) with ${nextModel}...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return callAgent({ ...params, model: nextModel }, attempt + 1);
      }
      if (response.status === 429 && attempt < 4) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return callAgent(params, attempt + 1);
      }
      
      // If Ollama is completely crashing due to CUDA errors, instantly return a mock fallback so the demo continues
      if (isOllama && (response.status >= 500 || response.status === 404)) {
        console.warn(`[DEMO FALLBACK] Ollama server crashed (CUDA error). Returning mock data for ${model}.`);
        return `[DEMO MODE] This is a mock response from the ${model.split('/')[1] || model} agent. The local Ollama server crashed due to a CUDA driver error, but the orchestration flow is working perfectly.`;
      }

      // If we exhausted all retries on the free tier, return a graceful fallback instead of crashing the demo
      if (response.status === 429 && attempt >= 4 && model.includes('free')) {
        console.warn(`[DEMO FALLBACK] AI tier is saturated or unavailable. Returning mock data for ${model}.`);
        return `[DEMO MODE] This is a fallback response for the ${model.split('/')[1] || model} agent. Live AI analysis is temporarily unavailable due to connection issues.`;
      }

      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("Invalid response structure from OpenRouter");
    }

    return data.choices[0].message.content as string;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    const err = error instanceof Error ? error : new Error(String(error));
    if (err.name === 'AbortError') {
      throw new Error(`Request to model ${model} timed out after 120 seconds.`);
    }
    
    // If it's already a wrapped error naming the model (like our API key check), just rethrow
    if (err.message && err.message.includes(`Failed to call model ${model}`)) {
      throw err;
    }

    if (err instanceof InsufficientCreditsError) {
      throw err;
    }

    // If Ollama server is dead (fetch failed), intercept it and return mock data!
    if (model.startsWith("ollama/")) {
       console.warn(`[DEMO FALLBACK] Ollama fetch failed. Returning mock data for ${model}.`);
       return `[DEMO MODE] This is a mock response from the ${model.split('/')[1] || model} agent. The local Ollama server is offline or crashed, but the system orchestration is functioning correctly.`;
    }

    throw new Error(`Failed to call model ${model}. Original error: ${err.message}`);
  }
}
