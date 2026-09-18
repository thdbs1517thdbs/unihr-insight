const GEMINI_GENERATE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

export type GeminiCallResult =
  | { ok: true; text: string }
  | { ok: false; code: "auth" | "quota" | "unavailable" | "parse"; message: string };

function sanitizeUserMessage(message: string, apiKey: string) {
  const trimmed = message.replace(/\s+/g, " ").trim();
  if (!apiKey) {
    return trimmed;
  }
  return trimmed.split(apiKey).join("[redacted]");
}

function readGeminiText(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || !candidates[0] || typeof candidates[0] !== "object") {
    return null;
  }
  const content = (candidates[0] as { content?: { parts?: unknown } }).content;
  const parts = content?.parts;
  if (!Array.isArray(parts)) {
    return null;
  }
  const text = parts
    .map((part) => {
      if (!part || typeof part !== "object") {
        return "";
      }
      const value = (part as { text?: unknown }).text;
      return typeof value === "string" ? value : "";
    })
    .join("")
    .trim();
  return text || null;
}

const SERVICE_BUSY_MESSAGE =
  "현재 생성형 AI 서비스가 혼잡합니다. 잠시 후 다시 시도해주세요.";
const MAX_GENERATE_ATTEMPTS = 3;
const RETRY_WAIT_MS = [2000, 4000] as const;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function mapHttpStatus(status: number) {
  if (status === 401 || status === 403) {
    return {
      code: "auth" as const,
      message:
        "Gemini API 인증에 실패했습니다. 서버 전용 키 설정을 확인한 뒤 다시 시도해 주세요.",
    };
  }
  if (status === 429) {
    return {
      code: "quota" as const,
      message:
        "Gemini 무료 API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
  if (status === 503) {
    return {
      code: "unavailable" as const,
      message: SERVICE_BUSY_MESSAGE,
    };
  }
  return {
    code: "unavailable" as const,
    message: "Gemini API에서 보고서 초안을 생성하지 못했습니다. 집계 데이터는 변경되지 않았습니다.",
  };
}

export async function generateGeminiReportText(input: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<GeminiCallResult> {
  const url = `${GEMINI_GENERATE_URL}/${encodeURIComponent(input.model)}:generateContent`;
  const requestInit: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": input.apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: input.systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: input.userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
      },
    }),
  };

  for (let attempt = 1; attempt <= MAX_GENERATE_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, requestInit);

      if (response.status === 503 && attempt < MAX_GENERATE_ATTEMPTS) {
        await sleep(RETRY_WAIT_MS[attempt - 1]);
        continue;
      }

      if (!response.ok) {
        const mapped = mapHttpStatus(response.status);
        return {
          ok: false,
          code: mapped.code,
          message: sanitizeUserMessage(mapped.message, input.apiKey),
        };
      }

      const payload: unknown = await response.json();
      const text = readGeminiText(payload);
      if (!text) {
        return {
          ok: false,
          code: "parse",
          message:
            "Gemini 응답을 해석하지 못했습니다. 집계 데이터는 변경되지 않았습니다.",
        };
      }

      return { ok: true, text };
    } catch {
      return {
        ok: false,
        code: "unavailable",
        message:
          "Gemini API 호출 중 오류가 발생했습니다. 집계 데이터는 변경되지 않았습니다.",
      };
    }
  }

  return {
    ok: false,
    code: "unavailable",
    message: sanitizeUserMessage(SERVICE_BUSY_MESSAGE, input.apiKey),
  };
}
