const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');
const { DEVELOPMENT_ADMIN_EMAIL, getAdminAuthConfig, getAdminEmails, getAdminSessionSecret } = require('../lib/admin/env.ts');
const { createSessionToken, verifySessionToken, verifyAdminSessionToken } = require('../lib/admin/auth.ts');
const { getAdminRepository } = require('../lib/admin/repository.ts');
const { GET: googleStart } = require('../app/api/admin/auth/google/start/route.ts');
const { GET: googleCallback } = require('../app/api/admin/auth/google/callback/route.ts');
const { POST: developmentLogin } = require('../app/api/admin/auth/dev/route.ts');
const { proxy } = require('../proxy.ts');
const { ADMIN_SESSION_COOKIE } = require('../lib/admin/constants.ts');
const { OAUTH_STATE_COOKIE } = require('../lib/admin/google-oauth.ts');
const { adminLoginDestination } = require('../lib/admin/redirect.ts');

test('login destinations only allow real local admin routes', () => {
  for (const unsafe of [undefined, null, ['admin'], 'javascript:alert(1)', 'data:text/html,test', '//evil.invalid', '/\\evil.invalid', 'https://evil.invalid/admin', '/admin/login', '/admin/../inquiry', '/admin%2f..%2f..%2fevil', '/admin\n', '/administer', '/api/admin/portfolio', '/admin/%']) assert.equal(adminLoginDestination(unsafe),'/admin');
  for (const safe of ['/admin','/admin/products','/admin/products/grapetree','/admin/products/live-text','/admin/products/twoline','/admin/portfolio/new','/admin/portfolio/campus-worship-2026?view=edit#media']) assert.equal(adminLoginDestination(safe),safe);
});

