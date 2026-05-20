// Opens Stripe Checkout for the current user.
// Calls our /api/create-checkout-session endpoint then redirects.
export async function startProCheckout({ userId, email }) {
  const resp = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email }),
  })

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}))
    throw new Error(err.error || `Checkout failed (${resp.status})`)
  }

  const { url } = await resp.json()
  if (!url) throw new Error('No checkout URL returned')
  window.location.href = url
}

export const stripeConfigured = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
