const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildPageMetadata } = require('../lib/seo.ts');
const { serializeJsonLd, buildCapabilitiesJsonLd, buildProjectJsonLd } = require('../lib/structured-data.ts');
const { getPortfolioBySlug } = require('../lib/content.ts');
const sitemap = require('../app/sitemap.ts').default;

test('search metadata, discovery feeds and structured data preserve publication boundaries', () => {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    const page = buildPageMetadata({ title: '공연·행사 기획과 현장 운영', path: '/capabilities' });
    assert.match(page.title, /마이티블레싱/);
    assert.equal(page.alternates.canonical, '/capabilities');
    assert.equal(page.robots.index, true);
    const filtered = buildPageMetadata({ path: '/portfolio', noIndex: true });
    assert.equal(filtered.robots.index, false);
    assert.equal(filtered.robots.googleBot.index, false);
    assert.equal(filtered.robots.follow, true);
    process.env.NODE_ENV = 'development';
    assert.equal(buildPageMetadata({ noIndex: false }).robots.index, false);

    const published = getPortfolioBySlug('welove-case');
    assert.equal(buildProjectJsonLd('draft', { ...published.frontmatter, status: 'draft' }), null);
    const entries = sitemap();
    const projectUrls = entries.filter(entry => /\/portfolio\//.test(entry.url));
    assert.ok(projectUrls.some(entry => entry.url.endsWith('/portfolio/welove-case')));
    for (const entry of projectUrls) {
      assert.equal(getPortfolioBySlug(entry.url.split('/').at(-1)).frontmatter.status, 'published');
    }
    assert.ok(entries.every(entry => !entry.lastModified));

    const project = buildProjectJsonLd('welove-case', published.frontmatter);
    assert.equal(project['@graph'][0]['@type'], 'CreativeWork');
    assert.equal(project['@graph'][0].name, published.frontmatter.title);
    assert.equal(project['@graph'][1].itemListElement.at(-1).item.endsWith('/portfolio/welove-case'), true);
    assert.ok(!('datePublished' in project['@graph'][0]));
    assert.ok(!('dateModified' in project['@graph'][0]));
    assert.equal(buildProjectJsonLd('held', { ...published.frontmatter, status: 'archived' }), null);
    assert.equal(buildCapabilitiesJsonLd()['@graph'].length, 3);

    const maliciousTitle = { name: '</script><script>alert(1)</script>' };
    const serialized = serializeJsonLd(maliciousTitle);
    assert.ok(!serialized.includes('<'));
    assert.deepEqual(JSON.parse(serialized), maliciousTitle);
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});
