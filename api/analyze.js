import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { pgn, playerClass, result, durationS } = req.body;

  if (!pgn) {
    return res.status(400).json({ error: "PGN required" });
  }

  const classDescriptions = {
    attacker: "агрессивный игрок-атакующий, любит жертвы и инициативу",
    defender: "защитник, предпочитает крепкие позиции и контригру",
    tactician: "тактик и стратег, специализируется на эндшпиле",
  };

  const classBonus = {
    attacker: "Оцени агрессивность и тактические жертвы.",
    defender: "Оцени надёжность позиции и защитные навыки.",
    tactician: "Оцени стратегическое планирование и технику эндшпиля.",
  };

  const prompt = `Ты опытный шахматный тренер. Проанализируй партию и дай краткий, конкретный разбор на русском языке.

Игрок: ${classDescriptions[playerClass] || "шахматист"}
Результат: ${result === "win" ? "Победа" : result === "loss" ? "Поражение" : "Ничья"}
Длительность: ${durationS ? Math.floor(durationS / 60) + " мин" : "неизвестно"}

PGN партии:
${pgn}

${classBonus[playerClass] || ""}

Ответь строго в формате JSON (без markdown, только JSON):
{
  "rating": <число от 0 до 100, оценка качества игры>,
  "summary": "<одно предложение — общий вывод>",
  "critical_moment": {
    "move": "<номер хода и нотация, например '14. Nd5'>",
    "description": "<что произошло и почему это важно, 1-2 предложения>"
  },
  "best_move": {
    "move": "<лучший ход партии>",
    "description": "<почему это был отличный ход, 1 предложение>"
  },
  "style_assessment": "<оценка стиля игры в этой партии, 1-2 предложения>",
  "tip": "<конкретный совет для следующей партии, 1 предложение>"
}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].text.trim();
    // Strip any accidental markdown fences
    const jsonStr = text.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");
    const analysis = JSON.parse(jsonStr);

    return res.status(200).json({ analysis });
  } catch (err) {
    console.error("Claude API error:", err);
    return res.status(500).json({
      error: "Analysis failed",
      analysis: {
        rating: 50,
        summary: "Анализ временно недоступен.",
        critical_moment: {
          move: "—",
          description: "Не удалось получить анализ.",
        },
        best_move: { move: "—", description: "" },
        style_assessment: "Продолжай играть!",
        tip: "Практикуй эндшпиль каждый день.",
      },
    });
  }
}
