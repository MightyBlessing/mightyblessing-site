const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');
const { getAdminAuthConfig, getAdminCredentials, getAdminSessionSecret } = require('../lib/admin/env.ts');
const { createSessionToken, verifySessionToken, verifyAdminSessionToken } = require('../lib/admin/auth.ts');
const { getAdminRepository } = require('../lib/admin/repository.ts');
const { POST: login } = require('../app/api/admin/login/route.ts');
const { proxy } = require('../proxy.ts');
const { ADMIN_SESSION_COOKIE } = require('../lib/admin/constants.ts');

const configured = {
  NODE_ENV: 'production', ADMIN_ID: 'test-operator', ADMIN_PASSWORD: 'test-only-configured-password',
  ADMIN_SESSION_SECRET: 'test-only-configured-session-secret',
};
const environmentKeys = ['NODE_ENV', 'ADMIN_ID', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET', 'GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO', 'GITHUB_BRANCH'];
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
function loginRequest(id = configured.ADMIN_ID, password = configured.ADMIN_PASSWORD) {
  return new Request('http://example.invalid/api/admin/login', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id, password }),
  });
}
function adminRequest(pathname, token) {
  return new NextRequest(`http://example.invalid${pathname}`, {
    headers: token ? { cookie: `${ADMIN_SESSION_COOKIE}=${token}` } : {},
  });
}

test('production refuses login and existing sessions when any authentication setting is missing or blank', async () => {
  const token = await createSessionToken(configured.ADMIN_ID, configured.ADMIN_SESSION_SECRET);
  for (const key of ['ADMIN_ID', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET']) {
    for (const missing of [undefined, '   ']) {
      await withEnvironment({ ...configured, [key]: missing }, async () => {
        assert.equal(getAdminAuthConfig(), null);
        assert.equal(await verifyAdminSessionToken(token), null);
        const response = await login(loginRequest());
        assert.equal(response.status, 503);
        assert.equal(response.headers.get('set-cookie'), null);
        assert.match((await response.json()).error, /인증 설정/);
      });
    }
  }
});

test('production also rejects explicitly configured development credentials and documented example secret', async () => {
  const defaults = await withEnvironment({ NODE_ENV: 'development' }, async () => getAdminAuthConfig());
  for (const override of [{ ADMIN_PASSWORD: defaults.password }, { ADMIN_SESSION_SECRET: defaults.secret }, { ADMIN_SESSION_SECRET: 'change-this-secret' }]) {
    await withEnvironment({ ...configured, ...override }, async () => {
      assert.equal(getAdminAuthConfig(), null);
      const response = await login(loginRequest());
      assert.equal(response.status, 503);
      assert.equal(response.headers.get('set-cookie'), null);
    });
  }
});

test('default credentials are available only in explicit development mode', async () => {
  for (const NODE_ENV of [undefined, 'test', 'production']) {
    await withEnvironment({ NODE_ENV }, async () => {
      assert.equal(getAdminCredentials(), null);
      assert.equal(getAdminSessionSecret(), null);
    });
  }
  await withEnvironment({ NODE_ENV: 'development' }, async () => {
    const config = getAdminAuthConfig();
    assert.ok(config);
    const response = await login(loginRequest(config.id, config.password));
    assert.equal(response.status, 200);
    assert.ok(response.cookies.get(ADMIN_SESSION_COOKIE));
  });
});

test('configured production login issues a secure session only for matching credentials', async () => {
  await withEnvironment(configured, async () => {
    for (const request of [loginRequest('different-user'), loginRequest(configured.ADMIN_ID, 'wrong')]) {
      const response = await login(request);
      assert.equal(response.status, 401);
      assert.equal(response.headers.get('set-cookie'), null);
    }
    const response = await login(loginRequest());
    assert.equal(response.status, 200);
    assert.match(response.headers.get('set-cookie'), /HttpOnly/);
    assert.match(response.headers.get('set-cookie'), /Secure/);
    const session = await verifyAdminSessionToken(response.cookies.get(ADMIN_SESSION_COOKIE).value);
    assert.equal(session.userId, configured.ADMIN_ID);
  });
});

test('session authorization rejects signed tokens for another administrator and malformed signatures', async () => {
  await withEnvironment(configured, async () => {
    const valid = await createSessionToken(configured.ADMIN_ID, configured.ADMIN_SESSION_SECRET);
    const other = await createSessionToken('previous-operator', configured.ADMIN_SESSION_SECRET);
    assert.equal(await verifyAdminSessionToken(other), null);
    assert.equal(await verifyAdminSessionToken(`${valid}.extra`), null);
    assert.equal(await verifyAdminSessionToken(valid.replace(/\.[^.]+$/, '.invalid!')), null);
    assert.equal(await verifySessionToken(valid, 'a-different-test-secret'), null);
    const validProxy = await proxy(adminRequest('/api/admin/portfolio', valid));
    assert.equal(validProxy.headers.get('x-middleware-next'), '1');
    assert.equal((await proxy(adminRequest('/api/admin/portfolio', other))).status, 401);
  });
});

test('disabled authentication returns an explicit admin API failure without blocking public pages or the login explanation', async () => {
  await withEnvironment({ NODE_ENV: 'production' }, async () => {
    for (const pathname of ['/api/admin/login', '/api/admin/portfolio', '/api/admin/portfolio/action']) {
      const response = await proxy(adminRequest(pathname));
      assert.equal(response.status, 503);
      assert.match((await response.json()).error, /인증 설정/);
    }
    for (const pathname of ['/', '/portfolio', '/admin/login']) {
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
        if (name === '@/lib/admin/session') return { getAdminSession: async () => ({ userId: configured.ADMIN_ID }) };
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
