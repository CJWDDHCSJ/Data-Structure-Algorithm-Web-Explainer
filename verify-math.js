const fs=require('node:fs');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('content.js','utf8')+';globalThis.lessonData=chapters',ctx);
const snippets=ctx.lessonData.flatMap(c=>[...c.body().matchAll(/<pre><code>([\s\S]*?)<\/code><\/pre>/g)].map(m=>m[1].replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&amp;','&')));
const picked=snippets.filter(s=>['long long parse(','long long gcdll(','vector<pair<long long, int>> factor(','long long modpow(','pair<long long, long long> powerSum(','long long divisorCountSum('].some(t=>s.includes(t)));
const test=`
int main() {
  for (int base=-20;base<=16; ++base) {
    if (base>=-1 && base<=1) continue;
    for (int n=-1000;n<=1000;++n) {
      if (base>0 && n<0) continue;
      string s=encode(n,base); long long back=0;
      for(char c:s) back=back*base+(c<='9'?c-'0':c-'A'+10);
      assert(back==n);
    }
  }
  assert(parse("FF",16)==255);
  for (int a=0;a<100;++a) for(int b=0;b<100;++b) {
    assert(gcdll(a,b)==std::gcd(a,b));
    assert(lcmll(a,b)==std::lcm(a,b));
  }
  for(int n=1;n<=10000;++n) {
    long long value=1;
    for(auto [p,e]:factor(n)) {for(int d=2;d*d<=p;d++)assert(p%d);while(e--)value*=p;}
    assert(value==n);
  }
  for(int m=1;m<=35;++m) for(int p=0;p<=40;++p) for(int n=0;n<=40;++n) {
    long long power=1%m,sum=0;
    for(int j=0;j<n;++j){sum=(sum+power)%m;power=power*p%m;}
    auto got=powerSum(p,n,m);
    assert(got.first==power && got.second==sum);
    assert(modpow(p,n,m)==power);
  }
  for(int n=1;n<=1000;++n) {long long expected=0;for(int i=1;i<=n;++i)expected+=n/i;assert(divisorCountSum(n)==expected);}
  assert(powerSum(9902,12346,9901).second==12346%9901);
  assert(modpow(LLONG_MAX-1,1,LLONG_MAX)==LLONG_MAX-1);
  assert(modpow(-1,3,LLONG_MAX)==LLONG_MAX-1);
  assert(powerSum(LLONG_MAX-1,3,LLONG_MAX).second==1);
  cout<<"PASS: displayed C++17 templates compile; base conversion, GCD/LCM, factorization, fast powers, geometric sums and quotient grouping match independent small-case calculations.\\n";
}`;
fs.mkdirSync('.verification',{recursive:true});
fs.writeFileSync('.verification/templates.cpp','#include <bits/stdc++.h>\nusing namespace std;\n'+picked.join('\n')+'\n'+test);
execFileSync('g++',['-std=c++17','-O2','.verification/templates.cpp','-o','.verification/templates.exe'],{stdio:'inherit'});
execFileSync('.verification/templates.exe',[],{stdio:'inherit'});
