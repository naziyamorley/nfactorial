import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

export const config = { api: { bodyParser: false } }

async function readRawBody(req) {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

async function setPro(userId, isPro) {
  if (!userId) return
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_pro: isPro })
    .eq('id', userId)
  if (error) console.error('Supabase update is_pro failed:', error)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let event
  try {
    const rawBody = await readRawBody(req)
    const signature = req.headers['stripe-signature']
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.client_reference_id || session.metadata?.userId
        await setPro(userId, true)
        break
      }
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused': {
        const sub = event.data.object
        const userId = sub.metadata?.userId
        await setPro(userId, false)
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object
        const userId = sub.metadata?.userId
        // Active status keeps Pro on; canceled at period end keeps Pro until then.
        const active = ['active', 'trialing'].includes(sub.status)
        await setPro(userId, active)
        break
      }
      default:
        // Unhandled — return 200 so Stripe stops retrying.
        break
    }
    return res.status(200).json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return res.status(500).json({ error: 'Webhook handler failed' })
  }
}