const operator = 'operator@example.com';
const configured = {
  NODE_ENV: 'production', ADMIN_EMAILS: ` ${operator}, Second.Operator@example.com `,
  ADMIN_SESSION_SECRET: 'test-only-configured-session-secret',
  GOOGLE_OAUTH_CLIENT_ID: 'test-client-id', GOOGLE_OAUTH_CLIENT_SECRET: 'test-client-secret',
  NEXT_PUBLIC_SITE_URL: 'https://example.invalid',
};
const environmentKeys = ['NODE_ENV', 'ADMIN_EMAILS', 'ADMIN_SESSION_SECRET', 'GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET', 'NEXT_PUBLIC_SITE_URL', 'GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH'];
async function withEnvironment(values, run) {
  const previous = Object.fromEntries(environmentKeys.map(key => [key, process.env[key]]));
  try {
    for (const key of environmentKeys) {
      if (values[key] === undefined) delete process.env[key];
      else process.env[key] = values[key];
    }
    return await run();
  } finally {
    for (const key of environmentKeys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
}
function adminRequest(pathname, token) {
  return new NextRequest(`http://example.invalid${pathname}`, {
    headers: token ? { cookie: `${ADMIN_SESSION_COOKIE}=${token}` } : {},
  });
}
function callbackRequest(query, stateCookie) {
  return new NextRequest(`http://internal:3000/api/admin/auth/google/callback?${new URLSearchParams(query)}`, {
    headers: stateCookie ? { cookie: `${OAUTH_STATE_COOKIE}=${stateCookie}` } : {},
  });
}
function loginError(response) {
  const location = new URL(response.headers.get('location'));
  return location.pathname === '/admin/login' ? location.searchParams.get('error') : null;
}
// Google's token and userinfo endpoints, answering with the given profile.
async function withGoogle(profile, run) {
  const originalFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options = {}) => {
    calls.push(String(url));
    if (String(url).startsWith('https://oauth2.googleapis.com/token')) {
      assert.equal(new URLSearchParams(options.body).get('redirect_uri'), 'https://example.invalid/api/admin/auth/google/callback');
      return profile ? Response.json({ access_token: 'test-access-token' }) : new Response('', { status: 500 });
    }
    if (String(url).startsWith('https://openidconnect.googleapis.com/')) return Response.json(profile);
    throw new Error(`Unexpected request ${url}`);
  };
  try { return await run(calls); } finally { global.fetch = originalFetch; }
}

test('admin addresses are normalised and the development address exists only in development', async () => {
  await withEnvironment(configured, async () => assert.deepEqual(getAdminEmails(), [operator, 'second.operator@example.com']));
  await withEnvironment({ ...configured, NODE_ENV: 'development' }, async () => assert.ok(getAdminEmails().includes(DEVELOPMENT_ADMIN_EMAIL)));
  for (const NODE_ENV of [undefined, 'test', 'production']) {
    await withEnvironment({ NODE_ENV }, async () => {
      assert.equal(getAdminEmails(), null);
      assert.equal(getAdminSessionSecret(), null);
      assert.equal(getAdminAuthConfig(), null);
    });
  }
});

test('issued sessions authorize listed addresses and retain signature, expiry and identity checks', async () => {
  await withEnvironment(configured, async () => {
    const token = await createSessionToken('second.operator@example.com', configured.ADMIN_SESSION_SECRET);
    assert.equal((await verifyAdminSessionToken(token)).userId, 'second.operator@example.com');
    assert.equal((await proxy(adminRequest('/api/admin/portfolio', token))).headers.get('x-middleware-next'), '1');
    assert.equal(await verifyAdminSessionToken(token.replace('second.operator', 'other.operator')), null);
    assert.equal(await verifyAdminSessionToken(token.replace(/\.\d+\./, '.1.')), null);
    assert.equal(await verifySessionToken(token, 'wrong-secret'), null);
  });
});

test('production refuses sign-in and existing sessions when any authentication setting is missing or blank', async () => {
  const token = await createSessionToken(operator, configured.ADMIN_SESSION_SECRET);
  for (const key of ['ADMIN_EMAILS', 'ADMIN_SESSION_SECRET', 'GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_OAUTH_CLIENT_SECRET']) {
    for (const missing of [undefined, '   ']) {
      await withEnvironment({ ...configured, [key]: missing }, async () => {
        if (key.startsWith('ADMIN_')) {
          assert.equal(getAdminAuthConfig(), null);
          assert.equal(await verifyAdminSessionToken(token), null);
        }
        const response = await googleStart(new Request('http://internal:3000/api/admin/auth/google/start'));
        assert.equal(loginError(response), 'config');
        assert.equal(response.cookies.get(ADMIN_SESSION_COOKIE), undefined);
      });
    }
  }
});

test('production also rejects the development and documented example session secrets', async () => {
  const developmentSecret = await withEnvironment({ NODE_ENV: 'development' }, async () => getAdminSessionSecret());
  for (const secret of [developmentSecret, 'change-this-secret']) {
    await withEnvironment({ ...configured, ADMIN_SESSION_SECRET: secret }, async () => {
      assert.equal(getAdminAuthConfig(), null);
      assert.equal(loginError(await googleStart(new Request('http://internal:3000/api/admin/auth/google/start'))), 'config');
    });
  }
});

test('development login is available only in explicit development mode', async () => {
  const request = () => new Request('http://localhost:3000/api/admin/auth/dev?next=/admin/products', { method: 'POST', headers: { origin: 'http://localhost:3000' } });
  for (const NODE_ENV of [undefined, 'test', 'production']) {
    await withEnvironment({ ...configured, NODE_ENV }, async () => {
      const response = await developmentLogin(request());
      assert.equal(response.status, 404);
      assert.equal(response.headers.get('set-cookie'), null);
    });
  }
  await withEnvironment({ NODE_ENV: 'development' }, async () => {
    const response = await developmentLogin(request());
    assert.equal(response.status, 303);
    assert.equal(new URL(response.headers.get('location')).pathname, '/admin/products');
    assert.equal((await verifyAdminSessionToken(response.cookies.get(ADMIN_SESSION_COOKIE).value)).userId, DEVELOPMENT_ADMIN_EMAIL);
    assert.equal((await developmentLogin(new Request('http://localhost:3000/api/admin/auth/dev', { method: 'POST', headers: { origin: 'https://attacker.invalid' } }))).status, 403);
  });
});

test('Google sign-in starts at the registered public callback with a fresh state and a safe return page', async () => {
  await withEnvironment(configured, async () => {
    const response = await googleStart(new Request('http://internal:3000/api/admin/auth/google/start?next=/admin/products'));
    const location = new URL(response.headers.get('location'));
    assert.equal(location.origin + location.pathname, 'https://accounts.google.com/o/oauth2/v2/auth');
    assert.equal(location.searchParams.get('client_id'), 'test-client-id');
    assert.equal(location.searchParams.get('redirect_uri'), 'https://example.invalid/api/admin/auth/google/callback');
    const cookie = response.cookies.get(OAUTH_STATE_COOKIE);
    assert.equal(cookie.value, `${location.searchParams.get('state')}:/admin/products`);
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, true);
    const unsafe = await googleStart(new Request('http://internal:3000/api/admin/auth/google/start?next=//evil.invalid'));
    assert.match(unsafe.cookies.get(OAUTH_STATE_COOKIE).value, /:\/admin$/);
    assert.notEqual(unsafe.cookies.get(OAUTH_STATE_COOKIE).value, cookie.value);
  });
});

