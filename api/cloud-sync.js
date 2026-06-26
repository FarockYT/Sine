import { createHash } from "node:crypto";

const MAX_PAYLOAD_BYTES = 900_000;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return req.body ? JSON.parse(req.body) : {};

  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
  }
  return raw ? JSON.parse(raw) : {};
}

function cloudConfig() {
  return {
    url: process.env.SINE_SYNC_REST_URL || process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.SINE_SYNC_REST_TOKEN || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  };
}

function recordKey(value) {
  const normalized = String(value || "").trim();
  if (normalized.length < 3) return "";
  const digest = createHash("sha256").update(normalized).digest("hex");
  return `sine:sync:${digest.slice(0, 48)}`;
}

async function redis(command) {
  const { url, token } = cloudConfig();
  if (!url || !token) {
    const error = new Error("Cloud storage is not configured");
    error.code = "not_configured";
    throw error;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) {
    throw new Error(data.error || `Redis command failed: ${response.status}`);
  }
  return data.result;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { ok: false, error: "Use POST" });
    return;
  }

  const { url, token } = cloudConfig();
  if (!url || !token) {
    json(res, 501, { ok: false, configured: false, error: "Cloud storage env vars are missing" });
    return;
  }

  try {
    const body = await readBody(req);
    const action = String(body.action || "status");
    const key = recordKey(body.key);

    if (action === "status") {
      json(res, 200, { ok: true, configured: true });
      return;
    }

    if (!key) {
      json(res, 400, { ok: false, error: "Cloud ID must be at least 3 characters" });
      return;
    }

    if (action === "pull") {
      const raw = await redis(["GET", key]);
      if (!raw) {
        json(res, 200, { ok: true, payload: null });
        return;
      }
      const record = typeof raw === "string" ? JSON.parse(raw) : raw;
      json(res, 200, {
        ok: true,
        payload: record.payload,
        updatedAt: record.updatedAt,
        device: record.device || "cloud"
      });
      return;
    }

    if (action === "push") {
      if (!body.payload || typeof body.payload !== "object") {
        json(res, 400, { ok: false, error: "Missing sync payload" });
        return;
      }
      const record = {
        updatedAt: Date.now(),
        device: String(body.device || "device").slice(0, 48),
        payload: body.payload
      };
      const serialized = JSON.stringify(record);
      if (serialized.length > MAX_PAYLOAD_BYTES) {
        json(res, 413, { ok: false, error: "Sync payload is too large" });
        return;
      }
      await redis(["SET", key, serialized]);
      json(res, 200, { ok: true, updatedAt: record.updatedAt, device: record.device });
      return;
    }

    json(res, 400, { ok: false, error: "Unknown cloud sync action" });
  } catch (error) {
    json(res, 500, {
      ok: false,
      error: error?.message || "Cloud sync failed"
    });
  }
}
