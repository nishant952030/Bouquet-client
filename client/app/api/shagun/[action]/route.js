import claim from "../../../../_api_legacy/shagun/_handlers/claim.js";
import completePayout from "../../../../_api_legacy/shagun/_handlers/complete-payout.js";
import createOrder from "../../../../_api_legacy/shagun/_handlers/create-order.js";
import sendOtp from "../../../../_api_legacy/shagun/_handlers/send-otp.js";
import verifyOtp from "../../../../_api_legacy/shagun/_handlers/verify-otp.js";
import verifyUpi from "../../../../_api_legacy/shagun/_handlers/verify-upi.js";
import verify from "../../../../_api_legacy/shagun/_handlers/verify.js";
import getShagun from "../../../../_api_legacy/shagun/_handlers/get.js";

const handlers = {
  claim,
  "complete-payout": completePayout,
  "create-order": createOrder,
  "send-otp": sendOtp,
  "verify-otp": verifyOtp,
  "verify-upi": verifyUpi,
  verify,
  get: getShagun,
};

async function handleAction(request, { params }) {
  const { action } = await params;

  const handler = handlers[action];
  if (!handler) {
    return new Response(JSON.stringify({ error: `Shagun action '${action}' not found` }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse body if method is POST/PUT
  let body = {};
  if (request.method !== "GET" && request.method !== "HEAD") {
    try {
      body = await request.json();
    } catch (e) {
      // Empty or invalid JSON
    }
  }

  // Parse query parameters
  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  // Mock req
  const req = {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body,
    query: { ...query, action },
    url: request.url,
  };

  // Mock res
  let responseStatus = 200;
  let responseHeaders = { "Content-Type": "application/json" };
  let responseBody = "";

  const res = {
    status(code) {
      responseStatus = code;
      return this;
    },
    json(data) {
      responseBody = JSON.stringify(data);
      return this;
    },
    setHeader(name, value) {
      responseHeaders[name] = value;
      return this;
    },
    send(data) {
      responseBody = typeof data === "string" ? data : JSON.stringify(data);
      return this;
    },
    end() {
      return this;
    }
  };

  try {
    await handler(req, res);
    return new Response(responseBody, {
      status: responseStatus,
      headers: responseHeaders,
    });
  } catch (err) {
    console.error(`Error in shagun handler [${action}]:`, err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(request, context) {
  return handleAction(request, context);
}

export async function POST(request, context) {
  return handleAction(request, context);
}
