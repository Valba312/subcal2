type CallLLMParams = {
  system?: string;
  prompt: string;
  json?: boolean;
  mock?: unknown;
};

export async function callLLM({ system, prompt, json, mock }: CallLLMParams): Promise<string> {
  if (system) {
    console.debug("callLLM system prompt:", system);
  }
  if (process.env.AI_MOCK === "1") {
    return JSON.stringify(
      mock ?? {
        category: "Productivity",
        tags: ["automation", "student"],
      }
    );
  }

  if (mock) {
    console.warn("callLLM: using mock fallback because provider is not configured");
    return typeof mock === "string" ? mock : JSON.stringify(mock);
  }

  console.error("callLLM: LLM provider not configured", { prompt, json });
  throw new Error("LLM provider not configured");
}
