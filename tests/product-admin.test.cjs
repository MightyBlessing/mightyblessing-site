const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const sharp = require('sharp');
const { getAdminProduct, saveAdminProduct } = require('../lib/admin/product-admin.ts');
const { checkExpectedFiles } = require('../lib/admin/revision.ts');
const { getFeaturedProducts } = require('../lib/product-content.ts');

function fixture() {
  const files = new Map(['grapetree', 'live-text', 'twoline'].map(id => [`content/products/${id}.json`, fs.readFileSync(`content/products/${id}.json`).toString('base64')]));
  const commits = [];
  const repository = { async readFile(path) { return files.get(path) ?? null; }, async listFiles() { return [...files.keys()]; }, async commitChanges(change) { await checkExpectedFiles(change.expectedFiles, path => repository.readFile(path)); commits.push(change); for (const f of change.upserts) files.set(f.path, f.contentBase64); } };
  return { files, commits, repository };
}
function payload(v) { return { id:v.id, revision:v.revision, description:v.description, detail:v.detail, alt:v.screen?.alt || '', caption:v.screen?.caption || '', removeScreen:v.screenHidden === true }; }
async function imageFile() { return new File([await sharp({create:{width:600,height:300,channels:3,background:'#7500ff'}}).png().toBuffer()], 'screen.png', {type:'image/png'}); }

test('screen replacement commits media and content together, retains other products and rejects stale saves', async () => {
  const f = fixture(), old = await getAdminProduct('grapetree', f.repository), p = payload(old);
  const other = f.files.get('content/products/live-text.json');
  const result = await saveAdminProduct({...p, description:'등록 관리 화면', alt:'등록 내역 화면'}, await imageFile(), f.repository);
  assert.equal(f.commits.length,1); assert.equal(f.commits[0].upserts.length,2); assert.deepEqual(f.commits[0].deletes,[]);
  assert.match(result.value.screen.src,/^\/media\/products\/uploads\/grapetree-[a-f0-9-]+\.png$/);
  assert.equal(result.value.screen.width,600); assert.equal(result.value.screen.height,300);
  assert.equal(f.files.get('content/products/live-text.json'),other);
  assert.deepEqual(await getAdminProduct('grapetree',f.repository),result.value);
  const count = f.files.size;
  await assert.rejects(saveAdminProduct(p, await imageFile(),f.repository), error=>error.status===409);
  assert.equal(f.files.size,count);
  const next = await saveAdminProduct({...payload(result.value),caption:'실제 제품'},undefined,f.repository);
  assert.equal(next.value.screen.src,result.value.screen.src); assert.equal(next.value.screen.caption,'실제 제품');
});

test('hiding and re-adding a screen persists without deleting rollback files', async () => {
  const f=fixture(), old=await getAdminProduct('twoline',f.repository);
  const hidden=await saveAdminProduct({...payload(old),removeScreen:true},undefined,f.repository);
  assert.deepEqual(hidden.value.screen,old.screen);
  assert.equal(hidden.value.screenHidden,true);
  const restored=await saveAdminProduct({...payload(hidden.value),removeScreen:false},undefined,f.repository);
  assert.deepEqual(restored.value.screen,old.screen);
  assert.equal(restored.value.screenHidden,false);
  const shown=await saveAdminProduct({...payload(restored.value),alt:'새 화면',removeScreen:false},await imageFile(),f.repository);
  assert.equal(shown.value.screen.width,600); assert.ok(f.commits.every(c=>c.deletes.length===0));
});

test('invalid paths, malformed payloads, unsafe files and missing alt never write', async () => {
  const f=fixture(), p=payload(await getAdminProduct('grapetree',f.repository));
  for (const bad of [null, {...p,id:'../portfolio'}, {...p,revision:''}, {...p,detail:4}, {...p,description:''}, {...p,alt:''}, {...p,caption:'x'.repeat(501)}]) await assert.rejects(saveAdminProduct(bad,undefined,f.repository));
  await assert.rejects(saveAdminProduct(p,new File(['<svg/>'],'fake.png'),f.repository),e=>e.status===415);
  await assert.rejects(saveAdminProduct({...p,removeScreen:true},await imageFile(),f.repository));
  assert.equal(f.commits.length,0);
});

test('commit-time conflicts close the load/save race and repository failures are not reported as success', async () => {
  const f=fixture(), p=payload(await getAdminProduct('grapetree',f.repository));
  const original=f.repository.commitChanges;
  f.repository.commitChanges=async change=>{ f.files.set('content/products/grapetree.json',Buffer.from('{}').toString('base64')); return original(change); };
  await assert.rejects(saveAdminProduct(p,undefined,f.repository),e=>e.status===409);
  const g=fixture(), q=payload(await getAdminProduct('grapetree',g.repository));
  g.repository.commitChanges=async()=>{throw new Error('network');};
  await assert.rejects(saveAdminProduct(q,undefined,g.repository),/저장 결과를 확인하지 못했습니다/);
});

test('public home products read the persisted screen source and descriptions', () => {
  const products=getFeaturedProducts();
  for(const p of products) { const raw=JSON.parse(fs.readFileSync(`content/products/${p.id}.json`)); assert.equal(p.screen.src,raw.screen.src); assert.equal(p.description,raw.description); }
});
