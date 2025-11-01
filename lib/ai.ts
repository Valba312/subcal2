type CallLLMParams = {
  system?: string;
  prompt: string;
  json?: boolean;
};

export async function callLLM({ system, prompt, json }: CallLLMParams): Promise<string> {
  if (system) {
    console.debug("callLLM system prompt:", system);
  }
  if (process.env.AI_MOCK === "1") {
    return JSON.stringify({
      category: "Productivity",
      tags: ["automation", "student"],
    });
  }

  console.error("callLLM: LLM provider not configured", { prompt, json });
  throw new Error("LLM provider not configured");
}
