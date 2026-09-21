const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const ctx={};vm.createContext(ctx);
vm.runInContext(['content.js','content-range.js'].map(f=>fs.readFileSync(path.join(__dirname,f),'utf8')).join('\n')+';globalThis.data={chapters,problems,rangeChapters,learningModules}',ctx);
const {chapters,problems,rangeChapters,learningModules}=ctx.data;
assert.equal(chapters.length,14);assert.equal(problems.length,42);
assert.equal(new Set(chapters.map(c=>c.id)).size,14);assert.equal(new Set(problems.map(p=>p.id)).size,42);
const snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,'source-training-200.json'),'utf8'));
assert.deepEqual([...learningModules[1].problemIds].sort(),snapshot.problems.map(p=>p.id).sort());
for(const c of chapters){assert.equal((c.body().match(/<h2 id=/g)||[]).length,c.sections.length);assert(c.quiz.answer>=0&&c.quiz.answer<c.quiz.options.length);for(const id of c.problems)assert(problems.some(p=>p.id===id));}
for(const p of problems)assert(chapters.some(c=>c.id===p.chapter&&c.problems.includes(p.id)));
for(const m of learningModules)for(const id of m.problemIds)assert(m.chapterIds.some(cid=>chapters.find(c=>c.id===cid).problems.includes(id)));
for(const p of snapshot.problems){const note=problems.find(x=>x.id===p.id);assert.equal(note.name,p.title);assert.equal(note.difficulty,p.difficulty);}
const snippets=rangeChapters.flatMap(c=>[...c.body().matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)].map(m=>m[1].replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&')));
const test=`
int main(){
    mt19937 rng(200);
    for(int n=1;n<=25;++n){
        vector<long long>a(n+1),d(n+2);
        for(int i=1;i<=n;++i){a[i]=int(rng()%21)-10;d[i]=a[i]-a[i-1];}
        auto s=prefixSum(a);
        for(int l=1;l<=n;++l)for(int r=l;r<=n;++r){long long sum=0;for(int j=l;j<=r;++j)sum+=a[j];assert(rangeSum(s,l,r)==sum);}
        for(int t=0;t<30;++t){int l=rng()%n+1,r=rng()%n+1;if(l>r)swap(l,r);long long v=int(rng()%21)-10;addRange(d,l,r,v);for(int j=l;j<=r;++j)a[j]+=v;}
        long long value=0;for(int i=1;i<=n;++i){value+=d[i];assert(value==a[i]);}
    }
    for(int n=1;n<=5;++n)for(int m=1;m<=5;++m){
        vector<vector<long long>>a(n+1,vector<long long>(m+1)),d(n+2,vector<long long>(m+2)),plain(n,vector<long long>(m));
        for(int i=1;i<=n;++i)for(int j=1;j<=m;++j)a[i][j]=plain[i-1][j-1]=int(rng()%21)-10;
        auto s=prefix2D(a);long long best=LLONG_MIN;
        for(int x=1;x<=n;++x)for(int y=1;y<=m;++y)for(int xx=x;xx<=n;++xx)for(int yy=y;yy<=m;++yy){long long sum=0;for(int i=x;i<=xx;++i)for(int j=y;j<=yy;++j)sum+=a[i][j];assert(rectSum(s,x,y,xx,yy)==sum);best=max(best,sum);}
        assert(maxRectangle(plain)==best);
        for(auto& row:a)fill(row.begin(),row.end(),0);
        for(int t=0;t<20;++t){int x=rng()%n+1,xx=rng()%n+1,y=rng()%m+1,yy=rng()%m+1;if(x>xx)swap(x,xx);if(y>yy)swap(y,yy);int v=int(rng()%11)-5;addRect(d,x,y,xx,yy,v);for(int i=x;i<=xx;++i)for(int j=y;j<=yy;++j)a[i][j]+=v;}
        for(int i=1;i<=n;++i)for(int j=1;j<=m;++j){d[i][j]+=d[i-1][j]+d[i][j-1]-d[i-1][j-1];assert(d[i][j]==a[i][j]);}
    }
    assert(maxRectangle({{-5,-2},{-9,-7}})==-2);
    auto xs=compressValues({100,7,100,1000000000});assert((xs==vector<long long>{7,100,1000000000}));assert(compressedIndex(xs,100)==1);
    vector<long long>capacity={0,2,5,4,3};vector<RoomOrder>orders={{2,1,3},{3,2,4},{4,2,4}};
    assert(roomFeasible(capacity,orders,0));assert(roomFeasible(capacity,orders,1));assert(!roomFeasible(capacity,orders,2));
    assert(!roomFeasible({0,1000000000},{{1000000000,1,1},{1000000000,1,1},{1000000000,1,1}},3));
    for(int trial=0;trial<200;++trial){ParityDSU dsu(6);vector<tuple<int,int,int>> edges;
        for(int t=0;t<20;++t){int a=rng()%6,b=rng()%6,p=rng()%2;edges.push_back({a,b,p});bool possible=false;
            for(int mask=0;mask<64;++mask){bool ok=true;for(auto [x,y,v]:edges)if((((mask>>x)^(mask>>y))&1)!=v)ok=false;possible|=ok;}
            assert(dsu.join(a,b,p)==possible);if(!possible)break;
        }
    }
    cout<<"PASS: displayed prefix, 2D prefix, difference, max rectangle, compression, room checks and parity DSU templates.\\n";
}`;
const out=path.join(__dirname,'.verification');fs.mkdirSync(out,{recursive:true});
const cpp=path.join(out,'range-templates.cpp'),exe=path.join(out,process.platform==='win32'?'range-templates.exe':'range-templates');
fs.writeFileSync(cpp,'#include <bits/stdc++.h>\nusing namespace std;\n'+snippets.join('\n')+test);
execFileSync('g++',['-std=c++17','-O2',cpp,'-o',exe],{stdio:'inherit'});execFileSync(exe,[],{stdio:'inherit'});

// P4375: compare the stated cut-count rule with the original bidirectional loop.
function predicted(a){const order=a.map((v,i)=>({v,i})).sort((a,b)=>a.v-b.v||a.i-b.i),d=Array(a.length+1).fill(0);order.forEach((o,rank)=>{if(rank>o.i){d[o.i]++;d[rank]--;}});let now=0,best=1;for(const x of d){now+=x;best=Math.max(best,now);}return best;}
function simulated(a){a=[...a];let rounds=0,sorted=false;while(!sorted){rounds++;for(let i=0;i<a.length-1;i++)if(a[i]>a[i+1])[a[i],a[i+1]]=[a[i+1],a[i]];for(let i=a.length-2;i>=0;i--)if(a[i]>a[i+1])[a[i],a[i+1]]=[a[i+1],a[i]];sorted=a.every((v,i)=>i===0||a[i-1]<=v);}return rounds;}
for(let n=1;n<=8;n++)for(let mask=0;mask<3**n;mask++){let x=mask;const a=Array.from({length:n},()=>{const v=x%3;x=Math.floor(x/3);return v;});assert.equal(predicted(a),simulated(a),JSON.stringify(a));}

// P3017: compare greedy feasibility with all horizontal and per-strip vertical cuts.
function partitions(n,k){const out=[];function rec(start,left,cuts){if(left===0){out.push([0,...cuts,n]);return;}for(let i=start;i<=n-left;i++)rec(i+1,left-1,[...cuts,i]);}rec(1,k-1,[]);return out;}
function brownieBrute(grid,A,B){const R=grid.length,C=grid[0].length;let best=0;for(const rows of partitions(R,A)){let worst=Infinity;for(let s=0;s<A;s++){let stripBest=0;for(const cols of partitions(C,B)){let min=Infinity;for(let t=0;t<B;t++){let sum=0;for(let i=rows[s];i<rows[s+1];i++)for(let j=cols[t];j<cols[t+1];j++)sum+=grid[i][j];min=Math.min(min,sum);}stripBest=Math.max(stripBest,min);}worst=Math.min(worst,stripBest);}best=Math.max(best,worst);}return best;}
function brownieCheck(grid,A,B,T){let strips=0,col=Array(grid[0].length).fill(0);for(const row of grid){row.forEach((x,j)=>col[j]+=x);let blocks=0,sum=0;for(const x of col){sum+=x;if(sum>=T){blocks++;sum=0;}}if(blocks>=B){strips++;col.fill(0);}}return strips>=A;}
let seed=200;function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;}
for(let trial=0;trial<120;trial++){const R=rand()%4+1,C=rand()%4+1,grid=Array.from({length:R},()=>Array.from({length:C},()=>rand()%5));for(let A=1;A<=R;A++)for(let B=1;B<=C;B++){const best=brownieBrute(grid,A,B);assert(brownieCheck(grid,A,B,best));assert(!brownieCheck(grid,A,B,best+1));}}
console.log('PASS: source coverage and metadata; P4375 exhaustive ternary arrays through length 8; P3017 greedy vs exhaustive cuts on 120 small grids.');
