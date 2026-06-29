import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const idx = line.indexOf("=");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const getFlagValue = (name) => {
  const prefix = `${name}=`;
  const match = args.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
};

const BASE_URL = getFlagValue("--base-url") || process.env.BASE_URL || "http://localhost:3000";
const diagnoseOnly = flags.has("--diagnose-only");
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY;
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID;
const SUPABASE_PROJECT_URL = process.env.SUPABASE_PROJECT_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
const REQUIRED_OTP_COLUMNS =
  "id,phone,otp_hash,expires_at,attempts,created_at,request_ip_hash,provider_status,provider_message_id,provider_error,accepted_at,verified_at";

const phoneArgs = args.filter((arg) => !arg.startsWith("--"));
const phones = phoneArgs.length
  ? phoneArgs
  : ["9360804740", "7305250054"];

function normalizeIndianPhone(phone) {
  const cleaned = String(phone || "").replace(/[^\d+]/g, "");
  if (/^\+91[6-9]\d{9}$/.test(cleaned)) return cleaned;
  if (/^[6-9]\d{9}$/.test(cleaned)) return `+91${cleaned}`;
  return null;
}

function extractOtp(message) {
  const match = String(message || "").match(/\b(\d{6})\b/);
  return match?.[1] || null;
}

async function checkSupabaseOtpTable() {
  if (!SUPABASE_PROJECT_URL || !SUPABASE_SERVICE_ROLE) {
    return {
      ok: false,
      reason: "Missing SUPABASE_PROJECT_URL or SUPABASE_SERVICE_ROLE env",
    };
  }

  const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_SERVICE_ROLE, {
    auth: { persistSession: false },
  });
  const result = await supabase.from("phone_otps").select(REQUIRED_OTP_COLUMNS).limit(1);

  if (result.error) {
    return { ok: false, reason: result.error.message };
  }
  return { ok: true, reason: "phone_otps table and required OTP columns exist" };
}

async function checkTextBeeDevice() {
  if (!TEXTBEE_API_KEY || !TEXTBEE_DEVICE_ID) {
    return { ok: false, reason: "Missing TEXTBEE_API_KEY or TEXTBEE_DEVICE_ID env" };
  }

  const res = await fetch("https://api.textbee.dev/api/v1/gateway/devices", {
    headers: { "x-api-key": TEXTBEE_API_KEY },
  });
  if (!res.ok) {
    return { ok: false, reason: `TextBee devices API failed (${res.status})` };
  }

  const body = await res.json();
  const device = Array.isArray(body?.data)
    ? body.data.find((item) => item?._id === TEXTBEE_DEVICE_ID)
    : null;
  if (!device) return { ok: false, reason: "Configured TextBee device was not found" };

  return {
    ok: Boolean(device.enabled),
    reason: device.enabled ? "TextBee device is enabled" : "TextBee device is disabled",
    device: {
      name: device.name || null,
      appVersionName: device.appVersionName || null,
      fcmTokenUpdatedAt: device.fcmTokenUpdatedAt || null,
      heartbeatEnabled: Boolean(device.heartbeatEnabled),
      sentSMSCount: device.sentSMSCount ?? null,
    },
  };
}

async function fetchLatestOtpMessage(recipient) {
  if (!TEXTBEE_API_KEY || !TEXTBEE_DEVICE_ID) {
    return { ok: false, reason: "Missing TEXTBEE_API_KEY or TEXTBEE_DEVICE_ID env" };
  }

  const res = await fetch(
    `https://api.textbee.dev/api/v1/gateway/devices/${TEXTBEE_DEVICE_ID}/messages?page=1&limit=50`,
    { headers: { "x-api-key": TEXTBEE_API_KEY } }
  );

  if (!res.ok) {
    return { ok: false, reason: `TextBee messages API failed (${res.status})` };
  }

  const body = await res.json();
  const rows = Array.isArray(body?.data) ? body.data : [];
  const match = rows.find(
    (item) =>
      item?.recipient === recipient &&
      typeof item?.message === "string" &&
      item.message.includes("ChefDhundo login OTP")
  );

  if (!match) {
    return { ok: false, reason: `No OTP SMS record found for ${recipient}` };
  }

  return {
    ok: true,
    otp: extractOtp(match.message),
    smsStatus: match.status || "unknown",
    errorCode: match.errorCode || null,
    errorMessage: match.errorMessage || null,
    createdAt: match.createdAt || null,
  };
}

