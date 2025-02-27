import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

const settingsUrl = absoluteUrl("/settings");

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Buscar la suscripción del usuario en la base de datos
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: { userId },
    });

    // Si el usuario ya tiene una suscripción, redirigir al portal de facturación de Stripe
    if (userSubscription && userSubscription.stripe_customer_id) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripe_customer_id,
        return_url: settingsUrl,
      });
      return NextResponse.json({ url: stripeSession.url });
    }

    // Si no hay una suscripción, crear una nueva sesión de pago en Stripe
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user.emailAddresses[0]?.emailAddress,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "logxai Pro",
              description: "Unlimited AI Generations",
            },
            unit_amount: 2000, // $20.00 en centavos
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { session } = body;

    // Validar los datos de la sesión
    if (!session || !session.metadata || !session.metadata.userId) {
      return new NextResponse("Invalid session data", { status: 400 });
    }

    // Obtener la suscripción de Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription);

    if (!subscription) {
      return new NextResponse("Subscription not found", { status: 404 });
    }

    // Crear o actualizar la suscripción en la base de datos
    await prismadb.userSubscription.upsert({
      where: { userId: session.metadata.userId },
      update: {
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        stripe_price_id: subscription.items.data[0]?.price.id,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000),
      },
      create: {
        userId: session.metadata.userId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        stripe_price_id: subscription.items.data[0]?.price.id,
        stripe_current_period_end: new Date(subscription.current_period_end * 1000),
      },
    });

    return new NextResponse("Subscription updated successfully", { status: 200 });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
