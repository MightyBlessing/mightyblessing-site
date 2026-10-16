const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
function compile(file, overrides={}, globals={}) {
 const filename=path.join(__dirname,'..',file),exports={};
 const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true},fileName:filename}).outputText;
 vm.runInNewContext(code,{exports,Buffer,Response,URL,...globals,require:n=>overrides[n]??require('node:module').createRequire(filename)(n)});return exports;
}
test('hidden public screens are omitted while persisted screen metadata is retained',()=>{
 const stored={description:'설명',detail:'상세',screenHidden:true,screen:{src:'/media/products/grapetree.webp',alt:'화면',caption:'캡션',width:1,height:1}};
 const {getProductContent,getFeaturedProducts}=compile('lib/product-content.ts',{'fs':{readFileSync:()=>JSON.stringify(stored)}},{process});
 assert.equal(getProductContent('grapetree').screen,null);
 assert.ok(getFeaturedProducts().every(p=>p.screen===null));
 stored.screenHidden=false;assert.equal(getProductContent('grapetree').screen.src,stored.screen.src);
});
test('admin preview reads saved repository image before deployment and enforces authentication and path bounds',async()=>{
 let loggedIn=false,src='/media/products/uploads/grapetree-new.webp',reads=[];
 const encoded=Buffer.from('repository image bytes').toString('base64');
 const repository={readFile:async p=>{reads.push(p);return encoded;}};
 const {GET}=compile('app/api/admin/products/[id]/screen/route.ts',{
  '@/lib/admin/session':{getAdminSession:async()=>loggedIn?{}:null},
  '@/lib/admin/repository':{getAdminRepository:()=>repository},
  '@/lib/admin/product-admin':{getAdminProduct:async()=>({screen:{src}})},
 });
 const call=()=>GET(new Request('https://local.invalid/api/admin/products/grapetree/screen'),{params:Promise.resolve({id:'grapetree'})});
 assert.equal((await call()).status,401);assert.equal(reads.length,0);
 loggedIn=true;const response=await call();assert.equal(response.status,200);assert.equal(await response.text(),'repository image bytes');
 assert.equal(response.headers.get('content-type'),'image/webp');assert.equal(response.headers.get('cache-control'),'private, no-store');
 src='/media/products/../../secrets.png';assert.equal((await call()).status,404);assert.equal(reads.length,1);
});
test('GitHub files above the inline Contents limit use blob data',async()=>{
 const calls=[];
 const {getAdminRepository}=compile('lib/admin/repository.ts',{'./env':{getGithubConfig:()=>({token:'test',owner:'test',repo:'test',branch:'main'})}},{fetch:async url=>{calls.push(url);return Response.json(calls.length===1?{encoding:'none',content:'',sha:'blob-sha'}:{encoding:'base64',content:'aW1h\nZ2U='});}});
 assert.equal(await getAdminRepository().readFile('public/media/products/screen.png'),'aW1hZ2U=');
 assert.equal(calls.length,2);assert.match(calls[1],/\/git\/blobs\/blob-sha$/);
});
test('dirty editor blocks internal menu navigation on cancel, allows approval and leaves new tabs and anchors alone',()=>{
 class Element {closest(){return this;}}
 class HTMLAnchorElement extends Element {constructor(href,target=''){super();this.href=href;this.target=target;}hasAttribute(){return false;}}
 const {guardEditorNavigation}=compile('lib/admin/editor-navigation.ts',{}, {Element,HTMLAnchorElement});
 const current='https://site.invalid/admin/products/grapetree';
 function attempt(href,allow=false,target='',extra={}){let blocked=false,stopped=false,asked=0;guardEditorNavigation({target:new HTMLAnchorElement(href,target),button:0,preventDefault(){blocked=true;},stopPropagation(){stopped=true;},...extra},current,()=>{asked++;return allow;});return{blocked,stopped,asked};}
 assert.deepEqual(attempt('/products'),{blocked:true,stopped:true,asked:1});
 assert.deepEqual(attempt('/products',true),{blocked:false,stopped:false,asked:1});
 assert.equal(attempt('/products',false,'_blank').asked,0);
 assert.equal(attempt('/products',false,'',{ctrlKey:true}).asked,0);
 assert.equal(attempt(current+'#top').asked,0);
});
