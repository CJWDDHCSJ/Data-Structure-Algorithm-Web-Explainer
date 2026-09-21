'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const escapeHTML = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const storageKey='number-theory-lab-v1';
let storageAvailable=true;
let state={completed:[],saved:[],solved:[],last:'base',module:'math'};
try {
  const raw=JSON.parse(localStorage.getItem(storageKey)||'null');
  if(raw && typeof raw==='object') {
    for(const key of ['completed','saved','solved']) if(Array.isArray(raw[key])) state[key]=raw[key].filter(x=>typeof x==='string');
    if(chapters.some(c=>c.id===raw.last)) state.last=raw.last;
    if(learningModules.some(m=>m.id===raw.module)) state.module=raw.module;
  }
  localStorage.setItem(storageKey,JSON.stringify(state));
} catch { storageAvailable=false; }
state.completed=state.completed.filter(id=>chapters.some(c=>c.id===id));
state.saved=state.saved.filter(id=>problems.some(p=>p.id===id));
state.solved=state.solved.filter(id=>problems.some(p=>p.id===id));
function persist(){try{localStorage.setItem(storageKey,JSON.stringify(state));}catch{storageAvailable=false;toast('浏览器无法保存；本次会话中仍可记录。');}}
let toastTimer;
function toast(text){const el=$('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300);}

function activeModule(){return learningModules.find(m=>m.id===state.module)||learningModules[0];}
function moduleChapters(){return chapters.filter(c=>activeModule().chapterIds.includes(c.id));}
function moduleProblems(){return problems.filter(p=>activeModule().problemIds.includes(p.id));}
function moduleCompleted(){return state.completed.filter(id=>activeModule().chapterIds.includes(id)).length;}
function moduleSolved(){return state.solved.filter(id=>activeModule().problemIds.includes(id)).length;}
function selectModule(id){
 if(state.module===id)return;
 state.module=id;problemFilter='all';persist();
}
function moduleChooser(){
 return '<div class="module-cards">'+learningModules.map(m=>`<a class="module-card ${m.id===state.module?'selected':''}" href="#module/${m.id}" ${m.id===state.module?'aria-current="page"':''}><span class="eyebrow">TRAINING ${m.training}</span><h2>${m.title}</h2><p>${m.subtitle}</p><small>${m.chapterIds.length} 章 · ${m.problemIds.length} 题 · ${state.completed.filter(id=>m.chapterIds.includes(id)).length} 章已完成</small></a>`).join('')+'</div>';
}

function progress(){return Math.round(moduleCompleted()/moduleChapters().length*100);}
function sectionHeading(title,sub,link='',linkText='查看全部 →'){return `<div class="section-heading"><div><h2>${title}</h2>${sub?`<p>${sub}</p>`:''}</div>${link?`<a href="${link}">${linkText}</a>`:''}</div>`;}
function pageIntro(title,description,label='NUMBER THEORY / LEARNING NOTES'){return `<div class="page-intro"><div><div class="eyebrow"><i class="line"></i>${label}</div><h1>${title}</h1><p>${description}</p></div><span class="edition">VOL. 01 — MATHEMATICS</span></div>`;}
function renderNav(view,chapter){
  $$('.main-nav a').forEach(a=>{a.classList.toggle('active',a.dataset.view===view);if(a.dataset.view===view)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  $('#module-nav').innerHTML=learningModules.map(m=>`<a href="#module/${m.id}" class="${m.id===state.module?'current':''}" ${m.id===state.module?'aria-current="page"':''}>${m.title}<small>题单 ${m.training}</small></a>`).join('');
  $('#lesson-count').textContent=String(moduleChapters().length).padStart(2,'0');
  $('#nav-problem-count').textContent=moduleProblems().length;
  $('.main-nav [data-view="lesson"]').href='#lesson/'+moduleChapters()[0].id;
  const m=activeModule();
  $('#module-source').innerHTML=`<div class="source-mark">L<span>当前模块来源</span></div><a href="https://www.luogu.com.cn/training/${m.training}" target="_blank" rel="noopener noreferrer">${m.sourceName} ↗</a><p>题面核对：${m.checkedAt}</p>`;
  $('footer a').href='https://www.luogu.com.cn/training/'+m.training;
  $('#chapter-nav').innerHTML=moduleChapters().map((c,i)=>`<a href="#lesson/${c.id}" class="${chapter===c.id?'current':''}" ${chapter===c.id?'aria-current="page"':''}><span class="chapter-num">${String(i+1).padStart(2,'0')}</span>${c.title}${state.completed.includes(c.id)?'<span class="chapter-done">✓</span>':''}</a>`).join('');
}
function chapterCard(c,i){return `<a class="chapter-card" href="#lesson/${c.id}" style="--accent:${c.color};--tint:${c.tint}"><div class="card-top"><span class="chapter-icon">${c.icon}</span><span class="card-num">CHAPTER ${String(i+1).padStart(2,'0')}</span></div><h3>${c.title}</h3><p>${c.short}</p><div class="card-tags">${c.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div><div class="card-foot"><span>${c.problems.length} 道关联题目 · 约 ${c.time} 分钟</span><span class="${state.completed.includes(c.id)?'done':''}">${state.completed.includes(c.id)?'已学完 ✓':`${c.level} ↗`}</span></div></a>`;}
function difficulty(p){return `<span class="difficulty diff${p.difficulty}">${difficultyNames[p.difficulty]}</span>`;}
function problemRows(items,full=false){return items.map(p=>`<tr><td><button class="problem-title" data-problem="${p.id}"><span class="pid">${p.id}</span>${p.name}</button></td><td>${difficulty(p)}</td><td>${p.tags.map(t=>`<span class="tag">${t}</span>`).join(' ')}</td>${full?`<td><button data-toggle-solved="${p.id}" class="filter-btn ${state.solved.includes(p.id)?'active':''}" aria-pressed="${state.solved.includes(p.id)}">${state.solved.includes(p.id)?'已完成 ✓':'未完成'}</button></td><td><button class="save-btn ${state.saved.includes(p.id)?'saved':''}" data-save="${p.id}" aria-label="${state.saved.includes(p.id)?'取消收藏':'收藏'} ${p.id}" aria-pressed="${state.saved.includes(p.id)}">${state.saved.includes(p.id)?'★':'☆'}</button></td>`:`<td><button data-problem="${p.id}" class="text-link">阅读思路 ↗</button></td>`}</tr>`).join('');}
function problemTable(items,full=false){return `<div class="table-wrap"><table><thead><tr><th>题目</th><th>洛谷难度</th><th>核心知识</th>${full?'<th>练习状态</th><th>收藏</th>':'<th>讲解</th>'}</tr></thead><tbody>${problemRows(items,full)}</tbody></table>${items.length?'':'<div class="empty-state">没有匹配的题目，试试其他筛选条件。</div>'}</div>`;}

function overview(){
 const m=activeModule(),list=moduleChapters(),next=list.find(c=>c.id===state.last)||list.find(c=>!state.completed.includes(c.id))||list[0];
 return `${pageIntro('让知识，成为解题的直觉。','选择一个模块，沿着原理、实验与题目的路线学习。')}${moduleChooser()}
 <section class="hero"><div class="hero-copy"><div class="hero-tag">洛谷题单 ${m.training} · ${m.chapterIds.length} 章 · ${m.problemIds.length} 题</div><h2>${m.title}</h2><p>${m.description}</p><div class="hero-links"><a href="#lesson/${next.id}" class="btn btn-primary">${moduleCompleted()?'继续学习':'开始学习'} →</a><a href="#problems" class="text-link">浏览本模块题单 ↗</a></div></div><div class="hero-art" aria-hidden="true"><div class="math-orbit"></div><div class="math-formula">${m.id==='range'?'Sᵣ − Sₗ₋₁':'n = ∏ pᵢᵅⁱ'}</div><div class="math-label">${m.id==='range'?'from points to intervals.':'every number has a story.'}</div><span class="float-num n2">${m.id==='range'?'Σ':'2'}</span><span class="float-num n5">${m.id==='range'?'Δ':'5'}</span><span class="art-caption">LEARN · EXPLORE · PRACTICE</span></div></section>
 <section class="stat-row" aria-label="当前模块概况"><div class="stat"><span class="stat-icon">▤</span><div><strong>${list.length}<small>章</small></strong><p>系统知识讲解</p></div></div><div class="stat"><span class="stat-icon">☷</span><div><strong>${m.problemIds.length}<small>题</small></strong><p>题目思路解析</p></div></div><div class="stat"><span class="stat-icon">⌘</span><div><strong>${m.labCount}<small>个</small></strong><p>交互算法实验</p></div></div><div class="stat"><span class="stat-icon">◷</span><div><strong>${progress()}<small>%</small></strong><p>本模块学习进度</p></div></div></section>
 <div class="overview-columns"><section>${sectionHeading('循序渐进的知识路线','读懂原理，再动手实现，最后回看边界与复杂度。')}<div class="chapter-grid">${list.map(chapterCard).join('')}</div></section><aside class="overview-rail"><div class="rail-card"><h3>本模块学习进度</h3><div class="progress-summary"><span>已完成 ${moduleCompleted()} / ${list.length} 章</span><b>${progress()}%</b></div><div class="progress-track"><i style="width:${progress()}%"></i></div><p class="hint">已完成题目 ${moduleSolved()} / ${m.problemIds.length}<br>完成一章后，在章节末尾手动标记。</p></div><div class="rail-card"><h3>建议这样学习</h3>${['读懂核心定义和推导','在实验中观察小例子','独立实现并到洛谷提交','回看易错点与复杂度'].map((s,i)=>`<div class="route-line"><span>${i+1}</span><div><b>${s}</b></div></div>`).join('')}</div></aside></div>
 <section class="practice-preview">${sectionHeading('从这几道题开始','先用基础题建立直觉，再进入综合应用。','#problems','全部 '+m.problemIds.length+' 道题目 →')}${problemTable((m.id==='range'?['P8218','P2367','P3397','P1496']:['P1143','P1469','P3383','P1029']).map(id=>problems.find(p=>p.id===id)))}</section><p class="overview-source">来源：${m.sourceName}（题单 ${m.training}）。按知识联系独立编排，覆盖本次核对的全部 ${m.problemIds.length} 题。题面核对日期：${m.checkedAt}。</p>`;
}
function lesson(id){
 const list=moduleChapters(),c=list.find(c=>c.id===id)||list[0],i=list.indexOf(c);state.last=c.id;persist();
 return `<div class="eyebrow"><i class="line"></i>CHAPTER ${String(i+1).padStart(2,'0')} / KNOWLEDGE NOTES</div><div class="lesson-header"><h1>${c.title}</h1><p>${c.intro}</p><div class="lesson-meta"><span>◷ 约 ${c.time} 分钟</span><span>▤ ${c.problems.length} 道关联题</span><span>${c.level}</span><span>${state.completed.includes(c.id)?'✓ 已学完':'尚未标记完成'}</span></div></div><div class="lesson-layout"><article class="article">${c.body()}<section class="quiz" data-quiz="${c.id}"><h3>停下来，想一想</h3><p>${c.quiz.q}</p><div class="quiz-options">${c.quiz.options.map((o,k)=>`<button class="quiz-option" data-answer="${k}">${String.fromCharCode(65+k)}. ${o}</button>`).join('')}</div><p class="quiz-feedback" aria-live="polite"></p></section><div class="lesson-actions"><button class="btn ${state.completed.includes(c.id)?'completed-btn':'btn-primary'}" data-complete="${c.id}">${state.completed.includes(c.id)?'已学完 · 点击撤销':'标记本章已学完 ✓'}</button><button class="btn btn-white" id="print-lesson">打印 / 保存 PDF</button></div></article><aside class="lesson-aside"><div class="rail-card"><h3>本章目录</h3>${c.sections.map((s,j)=>`<a href="#lesson/${c.id}" data-section="s${j}">${String(j+1).padStart(2,'0')}　${s}</a>`).join('')}</div><div class="rail-card"><h3>关联题目 <span>${c.problems.length} 题</span></h3>${c.problems.map(pid=>{const p=problems.find(p=>p.id===pid);return `<a href="#problem/${p.id}">${p.id} · ${p.name.replace(/\[.*?\]\s*/g,'')}</a>`;}).join('')}<a href="#lab" style="color:var(--orange);margin-top:12px">去算法实验室 ↗</a></div></aside></div><div class="bottom-next">${i?`<a href="#lesson/${list[i-1].id}">← ${list[i-1].title}</a>`:'<a href="#overview">← 学习概览</a>'}${i<list.length-1?`<a href="#lesson/${list[i+1].id}">下一章：${list[i+1].title} →</a>`:'<a href="#problems">开始练习 →</a>'}</div>`;
}
let problemFilter='all',statusFilter='all';
function filteredProblems(){return moduleProblems().filter(p=>(problemFilter==='all'||chapters.find(c=>c.id===problemFilter)?.problems.includes(p.id))&&(statusFilter==='all'||statusFilter==='saved'&&state.saved.includes(p.id)||statusFilter==='solved'&&state.solved.includes(p.id)||statusFilter==='todo'&&!state.solved.includes(p.id)));}
function problemPage(){return `${pageIntro('把知识，放进题目里。',activeModule().title+' · 全部 '+moduleProblems().length+' 题 · 按章节与练习状态筛选。','TRAINING '+activeModule().training+' / PROBLEM COLLECTION')}<div class="filter-bar" role="group" aria-label="按章节筛选"><button class="filter-btn ${problemFilter==='all'?'active':''}" data-filter="all">全部题目</button>${moduleChapters().map(c=>`<button class="filter-btn ${problemFilter===c.id?'active':''}" data-filter="${c.id}">${c.title}</button>`).join('')}</div><div class="problem-toolbar"><span id="problem-count">显示 ${filteredProblems().length} 题 · 已完成 ${moduleSolved()} / ${moduleProblems().length}</span><label>练习状态 <select id="status-filter"><option value="all">全部状态</option><option value="todo">尚未完成</option><option value="solved">已完成</option><option value="saved">我的收藏</option></select></label></div><div id="problem-table">${problemTable(filteredProblems(),true)}</div><p class="overview-source">“已完成”是你的本地练习记录，不代表洛谷提交状态。难度依据读取时的洛谷题面信息；部分题目关联多个知识章节。</p>`;}
function updateProblemTable(){if(!$('#problem-table'))return;$('#problem-table').innerHTML=problemTable(filteredProblems(),true);$('#problem-count').textContent=`显示 ${filteredProblems().length} 题 · 已完成 ${moduleSolved()} / ${moduleProblems().length}`;}
let activeProblem=null;
function problemDetail(id){const p=problems.find(p=>p.id===id);if(!p)return;activeProblem=id;$('#problem-detail').innerHTML=`<div class="dialog-heading"><span class="eyebrow">PROBLEM NOTES / ${p.id}</span><button class="icon-button" data-close="problem-dialog" aria-label="关闭题目讲解">×</button></div><h1>${p.name}</h1><div class="detail-meta">${difficulty(p)}${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div><div class="article"><h2>这道题在问什么</h2><p>${p.summary}</p><h2>从哪里入手</h2><ol>${p.steps.map(s=>`<li>${s}</li>`).join('')}</ol>${formula(p.example)}<h3>复杂度</h3><p>${p.complexity}</p>${tip('容易踩的坑',p.pitfall)}<div class="problem-links"><a class="btn btn-primary" href="https://www.luogu.com.cn/problem/${p.id}" target="_blank" rel="noopener noreferrer">去洛谷做题 ↗</a><a href="#lesson/${p.chapter}" class="btn btn-white" data-close="problem-dialog">阅读对应章节 →</a><button class="btn btn-white" data-save="${p.id}">${state.saved.includes(p.id)?'★ 已收藏':'☆ 收藏题目'}</button><button class="btn ${state.solved.includes(p.id)?'completed-btn':'btn-white'}" data-toggle-solved="${p.id}">${state.solved.includes(p.id)?'已完成 ✓':'标记已完成'}</button></div></div>`;if(!$('#problem-dialog').open)$('#problem-dialog').showModal();}
function notebook(){return `${pageIntro('每一步，都有迹可循。','在这里回看学过的章节、收藏的题目，以及两个模块的练习进度。','MY NOTEBOOK / LEARNING PROGRESS')}${!storageAvailable?'<p class="storage-warning">浏览器未允许本地存储，关闭页面后本次记录可能丢失。</p>':''}<div class="stat-row"><div class="stat"><span class="stat-icon">▤</span><div><strong>${state.completed.length}<small>/ ${chapters.length}</small></strong><p>已完成章节</p></div></div><div class="stat"><span class="stat-icon">✓</span><div><strong>${state.solved.length}<small>/ ${problems.length}</small></strong><p>已完成题目</p></div></div><div class="stat"><span class="stat-icon">☆</span><div><strong>${state.saved.length}</strong><p>已收藏题目</p></div></div><div class="stat"><span class="stat-icon">◷</span><div><strong>${Math.round(state.completed.length/chapters.length*100)}<small>%</small></strong><p>章节进度</p></div></div></div><div class="note-grid"><section class="rail-card"><h3>已经学过的章节</h3>${state.completed.length?chapters.filter(c=>state.completed.includes(c.id)).map(c=>`<div class="note-item"><span style="color:var(--green)">✓</span><a href="#lesson/${c.id}">${c.title}</a><span>再次阅读 →</span></div>`).join(''):'<div class="empty-state"><span>▤</span>读完一个章节后，点击「标记本章已学完」。<br><a class="text-link" href="#lesson/base">从第一章开始 →</a></div>'}</section><section class="rail-card"><h3>收藏的题目</h3>${state.saved.length?problems.filter(p=>state.saved.includes(p.id)).map(p=>`<div class="note-item"><a href="#problem/${p.id}">${p.id} · ${p.name}</a><button class="save-btn saved" data-save="${p.id}" aria-label="取消收藏 ${p.id}">★</button></div>`).join(''):'<div class="empty-state"><span>☆</span>把值得再想一遍的题目，留在这里。<br><a class="text-link" href="#problems">浏览题单 →</a></div>'}</section></div><section>${sectionHeading('已经完成的题目','给每一次独立思考，留下一个记录。')}${state.solved.length?problemTable(problems.filter(p=>state.solved.includes(p.id)),true):'<div class="rail-card empty-state">还没有标记完成的题目。解题后可在题单中更新状态。</div>'}</section><p class="note-info">记录仅保存在此浏览器中，不会上传到服务器或同步到洛谷。清除浏览器数据会删除记录。</p><button class="outline-btn" id="export-progress">导出学习记录 JSON ↓</button>`;}
function lab(){if(state.module==='range')return rangeLab();return `${pageIntro('改变输入，看见原理。','6 个小实验，让抽象的公式变成可以观察的过程。所有运算都在本地进行。','ALGORITHM PLAYGROUND / TRY IT YOURSELF')}<div class="lab-grid">
 <section class="lab-card"><div class="eyebrow">01 / BASE CONVERSION</div><h2>进制转换工作台</h2><p>查看每一次除法，如何确定结果中的一位数码。支持正进制与负进制。</p><form class="lab-inputs" id="base-form"><label>十进制整数<input id="base-value" value="-15" inputmode="numeric" required></label><label>目标基数<input id="base-radix" type="number" value="-2" min="-36" max="36" required></label><button class="btn btn-primary" type="submit">转换 →</button></form><div class="lab-output" id="base-output" aria-live="polite"></div></section>
 <section class="lab-card"><div class="eyebrow">02 / EUCLIDEAN ALGORITHM</div><h2>辗转相除，一步步缩小</h2><p>观察商与余数如何变化。最后一个非零余数，就是两个数的最大公约数。</p><form class="lab-inputs" id="gcd-form"><label>整数 a<input id="gcd-a" value="84" inputmode="numeric" required></label><label>整数 b<input id="gcd-b" value="30" inputmode="numeric" required></label><button class="btn btn-primary" type="submit">演算 →</button></form><div class="lab-output" id="gcd-output" aria-live="polite"></div></section>
 <section class="lab-card"><div class="eyebrow">03 / SIEVE OF ERATOSTHENES</div><h2>筛去合数，留下素数</h2><p>对 1～100 运行埃氏筛。每一步选择一个素数，再标记它尚未被划去的倍数。</p><div class="sieve-controls"><button class="btn btn-primary" id="sieve-next">下一步 →</button><button class="btn btn-white" id="sieve-reset">重新开始</button></div><div class="sieve-status" id="sieve-status" aria-live="polite"></div><div class="sieve-grid" id="sieve-grid"></div><div class="sieve-key"><span><i style="background:#e9f2ed"></i>已确认素数</span><span><i style="background:#f5dfc9"></i>本轮基数</span><span><i style="background:#ddd"></i>已排除</span></div></section>
 <section class="lab-card"><div class="eyebrow">04 / PRIME FACTORIZATION</div><h2>拆开一个数的结构</h2><p>从质因数分解，同时看见约数个数、约数和，以及欧拉函数。</p><form class="lab-inputs" id="factor-form"><label>正整数 n（1～10¹²）<input id="factor-n" value="360" inputmode="numeric" required></label><button class="btn btn-primary" type="submit">分解 →</button></form><div class="lab-output" id="factor-output" aria-live="polite"></div></section>
 <section class="lab-card"><div class="eyebrow">05 / FAST EXPONENTIATION</div><h2>快速幂的二进制轨迹</h2><p>指数每次减半，底数每次平方。看看答案在哪些轮次发生变化。</p><form class="lab-inputs" id="power-form"><label>底数 a<input id="power-a" value="3" required></label><label>指数 e<input id="power-e" value="13" required></label><label>模数 m<input id="power-m" value="1000" required></label><button class="btn btn-primary" type="submit">计算 →</button></form><div class="lab-output" id="power-output" aria-live="polite"></div></section>
 <section class="lab-card"><div class="eyebrow">06 / QUOTIENT GROUPING</div><h2>整除分块：一次算一段</h2><p>将相同的 ⌊n/d⌋ 合为一块，计算 1 到 n 的约数个数总和。</p><form class="lab-inputs" id="blocks-form"><label>n（1～10000）<input id="blocks-n" value="20" type="number" min="1" max="10000" required></label><button class="btn btn-primary" type="submit">分块 →</button></form><div class="lab-output" id="blocks-output" aria-live="polite"></div></section></div><p class="overview-source">实验限制了输入规模，以便完整呈现过程。筛法实验演示埃氏筛；线性筛的唯一生成原则请参阅「素数与筛法」。</p>`;}

function rangeLab(){return `${pageIntro('把区间操作，变成看得见的步骤。','修改数组和端点，观察前缀、差分与离散化之间的联系。','RANGE ALGORITHMS / TRY IT YOURSELF')}<div class="lab-grid">
<section class="lab-card"><div class="eyebrow">01 / PREFIX & DIFFERENCE</div><h2>前缀与差分工作台</h2><p>对闭区间 [l,r] 加 v，比较原数组、差分端点与修改后的前缀。下标从 1 开始。</p><form id="prefix-form" class="lab-inputs"><label class="wide-input">数组（1～12 个整数，空格或逗号分隔）<input id="prefix-values" value="4 3 2 1" required></label><label>l<input id="prefix-left" value="2" required></label><label>r<input id="prefix-right" value="3" required></label><label>增量 v<input id="prefix-delta" value="5" required></label><button class="btn btn-primary">演算 →</button></form><div class="lab-output" id="prefix-output" aria-live="polite"></div></section>
<section class="lab-card"><div class="eyebrow">02 / COORDINATE COMPRESSION</div><h2>离散化保留了什么</h2><p>把大坐标排序、去重，映射到紧凑下标；同时比较下标差与真实距离。</p><form id="compression-form" class="lab-inputs"><label class="wide-input">坐标（1～12 个整数）<input id="compression-values" value="100 7 100 1000000000" required></label><button class="btn btn-primary">压缩 →</button></form><div class="lab-output" id="compression-output" aria-live="polite"></div></section></div><p class="overview-source">数组元素与增量限制在 ±10⁹，坐标限制在 ±10¹²。实验限制规模以便展示每一步；课程模板适用于题面规定的更大规模。</p>`;}
function integerList(selector,max){
 const tokens=$(selector).value.trim().split(/[\s,，]+/);
 if(tokens.length<1||tokens.length>12||tokens.some(t=>! /^-?\d+$/.test(t)))throw Error('请输入 1～12 个整数，用空格或逗号分隔。');
 const values=tokens.map(Number);
 if(values.some(v=>!Number.isSafeInteger(v)||Math.abs(v)>max))throw Error('整数绝对值不能超过 '+max+'。');
 return values;
}
function prefixCalc(){safeRun('#prefix-output',()=>{
 const a=integerList('#prefix-values',1e9),n=a.length;
 const l=Number(bigintInput('#prefix-left',{min:1n,max:BigInt(n)})),r=Number(bigintInput('#prefix-right',{min:1n,max:BigInt(n)}));
 if(l>r)throw Error('左端点 l 不能大于右端点 r。');
 const v=Number(bigintInput('#prefix-delta',{min:-1000000000n,max:1000000000n}));
 const s=[0],d=[0],updated=[];
 a.forEach((x,i)=>{s.push(s[i]+x);d.push(x-(i?a[i-1]:0));});
 d.push(0);d[l]+=v;d[r+1]-=v;
 let running=0;for(let i=1;i<=n;i++){running+=d[i];updated.push(running);}
 const after=[0];updated.forEach((x,i)=>after.push(after[i]+x));
 return `<p><strong>原区间和 = S[${r}] − S[${l-1}] = ${s[r]-s[l-1]}</strong></p><p>端点变化：d[${l}] += ${v}，d[${r+1}] −= ${v}（${n+1} 为结束哨兵）</p><div class="table-wrap"><table><thead><tr><th>下标</th><th>原值</th><th>原前缀</th><th>更新后差分</th><th>还原值</th><th>新前缀</th></tr></thead><tbody>${a.map((x,i)=>`<tr><td>${i+1}</td><td>${x}</td><td>${s[i+1]}</td><td>${d[i+1]}</td><td>${updated[i]}</td><td>${after[i+1]}</td></tr>`).join('')}</tbody></table></div><p>修改后区间和 = ${after[r]-after[l-1]}；增加了 ${v*(r-l+1)}。</p>`;
});}
function compressionCalc(){safeRun('#compression-output',()=>{
 const values=integerList('#compression-values',1e12),xs=[...new Set(values)].sort((a,b)=>a-b);
 return `<p>排序去重：[${xs.join(', ')}]</p><div class="table-wrap"><table><thead><tr><th>输入顺序</th><th>原坐标</th><th>压缩下标（从 0 开始）</th></tr></thead><tbody>${values.map((v,i)=>`<tr><td>${i+1}</td><td>${v}</td><td>${xs.indexOf(v)}</td></tr>`).join('')}</tbody></table></div><p><strong>下标跨度 = ${xs.length-1}；原坐标跨度 = ${xs.at(-1)-xs[0]}</strong></p><p>相等关系与大小顺序被保留，距离需要原坐标相减。${xs.length===1?'只有一个不同坐标，没有正长度的坐标带。':xs.slice(0,-1).map((x,i)=>'['+x+', '+xs[i+1]+') 的长度为 '+(xs[i+1]-x)).join('；')+'。'}</p>`;
});}

function bigintInput(id,{min=-(10n**18n),max=10n**18n}={}) {const text=$(id).value.trim();if(!/^-?\d+$/.test(text))throw Error('请输入不含小数的整数。');const n=BigInt(text);if(n<min||n>max)throw Error(`输入范围为 ${min}～${max}。`);return n;}
function safeRun(target,fn){try{$(target).innerHTML=fn();}catch(e){$(target).innerHTML=`<span class="error">${escapeHTML(e.message)}</span>`;}}
function baseCalc(){safeRun('#base-output',()=>{let n=bigintInput('#base-value'),base=bigintInput('#base-radix',{min:-36n,max:36n});if(base>=-1n&&base<=1n)throw Error('基数的绝对值需要为 2～36。');const original=n,negative=base>0n&&n<0n;if(negative)n=-n;let out='',rows=[];const digits='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';if(n===0n)out='0';while(n!==0n){const old=n;let rem=n%base;n/=base;if(rem<0n){rem-=base;n++;}rows.push(`${old} = (${base}) × (${n}) + ${rem}`);out=digits[Number(rem)]+out;}return `<p><strong>${original} = ${negative?'-':''}${out}（${base} 进制）</strong></p>${negative?'<p>正基数先转换绝对值，最后加上负号。</p>':''}${rows.map(r=>`<div class="gcd-step">${r}</div>`).join('')}<p style="margin-top:12px">${rows.length?'从下向上读取余数，即得到数码。':'0 在任何合法基数下都写作 0。'}</p>`;});}
function gcdCalc(){safeRun('#gcd-output',()=>{let a=bigintInput('#gcd-a',{min:0n}),b=bigintInput('#gcd-b',{min:0n});const origA=a,origB=b;if(a===0n&&b===0n)throw Error('至少一个数须大于 0。');const rows=[];while(b){rows.push(`${a} = ${b} × ${a/b} + ${a%b}`);[a,b]=[b,a%b];}return `${rows.map(r=>`<div class="gcd-step">${r}</div>`).join('')}<p style="margin-top:12px"><strong>GCD = ${a}</strong>　·　LCM = ${origA/a*origB}</p>`;});}
let sieveStep=0;
function renderSieve(){const bases=[2,3,5,7],bad=new Set([1]);for(const p of bases.slice(0,sieveStep))for(let v=p*p;v<=100;v+=p)bad.add(v);const last=sieveStep?bases[sieveStep-1]:null;$('#sieve-grid').innerHTML=Array.from({length:100},(_,i)=>{const n=i+1;const prime=!bad.has(n)&&(sieveStep===4||n<=last);return `<span class="sieve-cell ${bad.has(n)?'removed':prime?'prime':''} ${n===last?'current':''}" title="${n}${bad.has(n)?'：已排除':prime?'：素数':'：待判断'}">${n}</span>`;}).join('');$('#sieve-status').textContent=sieveStep===0?'准备好了。1 不是素数，先将它排除。':sieveStep===4?'处理 7 的倍数后已完成！√100=10，所有剩余的 25 个数都是素数。':`第 ${sieveStep} 步：选中素数 ${last}，从 ${last}² = ${last*last} 起标记它的倍数。`;$('#sieve-next').disabled=sieveStep===4;}
function factorCalc(){safeRun('#factor-output',()=>{const original=bigintInput('#factor-n',{min:1n,max:10n**12n});let n=original,phi=n,tau=1n,sigma=1n;const f=[];for(let p=2n;p*p<=n;p+=(p===2n?1n:2n)){if(n%p)continue;let e=0,term=1n,sum=1n;while(n%p===0n){n/=p;e++;term*=p;sum+=term;}f.push([p,e]);tau*=BigInt(e+1);sigma*=sum;phi=phi/p*(p-1n);}if(n>1n){f.push([n,1]);tau*=2n;sigma*=1n+n;phi=phi/n*(n-1n);}return `<p>${original} 的质因数分解</p><div class="factor-chips">${f.length?f.map(([p,e])=>`<span class="factor-chip">${p}<sup>${e}</sup></span>`).join('<span>×</span>'):'<span class="factor-chip">1（空乘积）</span>'}</div><p>正约数个数 τ(n) = <strong>${tau}</strong></p><p>正约数之和 σ(n) = <strong>${sigma}</strong></p><p>欧拉函数 φ(n) = <strong>${phi}</strong></p><p>不互质个数 n−φ(n) = <strong>${original-phi}</strong></p>`;});}
function powerCalc(){safeRun('#power-output',()=>{let a=bigintInput('#power-a'),e=bigintInput('#power-e',{min:0n}),m=bigintInput('#power-m',{min:1n});const originalA=a,originalE=e;let ans=1n%m;a=(a%m+m)%m;const rows=[];while(e){const used=Boolean(e&1n);if(used)ans=ans*a%m;rows.push(`<tr><td>${e}</td><td>${a}</td><td>${used?'乘入 ✓':'跳过'}</td><td>${ans}</td></tr>`);a=a*a%m;e>>=1n;}return `<p><strong>${originalA}<sup>${originalE}</sup> mod ${m} = ${ans}</strong></p>${rows.length?`<div class="table-wrap"><table><thead><tr><th>剩余指数</th><th>当前底数</th><th>动作</th><th>累积结果</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`:'<p>指数为 0，直接返回 1 mod m。</p>'}`;});}
function blocksCalc(){safeRun('#blocks-output',()=>{const n=Number(bigintInput('#blocks-n',{min:1n,max:10000n}));let sum=0,rows=[];for(let l=1,r;l<=n;l=r+1){const q=Math.floor(n/l);r=Math.floor(n/q);sum+=q*(r-l+1);rows.push(`<tr><td>${l}～${r}</td><td>${q}</td><td>${r-l+1}</td><td>${q*(r-l+1)}</td></tr>`);}return `<p><strong>约数个数总和 = ${sum}</strong></p><p>${n} 次枚举 → ${rows.length} 个分块</p><div class="table-wrap"><table><thead><tr><th>d 的区间</th><th>⌊n/d⌋</th><th>长度</th><th>贡献</th></tr></thead><tbody>${rows.join('')}</tbody></table></div>`;});}
function setupLab(){if(state.module==='range'){prefixCalc();compressionCalc();return;}baseCalc();gcdCalc();sieveStep=0;renderSieve();factorCalc();powerCalc();blocksCalc();}
function search(query){const q=query.trim().toLowerCase();const results=[...chapters.filter(c=>`${c.title} ${c.tags.join(' ')} ${c.short}`.toLowerCase().includes(q)).map(c=>({href:`#lesson/${c.id}`,title:c.title,sub:`知识章节 · ${c.tags.join(' / ')}`})),...problems.filter(p=>`${p.id} ${p.name} ${p.tags.join(' ')} ${p.summary}`.toLowerCase().includes(q)).map(p=>({href:`#problem/${p.id}`,title:`${p.id} · ${p.name}`,sub:`题目讲解 · ${p.tags.join(' / ')}`}))];$('#search-results').innerHTML=results.length?results.map(r=>`<a class="search-result" href="${r.href}" data-search-result>${r.title}<small>${r.sub}</small></a>`).join(''):'<div class="empty-state">没有找到结果，试试「素数」「GCD」或题号。</div>';}
function openSearch(){$('#search-dialog').showModal();$('#search-input').value='';search('');$('#search-input').focus();}
let currentView='overview';
function route(){
 let [name,id]=(location.hash.slice(1)||'overview').split('/');
 const previousModule=state.module;
 if(name==='module'){
  selectModule(learningModules.some(m=>m.id===id)?id:'math');
  name='overview';
 }
 if(name==='lesson'||name==='problem'){
  const target=learningModules.find(m=>(name==='lesson'?m.chapterIds:m.problemIds).includes(id));
  if(target)selectModule(target.id);
 }
 if(name==='problem'){
  if(!problems.some(p=>p.id===id)){toast('没有找到这道题。');location.hash='problems';return;}
  if(!$('#main').innerHTML||previousModule!==state.module){
   $('#main').innerHTML=problemPage();currentView='problems';
   $('#status-filter').value=statusFilter;
   renderNav('problems');$('#page-crumb').textContent='题单精读';
  }
  $('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');
  problemDetail(id);document.title=id+' · '+activeModule().title+' · 数论研习室';
  return;
 }
 if($('#problem-dialog').open)$('#problem-dialog').close();
 const view=['overview','lesson','problems','lab','notebook'].includes(name)?name:'overview';
 currentView=view;
 const names={overview:'学习概览',lesson:'知识讲解',problems:'题单精读',lab:'算法实验室',notebook:'我的学习记录'};
 $('#page-crumb').textContent=names[view];
 document.title=`${view==='lesson'?(chapters.find(c=>c.id===id)||moduleChapters()[0]).title:activeModule().title+' · '+names[view]} · 数论研习室`;
 $('#main').innerHTML=view==='overview'?overview():view==='lesson'?lesson(id):view==='problems'?problemPage():view==='lab'?lab():notebook();
 renderNav(view,view==='lesson'?state.last:null);
 if(view==='lab')setupLab();
 if(view==='problems')$('#status-filter').value=statusFilter;
 $('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');
 window.scrollTo(0,0);
}
document.addEventListener('click',async e=>{
 const t=e.target.closest('button,a');if(!t)return;
 if(t.id==='open-search')openSearch();
 if(t.id==='menu-toggle'){const open=$('#sidebar').classList.toggle('open');t.setAttribute('aria-expanded',open);}
 if(t.dataset.close){$('#'+t.dataset.close).close();}
 if(t.hasAttribute('data-search-result')){$('#search-dialog').close();if(t.getAttribute('href')===location.hash)route();}
 if(t.dataset.problem)problemDetail(t.dataset.problem);
 if(t.dataset.save){const id=t.dataset.save;const was=state.saved.includes(id);state.saved=was?state.saved.filter(x=>x!==id):[...state.saved,id];persist();if($('#problem-dialog').open)problemDetail(id);updateProblemTable();if(currentView==='notebook')$('#main').innerHTML=notebook();toast(was?'已取消收藏':'已加入收藏');}
 if(t.dataset.toggleSolved){const id=t.dataset.toggleSolved;state.solved=state.solved.includes(id)?state.solved.filter(x=>x!==id):[...state.solved,id];persist();if($('#problem-dialog').open)problemDetail(id);updateProblemTable();if(currentView==='notebook')$('#main').innerHTML=notebook();}
 if(t.dataset.complete){const id=t.dataset.complete;state.completed=state.completed.includes(id)?state.completed.filter(x=>x!==id):[...state.completed,id];persist();const y=window.scrollY;$('#main').innerHTML=lesson(id);renderNav('lesson',id);window.scrollTo(0,y);toast(state.completed.includes(id)?'本章已完成，继续保持！':'已撤销完成标记');}
 if(t.dataset.section){e.preventDefault();$('#'+t.dataset.section)?.scrollIntoView({behavior:'smooth',block:'start'});}
 if(t.dataset.filter){problemFilter=t.dataset.filter;$$('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===problemFilter));updateProblemTable();}
 if(t.hasAttribute('data-answer')){const box=t.closest('[data-quiz]'),c=chapters.find(c=>c.id===box.dataset.quiz);const correct=Number(t.dataset.answer)===c.quiz.answer;$$('.quiz-option',box).forEach(b=>b.classList.remove('correct','incorrect'));t.classList.add(correct?'correct':'incorrect');$('.quiz-feedback',box).textContent=(correct?'答对了！':'再想一想：')+c.quiz.explain;}
 if(t.classList.contains('copy-code')){const text=$('code',t.closest('.code-wrap')).textContent;try{await navigator.clipboard.writeText(text);t.textContent='已复制 ✓';setTimeout(()=>t.textContent='复制代码',1800);}catch{const range=document.createRange();range.selectNodeContents($('code',t.closest('.code-wrap')));const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);toast('代码已选中，请按 Ctrl+C 复制。');}}
 if(t.id==='print-lesson')window.print();
 if(t.id==='sieve-next'){sieveStep++;renderSieve();}
 if(t.id==='sieve-reset'){sieveStep=0;renderSieve();}
 if(t.id==='export-progress'){const blob=new Blob([JSON.stringify({site:'数论研习室',exportedAt:new Date().toISOString(),...state},null,2)],{type:'application/json'});const link=document.createElement('a');const url=URL.createObjectURL(blob);link.href=url;link.download='数论研习室-学习记录.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('学习记录已导出');}
});
document.addEventListener('click',e=>{if($('#sidebar').classList.contains('open')&&!e.target.closest('#sidebar')&&!e.target.closest('#menu-toggle')){$('#sidebar').classList.remove('open');$('#menu-toggle').setAttribute('aria-expanded','false');}});
document.addEventListener('submit',e=>{const functions={'base-form':baseCalc,'gcd-form':gcdCalc,'factor-form':factorCalc,'power-form':powerCalc,'blocks-form':blocksCalc,'prefix-form':prefixCalc,'compression-form':compressionCalc};if(functions[e.target.id]){e.preventDefault();functions[e.target.id]();}});
document.addEventListener('change',e=>{if(e.target.id==='status-filter'){statusFilter=e.target.value;updateProblemTable();}});
$('#search-input').addEventListener('input',e=>search(e.target.value));
document.addEventListener('keydown',e=>{if(e.key==='/'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!$('dialog[open]')){e.preventDefault();openSearch();}});
for(const dialog of $$('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('#problem-dialog').addEventListener('close',()=>{activeProblem=null;if(location.hash.startsWith('#problem/'))history.replaceState(null,'',`#${currentView==='lesson'?'lesson/'+state.last:currentView}`);});
window.addEventListener('hashchange',route);
route();
