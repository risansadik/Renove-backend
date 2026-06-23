import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-05-27.dahlia", 
});

export class StripeHelper {
  /**
   * Creates a Payment Intent for a booking
   * @param amount Amount in cents (e.g., 5000 for $50.00)
   * @param metadata Optional metadata to attach to the intent
   */
  static async createPaymentIntent(amount: number, metadata: Record<string, string> = {}) {
    return stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  /**
   * Verifies a Stripe Webhook signature
   * @param payload Raw body from the request
   * @param signature Signature header from Stripe
   */
  static verifyWebhook(payload: string | Buffer, signature: string) {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeWebhookSecret
    );
  }
}
