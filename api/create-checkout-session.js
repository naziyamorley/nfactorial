import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId, email } = req.body || {}

  if (!userId) {
    return res.status(400).json({ error: 'userId required' })
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
    return res.status(503).json({ error: 'Stripe not configured. See README for setup steps.' })
  }

  const origin = req.headers.origin || `https://${req.headers.host}`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: email || undefined,
      client_reference_id: userId,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
      success_url: `${origin}/pro?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pro`,
      allow_promotion_codes: true,
    })

    return res.status(200).json({ url: session.url, id: session.id })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return res.status(500).json({ error: err.message || 'Failed to create session' })
  }
}
