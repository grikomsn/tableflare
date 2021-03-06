/* global AIRTABLE_BASE, AIRTABLE_KEY, DEFAULT_REDIRECT, TABLE_NAME */

// @ts-check
/// <reference path="./env.d.ts" />

addEventListener("fetch", async (/** @type {FetchEvent} */ event) => {
  event.respondWith(tableflare(event));
});

async function tableflare(/** @type {FetchEvent} */ event) {
  const url = new URL(event.request.url);

  const cache = caches.default;
  const cacheKey = new Request(url.toString(), event.request);
  const cachedResponse = await cache.match(cacheKey);
  if (cachedResponse) return cachedResponse;

  if (url.pathname == "/") {
    const response = Response.redirect(DEFAULT_REDIRECT, 307);
    event.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  }

  const slug = url.pathname.split("/")[1];
  if (slug) {
    const query = new URLSearchParams({ filterByFormula: `AND(Slug="${slug}",Active)`, "fields[]": "URL" }).toString();
    const endpoint = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${TABLE_NAME}?${query}`;
    const result = await fetch(endpoint, { headers: { Authorization: `Bearer ${AIRTABLE_KEY}` } });

    const data = await result.json();
    const redirectUrl = data.records[0]?.fields.URL;

    if (redirectUrl) {
      const response = Response.redirect(redirectUrl, 307);
      if (url.searchParams.has("force")) {
        event.waitUntil(cache.delete(cacheKey));
      }
      event.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    }
  }

  return new Response(null, { status: 404 });
}
