import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { amount, method, product } = req.body;

  if (!amount || !method) {
    return res.status(400).json({ message: 'Missing payment method or amount' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [method],
      line_items: [
        {
          price_data: {
            currency: 'myr',
            product_data: {
              name: product || "Product",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://www.lyanadyana.com/success',
      cancel_url: 'https://www.lyanadyana.com/cancel',
    });

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Server error. Sila semak kembali API.' });
  }
}
