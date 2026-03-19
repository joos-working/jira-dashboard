export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers['authorization'] || '';
  const { path, ...params } = req.query;
  const qs = new URLSearchParams(params).toString();
  const baseUrl = req.headers['x-jira-url'] || 'https://gonopticsdev.atlassian.net';
  const url = `${baseUrl}${path}${qs ? '?' + qs : ''}`;

  try {
    const upstream = await fetch(url, {
      method: req.method === 'OPTIONS' ? 'GET' : req.method,
      headers: {
        'Authorization': auth,
        'Accept': '*/*',
        ...(req.body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(req.body ? { body: JSON.stringify(req.body) } : {}),
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    const isBinary = !contentType.includes('application/json') && !contentType.includes('text/');

    if (isBinary) {
      const buffer = await upstream.arrayBuffer();
      res.status(upstream.status)
        .setHeader('Content-Type', contentType)
        .send(Buffer.from(buffer));
    } else {
      const body = await upstream.text();
      res.status(upstream.status).setHeader('Content-Type', contentType).send(body);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
