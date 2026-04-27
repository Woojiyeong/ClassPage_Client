/**
 * Vercel Serverless: 브라우저 → 같은 출처 `/api/classpage/*` → 백엔드 (CORS·Mixed content 회피)
 *
 * Vercel 프로젝트 환경 변수 (Production):
 *   CLASSPAGE_API_ORIGIN=https://xxx.onrender.com
 * (끝 슬래시 없이, Nest에 /api 프리픽스가 있으면 https://host/api 까지)
 */
export default async function handler(req, res) {
  const origin = process.env.CLASSPAGE_API_ORIGIN?.trim();
  if (!origin) {
    res.status(503).json({
      message:
        'CLASSPAGE_API_ORIGIN 이 Vercel 환경 변수에 없습니다. Render 등 API 주소를 넣어 주세요.',
    });
    return;
  }

  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '/', `http://${host}`);
  const prefix = '/api/classpage';
  if (!url.pathname.startsWith(prefix)) {
    res.status(404).send('Not Found');
    return;
  }

  let rest = url.pathname.slice(prefix.length);
  if (!rest.startsWith('/')) rest = `/${rest}`;
  if (rest === '') rest = '/';

  const targetBase = origin.replace(/\/$/, '');
  const targetUrl = `${targetBase}${rest}${url.search}`;

  const forwardHeaders = new Headers();
  const skip = new Set(['host', 'connection', 'content-length']);
  for (const [k, v] of Object.entries(req.headers)) {
    if (!v || skip.has(k.toLowerCase())) continue;
    if (Array.isArray(v)) {
      for (const item of v) forwardHeaders.append(k, item);
    } else {
      forwardHeaders.set(k, v);
    }
  }

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (typeof req.body === 'string') body = req.body;
    else if (Buffer.isBuffer(req.body)) body = req.body;
    else if (req.body != null) body = JSON.stringify(req.body);
  }

  let upstream;
  try {
    upstream = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
      redirect: 'manual',
    });
  } catch (e) {
    res.status(502).json({
      message: '백엔드에 연결하지 못했습니다.',
      detail: String(e?.message || e),
    });
    return;
  }

  res.status(upstream.status);
  upstream.headers.forEach((value, key) => {
    const lk = key.toLowerCase();
    if (lk === 'transfer-encoding' || lk === 'content-encoding') return;
    res.setHeader(key, value);
  });

  const buf = Buffer.from(await upstream.arrayBuffer());
  res.send(buf);
}
