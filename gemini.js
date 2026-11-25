// وسيط Vercel: المفتاح يبقى هنا في الخادم ولا يظهر أبداً في الموقع
const MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'POST only' } });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: { message: 'GEMINI_API_KEY غير مضاف في إعدادات Vercel' } });

  const { model, payload } = req.body || {};
  if (!MODELS.includes(model) || !payload) return res.status(400).json({ error: { message: 'طلب غير صالح' } });
  if (payload.generationConfig) payload.generationConfig.maxOutputTokens = Math.min(payload.generationConfig.maxOutputTokens || 4096, 8192);

  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(payload)
    });
    const data = await r.json().catch(() => ({}));
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: { message: 'تعذر الاتصال بـ Google' } });
  }
};
