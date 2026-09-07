import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function handler(error = null) {
 const calls=[];
 const source=fs.readFileSync(new URL('../app/admin/signout/route.ts',import.meta.url),'utf8');
 const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};
 vm.runInNewContext(output,{exports,URL,Response,require(name){
  if(name==='next/server')return {NextResponse:{redirect:(url,status)=>Response.redirect(url,status)}};
  if(name.endsWith('/supabase/server'))return {createClient:async()=>({auth:{signOut:async(options)=>{calls.push(options.scope);return {error};}}})};
  throw new Error('Unexpected import '+name);
 }});
 return {route:exports,calls};
}
test('GET/prefetch cannot invoke logout',()=>{
 const {route,calls}=handler(); assert.equal(route.GET,undefined);assert.deepEqual(calls,[]);
 const page=fs.readFileSync(new URL('../app/admin/[[...section]]/page.tsx',import.meta.url),'utf8');
 assert.ok(!/href="\/admin\/signout"/.test(page));assert.match(page,/<form action="\/admin\/signout" method="post">/);
});
test('explicit same-origin logout revokes only this session and redirects using GET',async()=>{
 const {route,calls}=handler();const response=await route.POST(new Request('https://mynorabakery.com/admin/signout',{method:'POST',headers:{origin:'https://mynorabakery.com'}}));
 assert.equal(response.status,303);assert.equal(response.headers.get('location'),'https://mynorabakery.com/admin/login');assert.deepEqual(calls,['local']);
});
test('cross-origin or missing-origin requests never revoke a session',async()=>{
 for(const origin of ['', 'https://other.example']){const {route,calls}=handler();const response=await route.POST(new Request('https://mynorabakery.com/admin/signout',{method:'POST',headers:origin?{origin}:{}}));assert.equal(response.status,403);assert.deepEqual(calls,[]);}
});
test('logout service errors do not claim success',async()=>{
 const {route}=handler(new Error('Unavailable'));const response=await route.POST(new Request('https://mynorabakery.com/admin/signout',{method:'POST',headers:{origin:'https://mynorabakery.com'}}));assert.equal(response.status,503);
});
