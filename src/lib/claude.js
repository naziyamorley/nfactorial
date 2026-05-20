const CLASS_STYLE = {
  ru: {
    attacker:  'агрессивный атакующий, любит жертвы и инициативу',
    defender:  'защитник, ценит крепкие позиции и контригру',
    tactician: 'тактик и стратег, специалист по эндшпилю',
  },
  kz: {
    attacker:  'агрессиялы шабуылдаушы, құрбандық пен бастамашылықты ұнатады',
    defender:  'қорғаушы, мықты позициялар мен қарсы ойынды бағалайды',
    tactician: 'тактик және стратег, эндшпиль маманы',
  },
}

const MOCK_CHAT = {
  ru: [
    'контроль центра — ключ к успеху. старайся держать пешки на d4 и e4, чтобы ограничить соперника.',
    'хороший вопрос. этот ход ослабил пешечную структуру — в эндшпиле это аукнется. лучше было сначала завершить развитие.',
    'тактическое зрение развивается задачами. реши хотя бы 5 задач в день — через месяц почувствуешь разницу.',
    'активность фигур важнее лишней пешки. иногда стоит отдать материал, но захватить инициативу.',
    'конь на краю доски слаб — держи его ближе к центру, на сильных полях.',
  ],
  kz: [
    'орталықты бақылау — табыстың кілті. қарсыласыңды шектеу үшін пешкаларды d4 пен e4-те ұстауға тырыс.',
    'жақсы сұрақ. бұл жүріс пешка құрылымын әлсіретті — эндшпильде сезіледі. алдымен дамуды аяқтаған дұрыс еді.',
    'тактикалық көру тапсырмалармен дамиды. күніне кемінде 5 тапсырма шеш — бір айдан кейін айырманы сезесің.',
    'фигуралардың белсенділігі артық пешкадан маңыздырақ. кейде материал беріп, бастамашылықты алу керек.',
    'тақта шетіндегі ат әлсіз — оны орталыққа, мықты алаңдарға жақын ұста.',
  ],
}

function mockAnalysis(result, playerClass, lang = 'ru') {
  const ratings = { win: 72, draw: 61, loss: 48 }
  const dict = {
    ru: {
      summaries: {
        win:  'уверенная партия с чёткой реализацией преимущества в эндшпиле.',
        draw: 'равная борьба — обе стороны не допустили решающих ошибок.',
        loss: 'позиция была перспективной, но тактическая ошибка в миттельшпиле всё решила.',
      },
      tips: {
        attacker:  'перед жертвой фигуры всегда считай варианты минимум на 3 хода вперёд.',
        defender:  'не торопись с контратакой — сначала полностью нейтрализуй угрозы.',
        tactician: 'в эндшпиле активность короля важнее материального преимущества.',
      },
      critical: 'этот ход позволил сопернику перехватить инициативу. лучше было сначала укрепить позицию ходом bf4.',
      best:     'отличная жертва качества, которая вскрыла позицию короля соперника.',
      styleA:   'сегодня ты играл как',
      styleB:   'опытный шахматист',
      styleC:   '. дебют разыгран грамотно, но в миттельшпиле темп потерян.',
      tipFallback: 'решай тактические задачи ежедневно — это лучший способ улучшить игру.',
    },
    kz: {
      summaries: {
        win:  'эндшпильде артықшылықты нақты жүзеге асырған сенімді партия.',
        draw: 'тең күрес — екі жақ та шешуші қателіктер жібермеді.',
        loss: 'позиция тиімді еді, бірақ миттельшпильдегі тактикалық қате бәрін шешті.',
      },
      tips: {
        attacker:  'фигураны құрбандыққа берерден бұрын кемінде 3 жүріс алдын-ала есепте.',
        defender:  'қарсы шабуылға асықпа — алдымен қауіптерді толық бейтараптандыр.',
        tactician: 'эндшпильде патшаның белсенділігі материалдық артықшылықтан маңыздырақ.',
      },
      critical: 'бұл жүріс қарсыласқа бастамашылықты алуға мүмкіндік берді. алдымен bf4 жүрісімен позицияны бекіту керек еді.',
      best:     'қарсыластың патша позициясын ашқан тамаша сапа құрбандығы.',
      styleA:   'бүгін сен',
      styleB:   'тәжірибелі шахматшы',
      styleC:   ' сияқты ойнадың. дебют сауатты ойналды, бірақ миттельшпильде темп жоғалды.',
      tipFallback: 'тактикалық тапсырмаларды күн сайын шеш — бұл ойынды жақсартудың ең жақсы тәсілі.',
    },
  }
  const d = dict[lang] || dict.ru
  const cs = CLASS_STYLE[lang]?.[playerClass] || d.styleB
  return {
    rating: ratings[result] ?? 55,
    summary: d.summaries[result],
    critical_moment: { move: '14. nd5', description: d.critical },
    best_move:       { move: '22. rxe6', description: d.best },
    style_assessment: `${d.styleA} ${cs}${d.styleC}`,
    tip: d.tips[playerClass] ?? d.tipFallback,
  }
}

export async function analyzeGame({ pgn, playerClass, result, durationS, lang = 'ru' }) {
  try {
    const res = await fetch('/api/analyze-groq', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pgn, playerClass, result, durationS, lang }),
    })
    const data = await res.json()
    if (data.analysis) return data.analysis
    throw new Error('no analysis')
  } catch (err) {
    console.warn('analyze error, using mock:', err.message)
    return mockAnalysis(result, playerClass, lang)
  }
}

export async function chatWithCoach({ messages, pgn, playerClass, result, analysis, lang = 'ru' }) {
  const hasGameContext = !!(pgn || analysis)
  const langName = lang === 'kz' ? 'казахском' : 'русском'
  const profile  = CLASS_STYLE[lang]?.[playerClass] || (lang === 'kz' ? 'әмбебап ойыншы' : 'универсальный игрок')

  const resultWord = lang === 'kz'
    ? (result === 'win' ? 'жеңіс' : result === 'loss' ? 'жеңіліс' : 'тең')
    : (result === 'win' ? 'победа' : result === 'loss' ? 'поражение' : 'ничья')

  const systemPrompt = `Ты — шахматный тренер в приложении Chessy. Твоя единственная роль — помогать игроку улучшать шахматную игру.

СТРОГИЕ ПРАВИЛА:
- Отвечай ТОЛЬКО на ${langName} языке. Никогда не используй другие языки.
- Отвечай ТОЛЬКО на вопросы о шахматах. Если вопрос не о шахматах — откажи.
- Отвечай кратко: 2-4 предложения. Без воды.
- Не выдумывай ходы или позиции, которых нет в данных.

ПРОФИЛЬ ИГРОКА: ${profile}
${hasGameContext
    ? `ПАРТИЯ: результат ${resultWord}${analysis ? `, оценка ${analysis.rating}/100, ${analysis.summary}` : ''}${pgn ? `\nPGN: ${pgn.slice(0, 400)}` : ''}`
    : 'Отвечай на общие вопросы о шахматах.'}`

  const apiMessages = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-8)

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: apiMessages, systemPrompt }),
    })
    if (!res.ok) throw new Error(`api ${res.status}`)
    const data = await res.json()
    if (!data.content) throw new Error('empty response')
    return data.content
  } catch (err) {
    console.warn('chat error:', err.message)
    const pool = MOCK_CHAT[lang] || MOCK_CHAT.ru
    return pool[Math.floor(Math.random() * pool.length)]
  }
}
