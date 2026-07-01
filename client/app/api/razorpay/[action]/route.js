import createOrder from "../../../../_api_legacy/razorpay/_handlers/create-order.js";
import verify from "../../../../_api_legacy/razorpay/_handlers/verify.js";
import webhook from "../../../../_api_legacy/razorpay/_handlers/webhook.js";

const handlers = {
  "create-order": createOrder,
  verify,
  webhook,
};

async function handleAction(request, { params }) {
  const { action } = await params;

  const handler = handlers[action];
  if (!handler) {
    return new Response(JSON.stringify({ error: `Razorpay action '${action}' not found` }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse raw text for signature checks
  const rawText = await request.text();
  let body = {};
  if (rawText) {
    try {
      body = JSON.parse(rawText);
    } catch (e) {
      body = rawText;
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
    console.error(`Error in razorpay handler [${action}]:`, err);
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
