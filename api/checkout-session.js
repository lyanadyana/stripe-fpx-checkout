const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send({ message: "Only POST allowed" });
  }

  const { method, amount, product } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [method],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "myr",
            product_data: { name: product },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: "https://www.lyanadyana.com/checkout-success",
      cancel_url: "https://www.lyanadyana.com/cart",
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
}
