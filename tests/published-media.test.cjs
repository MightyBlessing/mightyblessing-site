const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getAllPortfolios, getPortfolioBySlug } = require('../lib/content.ts');
const { imageSrcSet } = require('../lib/project-presentation.ts');
const { getHomeFilm } = require('../lib/home-film.ts');
const { markdownImageSources } = require('../lib/markdown-media.ts');
const { featuredProducts } = require('../lib/company-content.ts');

test('published event media and home film ship as static files without development endpoints', () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    const events = getAllPortfolios().filter(p => p.frontmatter.schemaVersion === 2);
    assert.equal(events.length, 30);
    const urls = new Set();
    for (const { slug, frontmatter: p } of events) {
      const media = [p.thumbnail, p.heroMedia?.url, p.heroMedia?.poster, ...p.gallery.flatMap(m => [m.url, m.poster]), ...markdownImageSources(getPortfolioBySlug(slug).content)].filter(Boolean);
      for (const url of media) {
        assert.doesNotMatch(url, /^\/api\//);
        urls.add(url);
        for (const entry of (imageSrcSet(url) || '').split(', ').filter(Boolean)) urls.add(entry.split(' ')[0]);
      }
    }
    const film = getHomeFilm(events);
    assert.ok(film);
    for (const key of ['desktop', 'mobile', 'posterDesktop', 'posterMobile']) urls.add(film[key].split('?')[0]);
    for (const product of featuredProducts) for (const name of [product.ui, product.field]) urls.add(`/media/products/${name}.webp`);
    for (const url of urls) {
      assert.ok(url.startsWith('/media/'), url);
      assert.ok(fs.statSync(path.join(process.cwd(), 'public', url)).size > 0, url);
    }
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous;
  }
});
