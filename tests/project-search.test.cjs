const test = require('node:test');
const assert = require('node:assert/strict');
const { getAllPortfolios } = require('../lib/content.ts');
const { selectIndexProjects } = require('../lib/project-presentation.ts');
const { searchProjects } = require('../lib/project-search.ts');

test('archive combines aliases, event type and year without widening publication scope', () => {
  const previous = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'development';
    const index = selectIndexProjects(getAllPortfolios());
    assert.equal(index.length, 30);
    assert.ok(index.every(entry => entry.frontmatter.categories.length));
    assert.deepEqual(searchProjects(index, { query: 'ＣＢＳ 익산', category: '라이브 공연', year: '2024' }).map(p => p.slug), ['cbs-iksan-2024']);
    assert.equal(searchProjects(index, { query: 'CBS 익산', year: '2025' }).length, 0);
    assert.equal(searchProjects(index, { category: '등록되지 않은 유형' }).length, 0);
    assert.equal(searchProjects(index, { year: '202' }).length, 0);
    assert.deepEqual(searchProjects(index, { category: '온라인 행사', year: '2020' }).map(p => p.slug), ['digital-bible-conference-2020', 'kouny-online-worship-2020']);
    assert.ok(searchProjects(index, { query: 'LED', year: '2024' }).some(p => p.slug === 'cbs-iksan-2024'));
    assert.equal(searchProjects(index, { query: 'F.I.A' }).length, 0);
    process.env.NODE_ENV = 'production';
    const publicIndex = selectIndexProjects(getAllPortfolios());
    assert.equal(searchProjects(publicIndex, {}).length, 3);
    assert.ok(searchProjects(publicIndex, { query: 'CAMPUS' }).every(p => p.frontmatter.status === 'published' && p.slug !== 'campus-worship-2026'));
  } finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
});
