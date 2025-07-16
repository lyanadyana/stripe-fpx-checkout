const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { method, amount, product } = req.body;

  if (!method || !amount) {
    return res.status(400).json({ error: "Missing method or amount" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [method],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: { name: product || "Order" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: "https://www.lyanadyana.com/checkout-success",
      cancel_url: "https://www.lyanadyana.com/cart",
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err.message);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
