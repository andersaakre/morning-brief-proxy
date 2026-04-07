export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // POST → Anthropic
  if (req.method === "POST") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
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

  // GET → Guardian or Polymarket based on ?source= param
  const { source, ...rest } = req.query;

  if (source === "guardian") {
    const params = new URLSearchParams(rest);
    params.set("api-key", "f683c062-cebb-43ee-9382-faab28e3f0fc");
    params.set("show-fields", "headline,trailText");
    params.set("order-by", "newest");
    params.set("page-size", "5");
    const upstream = `https://content.guardianapis.com/search?${params.toString()}`;
    try {
      const r = await fetch(upstream);
      const data = await r.json();
      return res.status(r.status).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // Default → Polymarket
  const params = new URLSearchParams(rest);
  const upstream = `https://gamma-api.polymarket.com/public-search?${params.toString()}`;
  try {
    const r = await fetch(upstream);
    const data = await r.json();
    return res.status(r.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
