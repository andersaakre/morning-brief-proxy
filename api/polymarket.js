export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { path = "public-search", ...params } = req.query;
  const qs = new URLSearchParams(params).toString();
  const upstream = `https://gamma-api.polymarket.com/${path}${qs ? "?" + qs : ""}`;

  try {
    const upstream_res = await fetch(upstream);
    const data = await upstream_res.json();
    res.status(upstream_res.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
