// Vercel Serverless Function — ดึงข้อมูล Yahoo Finance ฝั่ง server
// ไม่มี CORS ปัญหา เพราะ server ดึงตรงแล้ว serve ให้ browser

export default async function handler(req, res) {
  // Allow CORS จาก browser ของ user เอง
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  const { ticker, range = '6mo', interval = '1d' } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: 'ticker required' });
  }

  const symbol = ticker.toUpperCase().endsWith('.BK') ? ticker.toUpperCase() : `${ticker.toUpperCase()}.BK`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Yahoo returned ${response.status}` });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
