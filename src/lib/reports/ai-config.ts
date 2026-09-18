const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

function readEnv(name: string) {
  const value = process.env[name];
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }
  return value.trim();
}

export function hasServerAiApiKey() {
  return Boolean(readEnv("GEMINI_API_KEY"));
}

export function getServerAiApiKey() {
  return readEnv("GEMINI_API_KEY");
}

export function getServerAiModel() {
  const model = readEnv("GEMINI_MODEL");
  if (model && /^[a-zA-Z0-9._-]+$/.test(model)) {
    return model;
  }
  return DEFAULT_GEMINI_MODEL;
}
