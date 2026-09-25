function classifyAnthropicError(status, data) {
  const message = (data && data.error && data.error.message) || "";
  const type = (data && data.error && data.error.type) || "";

  if (status === 400 && /credit balance/i.test(message)) {
    return { code: "insufficient_credits", message: "Out of API credits — add more at console.anthropic.com/settings/billing" };
  }
  if (status === 401 || type === "authentication_error") {
    return { code: "invalid_key", message: "The Anthropic API key isn't valid. Check ANTHROPIC_API_KEY in your Vercel project settings." };
  }
  if (status === 429 || type === "rate_limit_error") {
    return { code: "rate_limited", message: "Too many requests right now — wait a few seconds and try again." };
  }
  if (status === 529 || type === "overloaded_error") {
    return { code: "overloaded", message: "Claude is overloaded right now. Try again in a moment." };
  }
  if (status >= 500) {
    return { code: "server_error", message: "Claude's servers are having trouble right now. Try again shortly." };
  }
  return { code: "unknown", message: message || "That request didn't go through. Try again." };
}

function classifyOpenAICompatibleError(status, data, providerLabel, billingUrl, keyEnvVar) {
  const message = (data && data.error && data.error.message) || "";
  const type = (data && data.error && data.error.type) || (data && data.error && data.error.code) || "";

  if (status === 429 && /quota|credit/i.test(type + message)) {
    return { code: "insufficient_credits", message: `Out of ${providerLabel} credits — check ${billingUrl}` };
  }
  if (status === 401 || /invalid_api_key|unauthorized/i.test(type + message)) {
    return { code: "invalid_key", message: `The ${providerLabel} API key isn't valid. Check ${keyEnvVar} in your Vercel project settings.` };
  }
  if (status === 429) {
    return { code: "rate_limited", message: "Too many requests right now — wait a few seconds and try again." };
  }
  if (status >= 500) {
    return { code: "server_error", message: "The AI provider's servers are having trouble right now. Try again shortly." };
  }
  return { code: "unknown", message: message || "That request didn't go through. Try again." };
}

// Messages from the frontend use a neutral content shape for images —
// { type: "image", mediaType, data } — translated here into whichever
// provider's own format is needed.
function toAnthropicContent(content) {
  if (typeof content === "string") return content;
  return content.map((block) =>
    block.type === "image"
      ? { type: "image", source: { type: "base64", media_type: block.mediaType, data: block.data } }
      : block
  );
}

function toOpenAIStyleContent(content) {
  if (typeof content === "string") return content;
  return content.map((block) =>
    block.type === "image"
      ? { type: "image_url", image_url: { url: `data:${block.mediaType};base64,${block.data}` } }
      : block
  );
}

async function callAnthropic(apiKey, system, messages, maxTokens) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: maxTokens || 1000,
      system: system || undefined,
      messages: messages.map((m) => ({ role: m.role, content: toAnthropicContent(m.content) })),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const classified = classifyAnthropicError(res.status, data);
    return { ok: false, status: res.status, ...classified };
  }
  const text = (data.content || [])
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
  return { ok: true, text };
}

// Shared by OpenAI and NVIDIA Build — NVIDIA's hosted endpoint speaks the
// same Chat Completions format, so one function serves both.
async function callOpenAICompatible({ apiKey, baseUrl, model, system, messages, maxTokens, providerLabel, billingUrl, keyEnvVar }) {
  const chatMessages = [
    ...(system ? [{ role: "system", content: system }] : []),
    ...messages.map((m) => ({ role: m.role, content: toOpenAIStyleContent(m.content) })),
  ];
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens || 1000,
      messages: chatMessages,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const classified = classifyOpenAICompatibleError(res.status, data, providerLabel, billingUrl, keyEnvVar);
    return { ok: false, status: res.status, ...classified };
  }
  const text = ((data.choices || [])[0]?.message?.content || "").trim();
  return { ok: true, text };
}

async function callOpenAI(apiKey, system, messages, maxTokens) {
  return callOpenAICompatible({
    apiKey,
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o",
    system,
    messages,
    maxTokens,
    providerLabel: "OpenAI",
    billingUrl: "platform.openai.com/settings/billing",
    keyEnvVar: "OPENAI_API_KEY",
  });
}

async function callNvidia(apiKey, system, messages, maxTokens) {
  // NVIDIA Build (build.nvidia.com) hosts open models behind an
  // OpenAI-compatible endpoint — free to use with a developer account.
  // Swap the model for anything else in the catalog if you'd like.
  return callOpenAICompatible({
    apiKey,
    baseUrl: "https://integrate.api.nvidia.com/v1",
    model: "meta/llama-3.3-70b-instruct",
    system,
    messages,
    maxTokens,
    providerLabel: "NVIDIA Build",
    billingUrl: "build.nvidia.com",
    keyEnvVar: "NVIDIA_API_KEY",
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed", code: "method_not_allowed" });
    return;
  }

  // Uses whichever key is configured — checked in this order if more than one is set.
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const nvidiaKey = process.env.NVIDIA_API_KEY;

  if (!anthropicKey && !openaiKey && !nvidiaKey) {
    res.status(500).json({
      error: "No AI provider is configured. Add ANTHROPIC_API_KEY, OPENAI_API_KEY, or NVIDIA_API_KEY in your Vercel project's Environment Variables, then redeploy.",
      code: "missing_key",
    });
    return;
  }

  const { system, messages, maxTokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "Missing messages", code: "bad_request" });
    return;
  }

  try {
    const result = anthropicKey
      ? await callAnthropic(anthropicKey, system, messages, maxTokens)
      : openaiKey
      ? await callOpenAI(openaiKey, system, messages, maxTokens)
      : await callNvidia(nvidiaKey, system, messages, maxTokens);

    if (!result.ok) {
      res.status(result.status || 500).json({ error: result.message, code: result.code });
      return;
    }
    if (!result.text) {
      res.status(502).json({ error: "Got an empty response from the AI provider. Try again.", code: "empty" });
      return;
    }
    res.status(200).json({ text: result.text });
  } catch (err) {
    res.status(502).json({ error: "Couldn't reach the AI provider's servers. Try again shortly.", code: "upstream_unreachable" });
  }
}
