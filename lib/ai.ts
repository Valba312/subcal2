type CallLLMParams = {
  system?: string;
  prompt: string;
  json?: boolean;
  mock?: unknown;
};

const getApiKey = () => process.env.OPENAI_API_KEY;
const getModel = () => process.env.OPENAI_MODEL || "gpt-4o-mini";
const getBaseUrl = () => process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

export async function callLLM({ system, prompt, json, mock }: CallLLMParams): Promise<string> {
  if (system) {
    console.debug("callLLM system prompt:", system);
  }

  const apiKey = getApiKey();
  const model = getModel();

  if (process.env.AI_MOCK === "1" || !apiKey) {
    if (!apiKey) {
      console.warn("callLLM: OPENAI_API_KEY is missing, falling back to mock response");
    }
    return JSON.stringify(
      mock ?? {
        category: "Productivity",
        tags: ["automation", "student"],
      }
    );
  }

  try {
    const messages = [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: prompt },
    ];

    const response = await fetch(`${getBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        response_format: json ? { type: "json_object" } : undefined,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      console.error("callLLM: provider error", { status: response.status, body: errorPayload });
      throw new Error(`LLM provider responded with ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("LLM provider did not return a message");
    }

    return content;
  } catch (error) {
    console.error("callLLM: request failed", error);
    if (mock) {
      console.warn("callLLM: falling back to mock due to provider error");
      return typeof mock === "string" ? mock : JSON.stringify(mock);
    }
    throw error instanceof Error ? error : new Error("LLM request failed");
  }
}
