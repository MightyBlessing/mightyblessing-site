const { test } = require('node:test');
const assert = require('node:assert/strict');
const { homeLocationAt } = require('../lib/home-location.ts');

test('home location follows viewport boundaries, not menu order or a stale hash', () => {
  const sections = [
    { id: 'home', top: -900, bottom: -24 },
    { id: 'work', top: 12, bottom: 120 },
    { id: 'capabilities', top: 120, bottom: 620 },
    { id: 'products', top: 750, bottom: 1400 },
    { id: 'about', top: 1500, bottom: 1900 },
  ];
  assert.equal(homeLocationAt(sections, 119), 'work');
  assert.equal(homeLocationAt(sections, 120), 'capabilities');
  assert.equal(homeLocationAt(sections, 700), null);
  assert.equal(homeLocationAt(sections, 800), 'products');
  assert.equal(homeLocationAt(sections, 1600), 'about');
  assert.equal(homeLocationAt(sections, 1900), null);
  assert.equal(homeLocationAt([], 100), null);
});

test('reading the first scene and unlinked work never selects a company section', () => {
  assert.equal(homeLocationAt([{ id: 'home', top: 12, bottom: 888 }], 124), 'home');
  assert.equal(homeLocationAt([{ id: 'work', top: -80, bottom: 650 }], 124), 'work');
  assert.equal(homeLocationAt([{ id: 'contact', top: 24, bottom: 600 }], 124), 'contact');
});
