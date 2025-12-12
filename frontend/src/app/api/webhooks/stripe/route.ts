import { NextResponse } from "next/server";
import Stripe from "stripe";
import { env } from "~/env";
import { db } from "~/server/db";
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
    try {
        const body = await request.text();
        const signature = request.headers.get("stripe-signature") || "";

    let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                webhookSecret
            )
        } catch (error) {
            console.error("Webhook signature verification failed.", error);
            return new NextResponse("Webhook Error", { status: 400 });
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const customerId = session.customer as string;

            const retrievedSession = await stripe.checkout.sessions.retrieve(
                session.id,
                {
                    expand: ["line_items"],
                }
            )

            const lineItems = retrievedSession.line_items;
            if (lineItems && lineItems.data.length > 0) {
                const priceId = lineItems.data[0]?.price?.id ?? undefined;

                if (priceId) {
                    let creditsToAdd = 0;

                    if (priceId === env.STRIPE_SMALL_CREDIT_PACK) {
                        creditsToAdd = 50;
                    } else if (priceId === env.STRIPE_MEDIUM_CREDIT_PACK) {
                        creditsToAdd = 150;
                    } else if (priceId === env.STRIPE_LARGE_CREDIT_PACK) {
                        creditsToAdd = 450;
                    }

                    await db.user.update({
                        where: { stripeCustomerId: customerId },
                        data: {
                            credits: { increment: creditsToAdd },
                        }
                    })
                }
            }
        }

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error("Error handling webhook:", error);
        return new NextResponse("Webhook Server Error", { status: 500 });
    }
}