test('Google callback rejects mismatched state and provider errors before calling Google', async () => {
  await withEnvironment(configured, async () => {
    await withGoogle({ email: operator, email_verified: true }, async calls => {
      assert.equal(loginError(await googleCallback(callbackRequest({ state: 'abc', code: 'c' }))), 'state');
      assert.equal(loginError(await googleCallback(callbackRequest({ state: 'abc', code: 'c' }, 'other:/admin'))), 'state');
      assert.equal(loginError(await googleCallback(callbackRequest({ state: 'abc' }, 'abc:/admin'))), 'state');
      assert.equal(loginError(await googleCallback(callbackRequest({ error: 'access_denied', state: 'abc' }, 'abc:/admin'))), 'cancelled');
      assert.deepEqual(calls, []);
    });
  });
});

test('Google callback issues a secure session only for listed, verified accounts', async () => {
  await withEnvironment(configured, async () => {
    for (const profile of [{ email: 'stranger@example.com', email_verified: true }, { email: operator, email_verified: false }]) {
      await withGoogle(profile, async () => {
        const response = await googleCallback(callbackRequest({ state: 'abc', code: 'c' }, 'abc:/admin'));
        assert.equal(loginError(response), 'not_allowed');
        assert.equal(response.cookies.get(ADMIN_SESSION_COOKIE), undefined);
      });
    }
    await withGoogle(null, async () => assert.equal(loginError(await googleCallback(callbackRequest({ state: 'abc', code: 'c' }, 'abc:/admin'))), 'failed'));
    await withGoogle({ email: 'Operator@Example.com', email_verified: 'true' }, async () => {
      const response = await googleCallback(callbackRequest({ state: 'abc', code: 'c' }, 'abc:/admin/products/grapetree'));
      assert.equal(response.headers.get('location'), 'https://example.invalid/admin/products/grapetree');
      const session = response.cookies.get(ADMIN_SESSION_COOKIE);
      assert.equal(session.httpOnly, true);
      assert.equal(session.secure, true);
      assert.equal((await verifyAdminSessionToken(session.value)).userId, operator);
      assert.equal(response.cookies.get(OAUTH_STATE_COOKIE).value, '');
    });
  });
});

test('session authorization rejects signed tokens for removed administrators and malformed signatures', async () => {
  await withEnvironment(configured, async () => {
    const valid = await createSessionToken(operator, configured.ADMIN_SESSION_SECRET);
    const removed = await createSessionToken('previous-operator@example.com', configured.ADMIN_SESSION_SECRET);
    assert.equal(await verifyAdminSessionToken(removed), null);
    assert.equal(await verifyAdminSessionToken(`${valid}.extra`), null);
    assert.equal(await verifyAdminSessionToken(valid.replace(/\.[^.]+$/, '.invalid!')), null);
    assert.equal(await verifySessionToken(valid, 'a-different-test-secret'), null);
    const validProxy = await proxy(adminRequest('/api/admin/portfolio', valid));
    assert.equal(validProxy.headers.get('x-middleware-next'), '1');
    assert.equal((await proxy(adminRequest('/api/admin/portfolio', removed))).status, 401);
  });
});

test('disabled authentication returns an explicit admin API failure without blocking public pages or the sign-in routes', async () => {
  await withEnvironment({ NODE_ENV: 'production' }, async () => {
    for (const pathname of ['/api/admin/portfolio', '/api/admin/portfolio/action', '/api/admin/products']) {
      const response = await proxy(adminRequest(pathname));
      assert.equal(response.status, 503);
      assert.match((await response.json()).error, /인증 설정/);
    }
    for (const pathname of ['/', '/portfolio', '/admin/login', '/api/admin/auth/google/start', '/api/admin/auth/google/callback']) {
      assert.equal((await proxy(adminRequest(pathname))).headers.get('x-middleware-next'), '1');
    }
    assert.match((await proxy(adminRequest('/admin'))).headers.get('location'), /\/admin\/login\?next=/);
  });
});

