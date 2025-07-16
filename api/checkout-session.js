import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { amount, method, product, name, phone, address } = req.body;

  if (!amount || !method || !name || !phone || !address) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Senarai kaedah pembayaran yang disokong
  const allowedMethods = ['card', 'fpx', 'grabpay', 'alipay'];

  // Semak jika kaedah pembayaran yang diterima sah
  if (!allowedMethods.includes(method)) {
    return res.status(400).json({ message: 'Kaedah pembayaran tidak disokong' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: [method],
      line_items: [
        {
          price_data: {
            currency: 'myr', // Mata wang yang digunakan
            product_data: {
              name: product || "Product", // Nama produk
            },
            unit_amount: amount, // Jumlah bayaran dalam sen
          },
          quantity: 1, // Kuantiti produk
        },
      ],
      mode: 'payment', // Mod pembayaran
      success_url: `https://www.lyanadyana.com/success?name=${name}&phone=${phone}&address=${address}`, // URL kejayaan dengan parameter
      cancel_url: 'https://www.lyanadyana.com/cancel', // URL pembatalan
    });

    // Hantar URL sesi Stripe
    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Server error. Sila semak kembali API.' });
  }
}
