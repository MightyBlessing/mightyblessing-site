const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllPortfolios, getPortfolioBySlug, getPortfolioSlugs, searchPortfolios, getRelatedPortfolios } = require('../lib/content.ts');
const { getProductProjects } = require('../lib/product-projects.ts');
const { selectRailProjects } = require('../lib/project-presentation.ts');

const held = [
  'young-daniel-prayer-2025',
  'fia-welove-2026',
  'ram-worship-recording-2023',
  'wist-2023',
  'africa-messi-2024',
];

test('held cases remain editable but cannot leak through details, search, indexes or recommendations', () => {
  const previous = process.env.NODE_ENV;
  try {
    for (const environment of ['development', 'production']) {
      process.env.NODE_ENV = environment;
      const visible = getAllPortfolios();
      const stored = getAllPortfolios({ includeUnpublished: true });
      assert.equal(stored.length, 38);
      assert.deepEqual(stored.filter(p => p.frontmatter.status === 'archived').map(p => p.slug).sort(), [...held].sort());
      assert.equal(selectRailProjects(visible).length, 30);
      for (const slug of held) {
        const original = getPortfolioBySlug(slug, { includeUnpublished: true });
        assert.ok(original.frontmatter.summary);
        assert.ok(original.frontmatter.our_role);
        assert.equal(getPortfolioBySlug(slug), null, `${environment}: ${slug}`);
        assert.ok(!getPortfolioSlugs().includes(slug));
        for (const query of [original.frontmatter.title, ...original.frontmatter.search_terms]) {
          assert.ok(!searchPortfolios(query).some(p => p.slug === slug), query);
        }
      }
      for (const entry of visible) assert.ok(getRelatedPortfolios(entry.slug).every(p => !held.includes(p.slug)));
      for (const product of ['grapetree', 'live-text']) {
        assert.ok(getProductProjects(product, visible).every(p => !held.includes(p.projectSlug)));
      }
    }
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});
