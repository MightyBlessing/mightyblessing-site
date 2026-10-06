const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllPortfolios } = require('../lib/content.ts');
const { getProductProjects, getProjectProducts } = require('../lib/product-projects.ts');

function withEnvironment(value, callback) {
  const previous = process.env.NODE_ENV;
  try { process.env.NODE_ENV = value; callback(); }
  finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
}

test('production product recommendations cannot reveal unpublished application records', () => withEnvironment('production', () => {
  const publicProjects = getAllPortfolios();
  assert.equal(publicProjects.length, 3);
  assert.deepEqual(getProductProjects('grapetree', publicProjects), []);
  assert.deepEqual(getProductProjects('live-text', publicProjects), []);
}));

test('recommendations honor the supplied visible collection and preserve its records', () => withEnvironment('development', () => {
  const campus = getAllPortfolios().find(({ slug }) => slug === 'campus-worship-2026');
  const before = JSON.stringify(campus);
  const result = getProductProjects('grapetree', [campus]);
  assert.equal(result.length, 1);
  assert.equal(result[0].project, campus.frontmatter);
  assert.deepEqual(result[0].project.excludedRoles, ['음향']);
  assert.equal(JSON.stringify(campus), before);
  assert.deepEqual(getProductProjects('grapetree', []), []);
}));

test('partial check-in work is not promoted to registration or a LIVE TEXT application', () => {
  const fia = getProjectProducts('fia-welove-2026');
  assert.equal(fia.length, 1);
  assert.equal(fia[0].productId, 'grapetree');
  assert.match(fia[0].usage, /현장 QR 체크인/);
  assert.doesNotMatch(fia[0].usage, /사전 등록/);
  assert.deepEqual(getProjectProducts('unrelated-event'), []);
});

test('confirmed reconciliation and revival applications preserve each registration scope', () => {
  const reconciliation = getProjectProducts('welove-reconciliation-2026');
  assert.deepEqual(reconciliation.map(item => item.productId), ['grapetree', 'live-text']);
  assert.match(reconciliation[0].usage, /사전 등록과 현장 QR 체크인/);
  const revival = getProjectProducts('love-and-revival-2025');
  assert.deepEqual(revival.map(item => item.productId), ['grapetree']);
  assert.match(revival[0].usage, /현장 QR 체크인/);
  assert.doesNotMatch(revival[0].usage, /사전 등록/);
});
