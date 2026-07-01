import createCheckoutSession from "./_handlers/create-checkout-session.js";
import verifySession from "./_handlers/verify-session.js";
import webhook from "./_handlers/webhook.js";

export default async function handler(req, res) {
  const action = req.query.action || req.url.split("/").pop().split("?")[0];

  if (action === "create-checkout-session") return createCheckoutSession(req, res);
  if (action === "verify-session") return verifySession(req, res);
  if (action === "webhook") return webhook(req, res);

  return res.status(404).json({ error: `Stripe action '${action}' not found` });
}