async function requestOtp(phone) {
  const res = await fetch(`${BASE_URL}/api/auth/request-otp`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function verifyOtp(phone, otp) {
  const res = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone, otp }),
  });
  const text = await res.text();
  const setCookie = res.headers.get("set-cookie");
  return { status: res.status, body: text, cookie: setCookie };
}

async function checkProtectedRoutes(cookieHeader) {
  const headers = cookieHeader ? { cookie: cookieHeader } : {};
  const dashboard = await fetch(`${BASE_URL}/dashboard`, {
    redirect: "manual",
    headers,
  });
  const admin = await fetch(`${BASE_URL}/admin`, { redirect: "manual", headers });

  return {
    dashboard: {
      status: dashboard.status,
      location: dashboard.headers.get("location"),
    },
    admin: {
      status: admin.status,
      location: admin.headers.get("location"),
    },
  };
}

async function runForPhone(phoneInput) {
  const phone = normalizeIndianPhone(phoneInput);
  if (!phone) {
    return {
      phone: phoneInput,
      ok: false,
      reason: "Invalid Indian phone format",
    };
  }

  let otpRequest = await requestOtp(phoneInput);
  if (otpRequest.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, 62000));
    otpRequest = await requestOtp(phoneInput);
  }

  const latest = await fetchLatestOtpMessage(phone);
  if (!latest.ok || !latest.otp) {
    return {
      phone,
      ok: false,
      otpRequest,
      latest,
      reason: latest.reason || "OTP not available from TextBee",
    };
  }

  if (String(latest.smsStatus || "").toLowerCase() === "failed") {
    return {
      phone,
      ok: false,
      otpRequest,
      latest,
      reason: `TextBee send failed: ${latest.errorMessage || latest.errorCode || "unknown error"}`,
    };
  }

  const verify = await verifyOtp(phoneInput, latest.otp);
  const cookieHeader = verify.cookie?.split(";")?.[0] || null;
  const routeCheck = await checkProtectedRoutes(cookieHeader);

  return {
    phone,
    ok: verify.status === 200,
    otpRequest,
    latest,
    verify,
    routeCheck,
  };
}

async function main() {
  console.log("=== ChefDhundo Mobile OTP Flow Test ===");
  console.log(`Base URL: ${BASE_URL}`);

  const otpTableStatus = await checkSupabaseOtpTable();
  console.log(
    `Supabase phone_otps: ${otpTableStatus.ok ? "OK" : "MISSING/ERROR"} - ${otpTableStatus.reason}`
  );

  const textBeeStatus = await checkTextBeeDevice();
  console.log(
    `TextBee device: ${textBeeStatus.ok ? "OK" : "ERROR"} - ${textBeeStatus.reason}`
  );

  if (diagnoseOnly) {
    console.log(JSON.stringify({ otpTableStatus, textBeeStatus }, null, 2));
    if (!otpTableStatus.ok || !textBeeStatus.ok) process.exitCode = 1;
    return;
  }

  const results = [];
  for (const phone of phones) {
    results.push(await runForPhone(phone));
  }

  console.log(JSON.stringify({ otpTableStatus, textBeeStatus, results }, null, 2));

  const failed = !otpTableStatus.ok || !textBeeStatus.ok || results.some((result) => !result.ok);
  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("OTP flow test failed:", error);
  process.exit(1);
});
