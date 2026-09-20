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

function classifyOpenAIError(status, data) {
  const message = (data && data.error && data.error.message) || "";
  const type = (data && data.error && data.error.type) || (data && data.error && data.error.code) || "";

  if (status === 429 && /quota/i.test(type + message)) {
    return { code: "insufficient_credits", message: "Out of API credits — add more at platform.openai.com/settings/billing" };
  }
  if (status === 401 || /invalid_api_key/i.test(type)) {
    return { code: "invalid_key", message: "The OpenAI API key isn't valid. Check OPENAI_API_KEY in your Vercel project settings." };
  }
  if (status === 429) {
    return { code: "rate_limited", message: "Too many requests right now — wait a few seconds and try again." };
  }
  if (status >= 500) {
    return { code: "server_error", message: "The AI provider's servers are having trouble right now. Try again shortly." };
  }
  return { code: "unknown", message: message || "That request didn't go through. Try again." };
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
      messages,
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

async function callOpenAI(apiKey, system, messages, maxTokens) {
  const openaiMessages = [
    ...(system ? [{ role: "system", content: system }] : []),
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: maxTokens || 1000,
      messages: openaiMessages,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const classified = classifyOpenAIError(res.status, data);
    return { ok: false, status: res.status, ...classified };
  }
  const text = ((data.choices || [])[0]?.message?.content || "").trim();
  return { ok: true, text };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed", code: "method_not_allowed" });
    return;
  }

  // Uses whichever key is configured — Anthropic first if both are set.
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!anthropicKey && !openaiKey) {
    res.status(500).json({
      error: "No AI provider is configured. Add ANTHROPIC_API_KEY or OPENAI_API_KEY in your Vercel project's Environment Variables, then redeploy.",
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
      : await callOpenAI(openaiKey, system, messages, maxTokens);

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
