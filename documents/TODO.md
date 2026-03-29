# TODO

- Replace the temporary public URL `https://goonline.com.mx` with the final production URL when it is confirmed.
- Update these files when the final URL is available:
  - `src/config/env.js` (`DEFAULT_SITE_URL`)
  - `index.html` (canonical and OG URL/image)
  - `public/robots.txt` (sitemap URL)
  - `public/sitemap.xml` (all `<loc>` and alternate links)
  - Any SEO/operations docs that reference the temporary domain
- After replacing the URL, validate:
  - Canonical tags (only one canonical per page)
  - `hreflang` alternates
  - `robots.txt` sitemap URL
  - Search Console property and sitemap submission
