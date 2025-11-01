type CallLLMOptions = {
  system?: string;
  prompt: string;
  json?: boolean;
};

type ChatCompletionChoice = {
  message: {
    role: "assistant";
    content: string;
  };
};

type ChatCompletionResponse = {
  choices: ChatCompletionChoice[];
};

const DEFAULT_SYSTEM_PROMPT = "You are a helpful assistant.";

function buildMockPayload(options: CallLLMOptions): string {
  if (options.json) {
    const mockJson = {
      status: "mock",
      system: options.system ?? null,
      prompt: options.prompt,
    };
    return JSON.stringify(mockJson);
  }

  return "Mock LLM response";
}

export async function callLLM(options: CallLLMOptions): Promise<string> {
  if (process.env.AI_MOCK === "1") {
    return buildMockPayload(options);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set.");
  }

  const apiBaseUrl = process.env.OPENAI_API_URL ?? "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const url = `${apiBaseUrl.replace(/\/$/, "")}/chat/completions`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: options.system ?? DEFAULT_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: options.prompt,
          },
        ],
        ...(options.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("callLLM: upstream error", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`LLM request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const content = data.choices.at(0)?.message.content;

    if (!content) {
      console.error("callLLM: missing content in response", data);
      throw new Error("LLM response did not include any content.");
    }

    return content.trim();
  } catch (error) {
    console.error("callLLM: unexpected error", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred while calling the LLM.");
  }
}
