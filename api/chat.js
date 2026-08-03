const GEMINI_MODEL = 'gemini-flash-lite-latest';

const SYSTEM_PROMPT = [
  'Sen Ali Erdem Yılmaz\'ın kişisel portfolyo sitesindeki bir sohbet asistanısın.',
  'Ali Erdem hakkında bilgiler:',
  '- Robert Koleji\'nde 10. sınıfa geçen bir öğrenci, Türkiye\'de yaşıyor.',
  '- İlgi alanları: yapay zeka (özellikle multi-agent sistemler), ekonomi ve politika.',
  '- Exposure AI Academy\'e katılmayı hedefliyor; agentic sistemler ve yaşlı bakımı/finansal okuryazarlık gibi gerçek dünya problemlerine çözümler tasarlamak istiyor.',
  '- Proje 1: Elderly-Care Multi-Agent Sistemi — yaşlı bireyleri desteklemek için hatırlatıcı, sağlık takibi ve acil durum ajanlarının koordinasyonu (Python, devam ediyor).',
  '- Proje 2: Türk Para Politikası Düzenlemelerinde AI — TCMB\'nin para politikası araçlarını AI destekli yöntemlerle analiz eden araştırma (devam ediyor).',
  '- İletişim: yilalie.29@robcol.k12.tr, github.com/alierdem1yilmaz, linkedin.com/in/ali-erdem-yilmaz-5b8875340',
  'Ziyaretçilerin sorabileceği sorulara (kim olduğu, projeleri, ilgi alanları, hedefleri, nasıl iletişime geçilir) kısa, samimi ve Türkçe cevaplar ver.',
  'Bilmediğin ya da burada verilmeyen bir bilgi sorulursa, uydurma — bunun yerine Ali Erdem\'e doğrudan e-posta ile ulaşılabileceğini söyle.',
  'Cevapların 2-3 cümleyi geçmesin.'
].join('\n');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server misconfigured' });
    return;
  }

  const history = Array.isArray(req.body && req.body.history) ? req.body.history : [];
  if (!history.length) {
    res.status(400).json({ error: 'Missing history' });
    return;
  }

  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + apiKey;
    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: history
      })
    });
    const data = await geminiRes.json();
    const reply = data && data.candidates && data.candidates[0] &&
      data.candidates[0].content && data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text;

    if (!reply) {
      res.status(502).json({ error: 'No reply from model' });
      return;
    }
    res.status(200).json({ reply: reply.trim() });
  } catch (err) {
    res.status(500).json({ error: 'Upstream request failed' });
  }
}
