export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { pgn, playerClass, result, durationS, lang: rawLang } = req.body
  if (!pgn) return res.status(400).json({ error: 'PGN required' })

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not configured' })

  const lang = rawLang === 'kz' ? 'kz' : 'ru'

  const classStyle = {
    ru: {
      attacker: 'агрессивный атакующий, любит жертвы и инициативу',
      defender: 'защитник, ценит крепкие позиции и контригру',
      tactician: 'тактик и стратег, специалист по эндшпилю',
    },
    kz: {
      attacker: 'агрессиялы шабуылдаушы, құрбандық пен бастамашылықты ұнатады',
      defender: 'қорғаушы, мықты позициялар мен қарсы ойынды бағалайды',
      tactician: 'тактик және стратег, эндшпиль маманы',
    },
  }
  const classTip = {
    ru: {
      attacker: 'Оцени агрессивность, тактические удары и жертвы.',
      defender: 'Оцени надёжность позиции и защитные навыки.',
      tactician: 'Оцени стратегическое планирование и технику эндшпиля.',
    },
    kz: {
      attacker: 'Агрессияны, тактикалық соққыларды және құрбандықтарды бағала.',
      defender: 'Позицияның мықтылығы мен қорғаныс дағдыларын бағала.',
      tactician: 'Стратегиялық жоспарлау мен эндшпиль техникасын бағала.',
    },
  }

  const styleText = classStyle[lang][playerClass] || (lang === 'kz' ? 'шахматшы' : 'шахматист')
  const tipText   = classTip[lang][playerClass] || ''
  const resultRu  = result === 'win' ? 'победа' : result === 'loss' ? 'поражение' : 'ничья'
  const resultKz  = result === 'win' ? 'жеңіс'  : result === 'loss' ? 'жеңіліс'    : 'тең'
  const langName  = lang === 'kz' ? 'казахском' : 'русском'

  const durationLineRu = durationS ? `Длительность: ${Math.floor(durationS / 60)} мин` : ''
  const durationLineKz = durationS ? `Ұзақтығы: ${Math.floor(durationS / 60)} мин` : ''

  const prompt = lang === 'kz'
    ? `Сен — шахмат тренерісің. Партияны талда. ТЕК қазақ тілінде жауап бер.

Ойыншы: ${styleText}
Нәтиже: ${resultKz}
${durationLineKz}
${tipText}

Партияның PGN:
${pgn}

ТЕК жарамды JSON, markdown блоксыз жауап бер:
{
  "rating": <0-100 сан>,
  "summary": "<бір сөйлем — партия қорытындысы>",
  "critical_moment": { "move": "<жүріс нотациясы>", "description": "<1-2 сөйлем>" },
  "best_move": { "move": "<нотация>", "description": "<1 сөйлем>" },
  "style_assessment": "<стиль туралы 1-2 сөйлем>",
  "tip": "<бір нақты кеңес>"
}`
    : `Ты шахматный тренер. Проанализируй партию. Отвечай ТОЛЬКО на ${langName} языке.

Игрок: ${styleText}
Результат: ${resultRu}
${durationLineRu}
${tipText}

PGN партии:
${pgn}

Ответь ТОЛЬКО валидным JSON без markdown-блоков:
{
  "rating": <число 0-100>,
  "summary": "<одно предложение — итог партии>",
  "critical_moment": { "move": "<нотация хода>", "description": "<1-2 предложения>" },
  "best_move": { "move": "<нотация>", "description": "<1 предложение>" },
  "style_assessment": "<1-2 предложения о стиле>",
  "tip": "<один конкретный совет>"
}`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 600,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) throw new Error(`groq ${response.status}`)
    const data = await response.json()
    const text = data.choices[0].message.content.trim()
    const json = text.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '')
    const analysis = JSON.parse(json)
    return res.status(200).json({ analysis })
  } catch (err) {
    console.error('Analyze error:', err)
    const fallback = lang === 'kz'
      ? {
          rating: 55,
          summary: 'Талдау уақытша қол жетімсіз.',
          critical_moment: { move: '—', description: 'Талдау алу мүмкін болмады.' },
          best_move: { move: '—', description: '' },
          style_assessment: 'Ойнауды және жетілдіруді жалғастыр!',
          tip: 'Күн сайын тактикалық тапсырмаларды шеш.',
        }
      : {
          rating: 55,
          summary: 'Анализ временно недоступен.',
          critical_moment: { move: '—', description: 'Не удалось получить анализ.' },
          best_move: { move: '—', description: '' },
          style_assessment: 'Продолжай играть и совершенствоваться!',
          tip: 'Решай тактические задачи ежедневно.',
        }
    return res.status(500).json({ analysis: fallback })
  }
}
