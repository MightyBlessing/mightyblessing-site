const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Render the actual home/internal shells without a running Next router or CSS loader.
let pathname = '/';
const originalLoad = Module._load;
Module._load = function (request, ...args) {
  if (request === 'next/navigation') return { usePathname: () => pathname };
  return originalLoad.call(this, request, ...args);
};
require.extensions['.css'] = () => {};
require.extensions['.tsx'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    fileName: filename,
  }).outputText, filename);
};
const { Header } = require('../components/Header.tsx');
const { SiteFrame } = require('../components/redesign/SiteFrame.tsx');
const { getAllPortfolios } = require('../lib/content.ts');
const { selectRailProjects, groupProjectsByYear } = require('../lib/project-presentation.ts');

function withEnvironment(value, run) {
  const previous = process.env.NODE_ENV;
  try { process.env.NODE_ENV = value; run(); }
  finally { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; }
}
function renderIndexes(projects, preview = false) {
  return ['desktop', 'mobile'].map(surface => {
    const html = renderToStaticMarkup(React.createElement(surface === 'desktop' ? SiteFrame : Header, { projects, preview }));
    const nav = html.match(new RegExp(`<nav[^>]*data-project-index="${surface}"[^>]*>([\\s\\S]*?)</nav>`))?.[1];
    assert.ok(nav, surface);
    return { surface, nav, slugs: [...nav.matchAll(/href="\/portfolio\/([^"]+)"/g)].map(match => match[1]) };
  });
}

test('home, archive, company and mobile shells render every event in the same order, including text-only work', () => withEnvironment('development', () => {
  const projects = selectRailProjects(getAllPortfolios());
  assert.equal(projects.length, 30);
  for (const route of ['/', '/portfolio', '/about', '/products']) {
    pathname = route;
    for (const {surface, slugs, nav} of renderIndexes(projects)) {
      assert.deepEqual(slugs, projects.map(p => p.slug), `${route} ${surface}`);
      assert.equal(new Set(slugs).size, 30);
      assert.ok(!slugs.includes('fia-welove-2026'));
      assert.ok(slugs.includes('kouny-online-worship-2020'));
      assert.equal(slugs.at(-1), 'kouny-online-worship-2020');
      assert.equal((nav.match(/년 프로젝트/g) || []).length, 7);
    }
  }
}));

test('a deep detail marks only the matching event in both indexes and the design preview retains all events', () => withEnvironment('development', () => {
  const projects = selectRailProjects(getAllPortfolios());
  pathname = '/portfolio/kouny-online-worship-2020';
  for (const {nav} of renderIndexes(projects)) {
    assert.equal((nav.match(/aria-current="page"/g) || []).length, 1);
    const active = nav.match(/<a[^>]*aria-current="page"[^>]*>/)?.[0];
    assert.match(active, /href="\/portfolio\/kouny-online-worship-2020"/);
  }
  pathname = '/design-system';
  for (const {slugs} of renderIndexes(projects, true)) assert.deepEqual(slugs, projects.map(p => p.slug));
}));

test('production home shells contain only the published set and do not fill the index with review drafts', () => withEnvironment('production', () => {
  pathname = '/';
  const projects = selectRailProjects(getAllPortfolios());
  for (const {slugs} of renderIndexes(projects)) {
    assert.equal(slugs.length, 30);
    assert.deepEqual(slugs, groupProjectsByYear(projects).flatMap(group => group.projects.map(p => p.slug)));
    assert.ok(!slugs.includes('fia-welove-2026'));
  }
}));
