let paypalScriptPromise = null;

export function loadPayPalScript({ clientId, currency = "USD" }) {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.paypal) return Promise.resolve(true);
  if (!clientId) return Promise.resolve(false);
  if (paypalScriptPromise) return paypalScriptPromise;

  paypalScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      "client-id": clientId,
      currency,
      intent: "capture",
      components: "buttons",
    });
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return paypalScriptPromise;
}
