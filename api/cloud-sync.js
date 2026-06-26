import { createHash } from "node:crypto";
import { get, put } from "@vercel/blob";

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

function blobConfig() {
  return {
    storeId: process.env.BLOB_STORE_ID,
    token: process.env.BLOB_READ_WRITE_TOKEN,
    oidcToken: process.env.VERCEL_OIDC_TOKEN
  };
}

function hasRedisConfig() {
  const { url, token } = cloudConfig();
  return Boolean(url && token);
}

function hasBlobConfig() {
  const { storeId, token, oidcToken } = blobConfig();
  return Boolean(token || (storeId && (oidcToken || process.env.VERCEL)));
}

function activeBackend() {
  const preference = String(process.env.SINE_SYNC_BACKEND || "auto").trim().toLowerCase();
  if (preference === "blob" && hasBlobConfig()) return "blob";
  if (preference === "redis" && hasRedisConfig()) return "redis";
  if (hasBlobConfig()) return "blob";
  if (hasRedisConfig()) return "redis";
  return "";
}

function recordKey(value) {
  const normalized = String(value || "").trim();
  if (normalized.length < 3) return "";
  const digest = createHash("sha256").update(normalized).digest("hex");
  return `sine:sync:${digest.slice(0, 48)}`;
}

function blobPath(key) {
  return `${key.replaceAll(":", "/")}.json`;
}

function blobOptions() {
  const { storeId, token, oidcToken } = blobConfig();
  return {
    access: "private",
    ...(storeId ? { storeId } : {}),
    ...(token ? { token } : {}),
    ...(oidcToken ? { oidcToken } : {})
  };
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

async function readCloudRecord(key, backend) {
  if (backend === "blob") {
    const result = await get(blobPath(key), blobOptions());
    if (!result || result.statusCode !== 200 || !result.stream) return null;
    const raw = await new Response(result.stream).text();
    return JSON.parse(raw);
  }

  const raw = await redis(["GET", key]);
  if (!raw) return null;
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

async function writeCloudRecord(key, record, backend) {
  const serialized = JSON.stringify(record);
  if (serialized.length > MAX_PAYLOAD_BYTES) {
    const error = new Error("Sync payload is too large");
    error.code = "payload_too_large";
    throw error;
  }

  if (backend === "blob") {
    await put(blobPath(key), serialized, {
      ...blobOptions(),
      allowOverwrite: true,
      addRandomSuffix: false,
      cacheControlMaxAge: 60,
      contentType: "application/json"
    });
    return;
  }

  await redis(["SET", key, serialized]);
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

  const backend = activeBackend();
  if (!backend) {
    json(res, 501, { ok: false, configured: false, error: "Cloud storage env vars are missing" });
    return;
  }

  try {
    const body = await readBody(req);
    const action = String(body.action || "status");
    const key = recordKey(body.key);

    if (action === "status") {
      json(res, 200, {
        ok: true,
        configured: true,
        backend,
        blob: hasBlobConfig(),
        redis: hasRedisConfig()
      });
      return;
    }

    if (!key) {
      json(res, 400, { ok: false, error: "Cloud ID must be at least 3 characters" });
      return;
    }

    if (action === "pull") {
      const record = await readCloudRecord(key, backend);
      if (!record) {
        json(res, 200, { ok: true, payload: null });
        return;
      }
      json(res, 200, {
        ok: true,
        backend,
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
      try {
        await writeCloudRecord(key, record, backend);
      } catch (error) {
        if (error?.code === "payload_too_large") {
          json(res, 413, { ok: false, error: error.message });
          return;
        }
        throw error;
      }
      json(res, 200, { ok: true, backend, updatedAt: record.updatedAt, device: record.device });
      return;
    }

    json(res, 400, { ok: false, error: "Unknown cloud sync action" });
  } catch (error) {
    json(res, 500, {
      ok: false,
      backend: activeBackend() || undefined,
      error: error?.message || "Cloud sync failed"
    });
  }
}