async function withLocalRepository(run) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'mb-admin-safety-'));
  const previous = process.cwd();
  try {
    await fs.mkdir(path.join(directory, 'content'));
    await fs.writeFile(path.join(directory, 'content', 'retained.md'), 'Retained');
    process.chdir(directory);
    await run(directory);
  } finally {
    process.chdir(previous);
    await fs.rm(directory, { recursive: true, force: true });
  }
}

test('production with incomplete GitHub configuration permits local reading but rejects writes before filesystem changes', async () => {
  await withLocalRepository(async directory => {
    for (const github of [{}, { GITHUB_TOKEN: 'test-token' }, { GITHUB_TOKEN: 'test-token', GITHUB_OWNER: 'test-owner', GITHUB_REPO: '   ' }]) {
      await withEnvironment({ NODE_ENV: 'production', ...github }, async () => {
        const repository = getAdminRepository();
        assert.deepEqual(await repository.listFiles('content'), ['content/retained.md']);
        assert.equal(Buffer.from(await repository.readFile('content/retained.md'), 'base64').toString(), 'Retained');
        assert.throws(() => repository.assertWritable(), /GitHub.*저장할 수 없습니다/);
        await assert.rejects(repository.commitChanges({
          message: 'Test-only local write', deletes: ['content/retained.md'],
          upserts: [{ path: 'content/created.md', contentBase64: Buffer.from('Should not exist').toString('base64') }],
        }), /GitHub.*저장할 수 없습니다/);
        assert.equal(await fs.readFile(path.join(directory, 'content', 'retained.md'), 'utf8'), 'Retained');
        await assert.rejects(fs.stat(path.join(directory, 'content', 'created.md')), { code: 'ENOENT' });
      });
    }
  });
});

test('explicit development mode retains local editing without touching the workspace', async () => {
  await withLocalRepository(async directory => {
    await withEnvironment({ NODE_ENV: 'development' }, async () => {
      const repository = getAdminRepository();
      repository.assertWritable();
      await repository.commitChanges({
        message: 'Test-only local write', deletes: ['content/retained.md'],
        upserts: [{ path: 'content/created.md', contentBase64: Buffer.from('Created').toString('base64') }],
      });
      assert.equal(await fs.readFile(path.join(directory, 'content', 'created.md'), 'utf8'), 'Created');
      await assert.rejects(fs.stat(path.join(directory, 'content', 'retained.md')), { code: 'ENOENT' });
    });
  });
});

test('portfolio save and status APIs report missing repository configuration without a success response', async () => {
  const root = path.resolve(__dirname, '..');
  // Only request-scoped authentication is supplied. Parsing, saving and repository selection are real code.
  async function authenticatedRoute(relativePath) {
    const filename = path.join(root, relativePath);
    const output = ts.transpileModule(await fs.readFile(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
      fileName: filename,
    }).outputText;
    const exports = {};
    vm.runInNewContext(output, {
      exports, Request, Response, File, Buffer, Error,
      require(name) {
        if (name === '@/lib/admin/session') return { getAdminSession: async () => ({ userId: operator }) };
        return require(name.startsWith('@/') ? path.join(root, name.slice(2)) : name);
      },
    }, { filename });
    return exports;
  }
  const saveRoute = await authenticatedRoute('app/api/admin/portfolio/route.ts');
  const statusRoute = await authenticatedRoute('app/api/admin/portfolio/action/route.ts');
  await withEnvironment(configured, async () => {
    for (const [route, body] of [[saveRoute, { payload: {}, action: 'update' }], [statusRoute, { action: 'setStatus', slug: 'existing', status: 'published' }]]) {
      const response = await route.POST(new Request('http://example.invalid/api/admin/portfolio', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
      }));
      assert.equal(response.status, 500);
      const result = await response.json();
      assert.equal(result.ok, undefined);
      assert.match(result.error, /GitHub.*저장할 수 없습니다/);
    }
  });
});
