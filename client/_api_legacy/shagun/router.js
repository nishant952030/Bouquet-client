import claim from "./_handlers/claim.js";
import completePayout from "./_handlers/complete-payout.js";
import createOrder from "./_handlers/create-order.js";
import sendOtp from "./_handlers/send-otp.js";
import verifyOtp from "./_handlers/verify-otp.js";
import verifyUpi from "./_handlers/verify-upi.js";
import verify from "./_handlers/verify.js";
import getShagun from "./_handlers/get.js";

export default async function handler(req, res) {
  // Extract action parameter (Vercel routes /api/shagun/:action to this file)
  const action = req.query.action || req.url.split("/").pop().split("?")[0];

  if (action === "claim") return claim(req, res);
  if (action === "complete-payout") return completePayout(req, res);
  if (action === "create-order") return createOrder(req, res);
  if (action === "send-otp") return sendOtp(req, res);
  if (action === "verify-otp") return verifyOtp(req, res);
  if (action === "verify-upi") return verifyUpi(req, res);
  if (action === "verify") return verify(req, res);
  if (action === "get") return getShagun(req, res);

  return res.status(404).json({ error: `Shagun action '${action}' not found` });
}
