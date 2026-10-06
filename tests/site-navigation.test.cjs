const { test } = require('node:test');
const assert = require('node:assert/strict');
const { siteNavigation, hasPublicSiteFrame, blogUrl } = require('../lib/site-navigation.ts');

test('public company navigation has independent destinations while review anchors remain local', () => {
  const actual = siteNavigation();
  const review = siteNavigation(true);
  assert.deepEqual(actual.map(link => link.href), ['/portfolio', '/capabilities', '/about', '/products', '/inquiry', blogUrl]);
  assert.deepEqual(review.filter(link => link.section).map(link => link.href), ['#capabilities', '#about', '#products']);
  assert.deepEqual(actual.map(link => link.label), review.map(link => link.label));
});

test('public shell includes actual routes and nested project URLs but excludes admin, APIs and review boards', () => {
  for (const path of ['/', '/portfolio', '/portfolio/campus-worship-2026', '/about', '/capabilities', '/products', '/inquiry', '/privacy', '/terms']) assert.equal(hasPublicSiteFrame(path), true, path);
  for (const path of ['/admin', '/admin/portfolio/new', '/api/inquiry', '/design-system', '/portfolio-copy', '/inquiry-extra']) assert.equal(hasPublicSiteFrame(path), false, path);
});
