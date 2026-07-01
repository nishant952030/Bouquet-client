import createOrder from "./_handlers/create-order.js";
import verify from "./_handlers/verify.js";
import webhook from "./_handlers/webhook.js";

export default async function handler(req, res) {
  const action = req.query.action || req.url.split("/").pop().split("?")[0];

  if (action === "create-order") return createOrder(req, res);
  if (action === "verify") return verify(req, res);
  if (action === "webhook") return webhook(req, res);

  return res.status(404).json({ error: `Razorpay action '${action}' not found` });
}
