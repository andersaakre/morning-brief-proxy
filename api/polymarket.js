export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // POST → proxy to Anthropic
  if (req.method === "POST") {
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "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",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(req.body),
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // GET → proxy to Polymarket
  const params = new URLSearchParams(req.query);
  const upstream = `https://gamma-api.polymarket.com/public-search?${params.toString()}`;
  try {
    const r = await fetch(upstream);
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
