const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
async function run(){
 const tab=await fetch('http://127.0.0.1:9222/json/new?http://127.0.0.1:4173',{method:'PUT'}).then(r=>r.json());
 const ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r));let seq=0;const pending=new Map(),errors=[];
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+': '+JSON.stringify(m.params.exceptionDetails.exception));});
 function send(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});}
 async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
 async function view(hash){await evaluate(`location.hash=${JSON.stringify(hash)}`);await evaluate('new Promise(r=>setTimeout(r,90))');}
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://127.0.0.1:4173'});await new Promise(r=>setTimeout(r,700));
 await evaluate('state={completed:[],saved:[],solved:[],last:"base"};persist();route()');
 assert.equal(await evaluate('document.querySelectorAll(".chapter-card").length'),8);
 assert.equal(await evaluate('problems.length'),24);
 assert.equal(await evaluate('chapters.every(c=>c.body().length>1000)'),true);
 fs.writeFileSync('preview-desktop.png',Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
 await view('#problems');assert.equal(await evaluate('document.querySelectorAll("#problem-table tbody tr").length'),24);
 await evaluate('document.querySelector("[data-filter=primes]").click()');assert.equal(await evaluate('document.querySelectorAll("#problem-table tbody tr").length'),2);
 await evaluate('document.querySelector("[data-problem=P3383]").click()');assert.equal(await evaluate('document.querySelector("#problem-dialog").open'),true);
 await evaluate('document.querySelector("#problem-dialog [data-save]").click()');assert.equal(await evaluate('state.saved.includes("P3383")'),true);
 await evaluate('document.querySelector("#problem-dialog [data-toggle-solved]").click()');assert.equal(await evaluate('state.solved.includes("P3383")'),true);
 await evaluate('document.querySelector("#problem-dialog").close()');
 await view('#lesson/gcd');assert.equal(await evaluate('document.querySelectorAll("#main .article h2").length'),4);
 await evaluate('document.querySelectorAll(".quiz-option")[1].click()');assert.match(await evaluate('document.querySelector(".quiz-feedback").textContent'),/答对了/);
 await evaluate('document.querySelector("[data-complete]").click()');assert.equal(await evaluate('state.completed.includes("gcd")'),true);
 await view('#notebook');assert.match(await evaluate('document.querySelector("#main").textContent'),/P3383/);
 await evaluate('document.querySelector("#open-search").click(); document.querySelector("#search-input").value="P3601"; document.querySelector("#search-input").dispatchEvent(new Event("input"))');assert.equal(await evaluate('document.querySelectorAll(".search-result").length'),1);
 await evaluate('document.querySelector("#search-dialog").close()');
 await view('#lab');assert.match(await evaluate('document.querySelector("#base-output").textContent'),/110001/);assert.match(await evaluate('document.querySelector("#gcd-output").textContent'),/GCD = 6/);
 assert.match(await evaluate('document.querySelector("#factor-output").textContent'),/φ\(n\) = 96/);assert.match(await evaluate('document.querySelector("#power-output").textContent'),/= 323/);assert.match(await evaluate('document.querySelector("#blocks-output").textContent'),/= 66/);
 await evaluate('for(let i=0;i<4;i++)document.querySelector("#sieve-next").click()');assert.equal(await evaluate('document.querySelectorAll(".sieve-cell.prime").length'),25);
 await evaluate('document.querySelector("#base-radix").value="1";baseCalc()');assert.match(await evaluate('document.querySelector("#base-output").textContent'),/基数/);
 await evaluate('document.querySelector("#factor-n").value="1";factorCalc()');assert.match(await evaluate('document.querySelector("#factor-output").textContent'),/空乘积/);
 await evaluate('document.querySelector("#gcd-a").value="0";document.querySelector("#gcd-b").value="30";gcdCalc()');assert.match(await evaluate('document.querySelector("#gcd-output").textContent'),/GCD = 30/);
 await evaluate('document.querySelector("#power-e").value="0";document.querySelector("#power-m").value="1";powerCalc()');assert.match(await evaluate('document.querySelector("#power-output").textContent'),/= 0/);
 for(const id of ['base','counting','gcd','primes','factor','modular','divisors','phi']){await view('#lesson/'+id);assert.equal(await evaluate('document.querySelectorAll(".quiz-option").length'),3);}
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await view('#overview');
 assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
 fs.writeFileSync('preview-mobile.png',Buffer.from((await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
 await evaluate('document.querySelector("#menu-toggle").click()');assert.equal(await evaluate('document.querySelector("#sidebar").classList.contains("open")'),true);
 await view('#lab');assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
 await view('#lesson/modular');assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
 await view('#problems');assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'),true);
 await evaluate('state={completed:[],saved:[],solved:[],last:"base"};persist()');
 await send('Page.navigate',{url:pathToFileURL(path.join(__dirname,'index.html')).href});await new Promise(r=>setTimeout(r,400));assert.equal(await evaluate('document.querySelectorAll(".chapter-card").length'),8);
 assert.deepEqual(errors,[]);
 console.log('PASS: 8 lessons, 24 problems, search, filters, bookmarks, solved status, completion, quiz, 6 interactive demos, invalid/edge inputs, 390px responsive layouts, offline file opening, no runtime errors.');
 await send('Page.close');ws.close();
}
run().catch(e=>{console.error(e);process.exit(1);});
