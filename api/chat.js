export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, systemPrompt } = req.body
  if (!messages || !systemPrompt) {
    return res.status(400).json({ error: 'messages and systemPrompt required' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 300,
        temperature: 0.3,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Groq error:', err)
      return res.status(response.status).json({ error: 'Groq API error' })
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()
    return res.status(200).json({ content })
  } catch (err) {
    console.error('Chat API error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
