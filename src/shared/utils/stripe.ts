import Stripe from "stripe";
import { logger } from "./logger.js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-04-22.dahlia", // Matches installed stripe package version
});

export class StripeHelper {
  /**
   * Creates a Payment Intent for a booking
   * @param amount Amount in cents (e.g., 5000 for $50.00)
   * @param metadata Optional metadata to attach to the intent
   */
  static async createPaymentIntent(amount: number, metadata: Record<string, string> = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
      return paymentIntent;
    } catch (error) {
      logger.error("Error creating Stripe Payment Intent", { error });
      throw error;
    }
  }

  /**
   * Verifies a Stripe Webhook signature
   * @param payload Raw body from the request
   * @param signature Signature header from Stripe
   */
  static verifyWebhook(payload: string | Buffer, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        stripeWebhookSecret
      );
      return event;
    } catch (error) {
      logger.error("Stripe Webhook Verification Failed", { error });
      throw error;
    }
  }
}
