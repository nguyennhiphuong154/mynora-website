import { orderEmail, type SavedOrder } from "./order.ts";
export interface EmailProvider { send(order: SavedOrder): Promise<void> }
export function resendProvider(env: (key: string) => string | undefined): EmailProvider {
  return { async send(order) {
    const key = env("RESEND_API_KEY"), from = env("ORDER_NOTIFICATION_FROM"), to = env("ORDER_NOTIFICATION_EMAIL");
    if (!key || !from || !to) throw new Error("EMAIL_NOT_CONFIGURED");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `cake-order-${order.id}` },
      body: JSON.stringify({ from, to: [to], ...orderEmail(order) }), signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`EMAIL_PROVIDER_${response.status}`);
  } };
}
