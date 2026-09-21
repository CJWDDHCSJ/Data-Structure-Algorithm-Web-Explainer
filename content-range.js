'use strict';
// 独立编写；依据 source-training-200.json，核对日期 2026-09-21。
const rangeChapters = [
{id:'range-prefix',title:'一维前缀和',short:'用一次累积回答任意区间求和',icon:'Sᵢ',color:'#7e97b1',tint:'#eef3f8',time:20,level:'入门',tags:['前缀和','区间查询','边界'],problems:['P8218'],sections:['从重复求和到预处理','下标与核心模板','适用条件与局限','手算与边界自检'],intro:'先保存从起点到每个位置的总和，再用两个前缀相减得到一段。统一下标约定，是二维前缀、差分和前缀奇偶关系的基础。',body:()=>`
<h2 id="s0">01 / 从重复求和到预处理</h2><p>对长度为 n 的静态数组，每次遍历 [l,r] 求和，m 次查询最坏需要 O(nm)。令 S[i] 表示前 i 个数之和，S[0]=0；S[r] 包含目标区间以及它前面的部分，减去 S[l−1] 恰好留下目标区间。</p>${formula('S[i]=S[i−1]+a[i]<br>sum(l,r)=S[r]−S[l−1]','数组下标从 1 开始，查询区间两端均包含。')}<p>P8218 的 n、m 均可达 10⁵。预处理一次 O(n)，每次查询 O(1)，总时间 O(n+m)、空间 O(n)。没有修改操作时，不需要树状数组或线段树。</p>
<h2 id="s1">02 / 下标与核心模板</h2>${codeBlock(`// a[0] 占位；合法查询满足 1 <= l <= r < a.size()
vector<long long> prefixSum(const vector<long long>& a) {
    vector<long long> s(a.size(), 0);
    for (int i=1; i<(int)a.size(); ++i) s[i]=s[i-1]+a[i];
    return s;
}
long long rangeSum(const vector<long long>& s, int l, int r) {
    return s[r]-s[l-1];
}`)}<p>多开下标 0 的空前缀，可以统一处理 l=1。如果使用从 0 开始的原数组，常见约定是 S[i] 保存 a[0…i−1]，闭区间 [l,r] 的答案就变成 S[r+1]−S[l]。两套约定都正确，但不能混用。</p>
<h2 id="s2">03 / 适用条件与局限</h2><p>前缀和依赖加法可以通过减法消去前半段。出现负数不会破坏求和公式，但会破坏“和随区间扩张一定增加”的单调性。前缀最大值没有类似减法：知道前 r 项和前 l−1 项的最大值，无法还原 [l,r] 的最大值。</p>${tip('静态查询与动态修改','修改 a[i] 会影响它之后所有前缀。若修改和查询在线交替进行，应考虑树状数组或线段树；若只需所有区间修改后的最终结果，可以使用差分。')}<p>前缀也能统计满足条件的元素个数，或累计这些元素的权值。P1314 同时维护“合格矿石数量”和“合格矿石价值和”，查询区间后将两项相乘。</p>
<h2 id="s3">04 / 手算与边界自检</h2><p>数组 [4,3,2,1] 的前缀为 [0,4,7,9,10]。[2,3] 的和是 9−4=5；[1,4] 是 10−0=10；单点 [3,3] 是 9−7=2。</p><ul><li>空前缀初始化为 0，查询减去 l−1。</li><li>累计值范围比元素更大，通用模板使用 long long。</li><li>先完成前缀构建，再按任意顺序查询。</li><li>P8218 输入先给 n 与数组，再给 m 与查询，注意读取顺序。</li></ul>`,quiz:{q:'a=[4,3,2,1]，查询 [2,4] 应计算？',options:['S[4]−S[2]','S[4]−S[1]','S[3]−S[1]'],answer:1,explain:'减去第 2 项之前的前缀：10−4=6。'}},
{id:'range-grid',title:'二维前缀与矩形优化',short:'用容斥求矩形和，用降维减少枚举',icon:'▦',color:'#899d7e',tint:'#f0f4eb',time:30,level:'基础',tags:['二维前缀','容斥','最大子段和'],problems:['P2004','P1719'],sections:['矩形前缀的容斥','二维查询模板','固定大小：枚举左上角','任意大小：压缩行'],intro:'二维前缀让每个矩形的求和变成常数次运算，但不自动减少矩形数量。根据矩形大小是否固定，选择直接枚举或降维优化。',body:()=>`
<h2 id="s0">01 / 矩形前缀的容斥</h2><p>S[i][j] 保存 (1,1)…(i,j) 的矩形和。上方前缀和左方前缀相加时，左上角重复一次，所以减去它，再加当前格子。查询也用相同的容斥原则。</p>${formula('S[i][j]=a[i][j]+S[i−1][j]+S[i][j−1]−S[i−1][j−1]<br>sum=S[x₂][y₂]−S[x₁−1][y₂]−S[x₂][y₁−1]+S[x₁−1][y₁−1]','第一维是行，第二维是列；第 0 行、第 0 列均为 0。')}
<h2 id="s1">02 / 二维查询模板</h2>${codeBlock(`// a 含第 0 行、第 0 列占位，输入为非空矩形
vector<vector<long long>> prefix2D(const vector<vector<long long>>& a) {
    int n=a.size()-1, m=a[0].size()-1;
    vector<vector<long long>> s(n+1, vector<long long>(m+1));
    for (int i=1; i<=n; ++i)
        for (int j=1; j<=m; ++j)
            s[i][j]=a[i][j]+s[i-1][j]+s[i][j-1]-s[i-1][j-1];
    return s;
}
long long rectSum(const vector<vector<long long>>& s,
                  int x1, int y1, int x2, int y2) {
    return s[x2][y2]-s[x1-1][y2]-s[x2][y1-1]+s[x1-1][y1-1];
}`)}<p>预处理 O(NM)，单次查询 O(1)，空间 O(NM)。例如 [[1,2],[3,4]] 全矩形和为 10，第二列的和为 6。减两块再补一块，补的是它们的交集。</p>
<h2 id="s2">03 / 固定大小：枚举左上角</h2><p>P2004 只允许 C×C 正方形。枚举 1≤x≤N−C+1、1≤y≤M−C+1，每次查询 (x,y)…(x+C−1,y+C−1)，候选数量 O(NM)，所以总时间 O(NM)。题目要求左上角坐标，不能只输出最大和。</p>${tip('负数与溢出','地块可以为负，最优值初始化为 LLONG_MIN 或第一个合法矩形，不能设为 0。1000×1000 个绝对值为 32767 的数求和会超过 32 位，前缀数组和比较值都使用 long long。')}
<h2 id="s3">04 / 任意大小：压缩行</h2><p>P1719 允许任意非空矩形。枚举四条边有 O(n⁴) 个候选。固定上边界 top，逐步下移 bottom，将这些行按列累加成一维数组 col。选择左右边界就变成 col 的非空最大子段和。</p>${codeBlock(`long long maxRectangle(const vector<vector<long long>>& a) {
    int n=a.size(), m=a[0].size(); // 此处矩阵下标从 0 开始
    long long best=LLONG_MIN;
    for (int top=0; top<n; ++top) {
        vector<long long> col(m, 0);
        for (int bottom=top; bottom<n; ++bottom) {
            for (int j=0; j<m; ++j) col[j]+=a[bottom][j];
            long long ending=col[0];
            best=max(best, ending);
            for (int j=1; j<m; ++j) {
                ending=max(col[j], ending+col[j]);
                best=max(best, ending);
            }
        }
    }
    return best;
}`)}<p>Kadane 的 ending 是“必须以当前列结尾”的最大和：要么重新开始，要么接上前一段。方阵总时间 O(n³)，输入外空间 O(n)。全负矩阵也必须选一个格子，答案是最大的那个负数。</p>`,quiz:{q:'P1719 的矩阵全部为负数，答案是什么？',options:['0，选择空矩形','所有元素之和','最大的单个元素'],answer:2,explain:'矩形必须非空，添加更多负数只会减小总和。'}},
{id:'range-diff',title:'差分与批量区间修改',short:'把整段变化浓缩为端点变化',icon:'Δ',color:'#b59872',tint:'#f8f2e8',time:40,level:'基础',tags:['一维差分','二维差分','贪心'],problems:['P2367','P3397','P3406','P2882','P4552'],sections:['前缀和的逆操作','二维差分与边界','边的次数与固定长度翻转','序列相等：差分配对'],intro:'差分记录相邻元素的变化。区间加只影响边界，最后一次前缀还原全部结果。它还可以统计边的使用次数、维护翻转奇偶和推导最少操作数。',body:()=>`
<h2 id="s0">01 / 前缀和的逆操作</h2><p>令 d[i]=a[i]−a[i−1]，a[0]=0。对 d 求前缀即可还原 a。给闭区间 [l,r] 加 v 后，内部相邻项同时增加、差不变，只有左边界增加 v，右边界之后减少 v。</p>${formula('d[l]+=v，d[r+1]−=v<br>a[i]=d[1]+…+d[i]')}${codeBlock(`// d 至少分配 n+2 项；只记录变化，不立即还原
void addRange(vector<long long>& d, int l, int r, long long v) {
    d[l]+=v;
    d[r+1]-=v;
}`)}<p>P2367 可在读入初始成绩时直接构建 d，记录全部修改，最后累计 d 并取最小值，O(n+p) 时间、O(n) 空间。n 可达 5×10⁶，避免同时保存多份不需要的数组。</p>${tip('必须带上初始数组','可初始化原数组的差分，也可把修改量单独累计后加回原值。不能把增量当最终成绩。每次 O(1) 是记录操作的开销，还原所有最终值仍需 O(n)。')}
<h2 id="s1">02 / 二维差分与边界</h2><p>P3397 给闭矩形加 1，在二维差分四角标记。左上角开始生效，再分别消去超出下边和右边的影响，右下角被减两次，需要加回。</p>${codeBlock(`// d 至少 (n+2)*(m+2)，坐标从 1 开始，区间两端均包含
void addRect(vector<vector<long long>>& d,
             int x1, int y1, int x2, int y2, long long v) {
    d[x1][y1]+=v; d[x2+1][y1]-=v;
    d[x1][y2+1]-=v; d[x2+1][y2+1]+=v;
}
// 全部修改结束，按 i、j 递增顺序还原：
// d[i][j] += d[i-1][j]+d[i][j-1]-d[i-1][j-1];
`)}<p>m 次铺地毯后，用二维前缀还原 n² 个格子，O(m+n²) 时间。没有覆盖的格子输出 0，数组留出 n+1 的哨兵，避免越界。</p>
<h2 id="s2">03 / 边的次数与固定长度翻转</h2><p>P3406 从 u 到 v，使用编号 min(u,v)…max(u,v)−1 的边。令 l=min(u,v)、r=max(u,v)，执行 d[l]++、d[r]--。还原使用次数 c 后，各边独立选 min(cA,cB+C) 再求和。</p><p>P2882 先枚举翻转长度 K，再从左到右扫描，用结束标记维护仍生效的翻转奇偶。当前牛若朝后，就必须从这里翻转，否则以后无法改变它而不破坏已处理的前缀。在 i+K 撤销影响；如果不足 K 头，则这个 K 无解。</p><p>每个 K 模拟 O(N)，全部 O(N²)。按 K 从小到大枚举，仅当次数严格更少才更新，保证同样次数下 K 最小。这一贪心由最左错误位置强制决定，而非任意选区间翻转。</p>
<h2 id="s3">04 / 序列相等：差分配对</h2><p>P4552 要全体相等，等价于 d[2…n] 全为 0；d[1] 是公共值，不必为 0。设内部正差分和为 P、负差分绝对值和为 Q。</p>${formula('最少操作数=max(P,Q)<br>最优最终数列种数=|P−Q|+1','仅统计 d[2…n]，不含 d[1] 和末尾哨兵。')}<p>一次区间操作最多消去一个正差分单位和一个负差分单位。先配对 min(P,Q) 次，剩下 |P−Q| 个单位经左端 d[1] 或右端哨兵吸收。分给 d[1] 的个数从 0 到 |P−Q| 均可，产生 |P−Q|+1 个公共值。累计 P、Q 使用 long long。</p><p>[1,1,2,2] 的内部差分为 [0,1,0]，P=1、Q=0。一次可变为全 1 或全 2，最少 1 次、2 种结果。n=1 时无需操作，只有原值一种结果。</p>`,quiz:{q:'给闭区间 [2,4] 加 3，应怎样更新差分？',options:['d[2]+=3，d[4]−=3','d[2]+=3，d[5]−=3','d[1]+=3，d[4]−=3'],answer:1,explain:'从 2 开始生效，在 4 的下一个位置 5 结束。'}}
];

rangeChapters.push(
{id:'range-compress',title:'离散化、扫描与覆盖',short:'保留顺序和原坐标，处理稀疏大值域',icon:'↦',color:'#a68d7e',tint:'#f7f0ea',time:45,level:'进阶',tags:['离散化','扫描线','双指针'],problems:['P1496','P1884','P3029','P1904','P4375'],sections:['排序去重与两种含义','区间并与矩形面积并','类别覆盖与天际线','稳定排名与跨界计数'],intro:'坐标很大但出现的点不多时，只保存有用坐标。离散化保留大小和相等关系，不保留距离；长度和面积仍须回到原坐标计算。',body:()=>`
<h2 id="s0">01 / 排序去重与两种含义</h2>${codeBlock(`vector<long long> compressValues(vector<long long> x) {
    sort(x.begin(), x.end());
    x.erase(unique(x.begin(), x.end()), x.end());
    return x;
}
int compressedIndex(const vector<long long>& xs, long long x) {
    // x 必须已被收集；返回从 0 开始的下标
    return lower_bound(xs.begin(), xs.end(), x)-xs.begin();
}`)}<p>[100,7,100,1000000000] 映射为 [1,0,1,2]。用于类别或并查集编号时，下标代表一个点；用于长度和面积时，下标 j 常代表原坐标带 [xs[j],xs[j+1])，其真实宽度是 xs[j+1]−xs[j]，不一定为 1。</p>${tip('端点是否加一取决于模型','连续区间 [a,b) 用 a、b 切分，长度 b−a；整数闭区间 [l,r] 用事件表示时结束点是 r+1；前缀关系收集 l−1、r。不能机械地给所有端点加一。')}
<h2 id="s1">02 / 区间并与矩形面积并</h2><p>P1496 给出左闭右开的起火区间，可排序后合并相交区间，累加真实长度；也可离散化端点、做差分，对正覆盖坐标带累加宽度。排序合并 O(n log n)，无需按整个坐标范围开数组。</p><p>P1884 求矩形面积并。入门做法是分别离散化 x、y 端点，在压缩网格做二维差分，还原后对覆盖次数大于 0 的格子累加 Δx·Δy。每个方向最多 2N 个坐标，O(N²+N log N) 时间、O(N²) 空间。N≤1000 时约 400 万个网格位置，可用 int 存覆盖次数、long long 存面积。</p><p>内存受限时，按 x 排序矩形左右边界事件，维护离散化 y 小段的覆盖次数。先累加“上一步覆盖长度×横向距离”，再批量处理当前 x 的事件。朴素维护 O(N²) 时间、O(N) 空间；进阶使用线段树可达 O(N log N)。</p>${tip('几何坐标与行号不同','P1884 的 y 轴向上，输入左上角和右下角，通常 y₁>y₂，构造区间先取 min/max。坐标差、面积乘法使用 long long。重叠区域只贡献一次，不乘覆盖次数。')}
<h2 id="s2">03 / 类别覆盖与天际线</h2><p>P3029 先按位置排序，把品种编号离散化。双指针维护窗口中每个品种的频次及已覆盖种数，右端加入、全部覆盖后缩小左端。候选代价是原坐标 x[right]−x[left]，不是牛的数量。每头牛最多加入和删除各一次，排序后扫描 O(N)。</p><p>P1904 是高度的最大值包络。原题坐标小于 10⁴，可对每个整数横坐标段保存最高建筑，最后只在高度改变时输出 (x,height)，O(NX) 时间。也可离散化端点后维护坐标段最大高度。普通加法差分不能撤销最大值，不能把高度直接累加。</p><p>没有建筑总数，读到 EOF；最后一个建筑结束处还要输出高度 0。若使用扫描线与 multiset，先处理同一 x 的全部加入、删除事件，再检查最高高度变化，避免重复折点。</p>
<h2 id="s3">04 / 稳定排名与跨界计数</h2><p>P4375 每轮先向右再向左冒泡，与普通单向冒泡不同。先按 (数值,原下标) 排序，得到稳定目标排名 rank[i]。相等元素不会交换，不能随意打乱它们的相对顺序。位置和排名均从 1 开始。</p><p>对每条切分线 k，统计左侧却应去右侧的元素数 c[k]，即 i≤k 且 rank[i]>k。把目标排名≤k 的元素视为 0、其余视为 1：每轮向右扫描把一个多余的 1 移出左侧，再向左扫描把右侧的 0 尽量送回，净消去一个跨界错误。所有切分线都无错时数组有序。</p>${formula('若 rank[i]>i，对切分线 [i,rank[i]−1] 加 1<br>轮数=max(1，差分还原后的最大跨界计数)')}<p>例如 [4,3,2,1] 的跨界计数是 [1,2,1]，需要 2 轮。程序即使初始有序也执行一轮，所以答案至少 1；每轮结束已显式检查是否有序，不要额外再加一轮。总时间 O(N log N)、空间 O(N)。</p>`,quiz:{q:'坐标 [10,100,1000] 压缩为 [0,1,2] 后，[10,1000) 的长度是？',options:['2','3','990'],answer:2,explain:'压缩只保留顺序，长度使用原坐标 1000−10=990。'}},
{id:'range-binary',title:'前缀、差分与二分答案',short:'把重复的判定压缩为线性扫描',icon:'≤',color:'#9790b3',tint:'#f2f0f8',time:40,level:'进阶',tags:['二分答案','单调性','贪心判定'],problems:['P1314','P1083','P3017'],sections:['先证明判定单调','质监员：双前缀与阈值','借教室：订单前缀','切蛋糕：非负权值与贪心'],intro:'二分减少检查的候选数，前缀和与差分加速一次检查。先证明单调性，再明确寻找最小可行、最大可行，还是跨越目标值的两侧。',body:()=>`
<h2 id="s0">01 / 先证明判定单调</h2><p>二分答案不是看见最大、最小就能使用。必须找到一个布尔判定，候选递增时只发生一次真假切换。P1083 能满足前 k 个订单，必然能满足更少的订单；P3017 能让每块至少有 T 个巧克力，必然能达到更小的下限。</p>${tip('每次检查相互独立','二分以非顺序方式访问候选值。前缀、差分和计数器必须重新构建或清空，不能混入前次结果。中点用 lo+(hi−lo)/2，并保证每次循环收缩。')}
<h2 id="s1">02 / 质监员：双前缀与阈值</h2><p>P1314 对固定 W 只保留 w[i]≥W 的矿石，构建数量前缀 C、价值前缀 V。区间贡献为 (C[r]−C[l−1])·(V[r]−V[l−1])。价值非负，W 增大时保留元素减少，总检验值 Y(W) 单调不增。</p><p>在 [min(w),max(w)+1] 找第一个 Y(W)≤S 的整数阈值，比较它和前一合法阈值的绝对误差。Y 是阶梯函数，可能直接越过 S，跨越点两侧都要检查。max(w)+1 表示没有合格矿石，保证 Y=0 的情况参与比较。</p>${formula('一次 Y 计算 O(n+m)<br>总时间 O((n+m) log(max(w)+1))')}<p>数量、价值前缀可用 long long，但单区间贡献最多约 4×10¹⁶，所有区间总和保守上界约 8×10²¹，超过 64 位。乘积累加与误差比较用 __int128。最终最小误差不超过 S（选空集合即可），输出前可安全转回 long long。</p>
<h2 id="s2">03 / 借教室：订单前缀</h2><p>P1083 的 check(k) 将前 k 个订单全部记录到需求差分：d[s]+=need、d[t+1]−=need。逐日累计，有任何一天需求超容量就不可行。需求非负，不可行前缀继续添加订单后仍不可行。</p>${codeBlock(`struct RoomOrder { long long need; int l, r; };
bool roomFeasible(const vector<long long>& capacity,
                  const vector<RoomOrder>& orders, int k) {
    int n=capacity.size()-1;
    vector<long long> d(n+2, 0);
    for (int i=0; i<k; ++i) {
        d[orders[i].l]+=orders[i].need;
        d[orders[i].r+1]-=orders[i].need;
    }
    long long used=0;
    for (int i=1; i<=n; ++i) {
        used+=d[i];
        if (used>capacity[i]) return false;
    }
    return true;
}`)}<p>先检查全部订单，若可行输出 0；否则在 [1,m] 二分第一个不可行订单编号，输出 −1 和编号。一次判定 O(n+k)，总计 O((n+m) log m)，空间 O(n+m)。总需求可达约 10¹⁵，使用 64 位。</p>
<h2 id="s3">04 / 切蛋糕：非负权值与贪心</h2><p>P3017 先横切 A 条，再对每条独立竖切 B 块；不同横条的竖切位置不必对齐。二分每块巧克力数下限 T。自上而下累计当前横条列和，再从左到右扫描列，每次累计到至少 T 就尽早切出一块。</p><p>当当前横条能形成至少 B 块，立即确定横切并清空列和。若共形成至少 A 条则可行。非负性使尽早切分不会减少后续资源；多余列和剩余行并入最后一块或最后一条，不会让已有和变小。</p><p>每行更新列和并扫描均为 O(C)，一次判定 O(RC)。二分上界取总和/(AB)，总时间 O(RC log(总和/(AB)+1))。T=0 时仍须每次读入至少一列才切块，不能产生空块。</p>${tip('贪心依赖非负性','P3017 的格子值为 0～4000，向下延伸一条带不会让已有竖切方案失效，合并余下部分也不会变差。含负数的 P1719 不能照搬此结论。')}`,quiz:{q:'P1083 前 k 份订单已不可满足，再添加非负需求订单后？',options:['可能恢复可行','仍然不可行','只检查最后订单'],answer:1,explain:'添加订单只增加或保持每日需求，这就是二分订单编号的单调性。'}},
{id:'range-relations',title:'离散化与前缀关系',short:'把稀疏约束变成等价类与异或关系',icon:'⊕',color:'#78919c',tint:'#eef3f5',time:40,level:'挑战',tags:['并查集','前缀奇偶','异或势能'],problems:['P1955','P5937'],sections:['离散变量与等价类','先合并相等，再检查不等','区间奇偶化为前缀关系','带异或权并查集'],intro:'离散化将十亿级编号压缩到实际出现的节点，并查集维护节点关系。先理解普通等价类，再用前缀异或将区间奇偶化为端点关系。',body:()=>`
<h2 id="s0">01 / 离散变量与等价类</h2><p>P1955 的变量编号可达 10⁹，但每条约束仅涉及两个变量，总节点数不超过 2n。收集编号、排序去重、映射到 0…K−1。并查集用 parent 表示集合代表，路径压缩和按大小合并使查询均摊开销近似常数。</p><p>普通并查集表示“必须相等”的等价类。相等关系的自反、对称和传递性由集合统一表达：合并 x₁=x₂、x₂=x₃ 后，x₁ 与 x₃ 必须同根。</p>
<h2 id="s1">02 / 先合并相等，再检查不等</h2><p>先保存全部约束，合并所有 e=1 的节点对，再检查所有 e=0 的节点对。若不等式两端同根则矛盾；否则可给不同等价类分配不同值，从而满足所有约束。</p>${tip('不等关系不能传递','x≠y、y≠z 并不推出 x=z 或 x≠z。本题值域不限于二元，不应改为二分图染色。也不能读到一个不等式就认为它以后永远无冲突，后续等式可能把两端合并。')}<p>离散化 O(n log n)，并查集 O(n α(n))，空间 O(n)。每组数据重建映射和集合，按要求输出 YES 或 NO。</p>
<h2 id="s2">03 / 区间奇偶化为前缀关系</h2><p>P5937 定义 S[i]=a[1]⊕…⊕a[i]，代表前 i 项的奇偶。区间 [l,r] 奇偶为 S[r]⊕S[l−1]，每个回答转为两个节点的异或约束，even=0、odd=1。</p>${formula('S[l−1]⊕S[r]=parity','收集 l−1 和 r；下标 0 是合法空前缀节点。')}<p>按回答顺序逐条加入，第一次冲突在第 k 条时输出 k−1，全都一致输出 m。只维护问到的前缀节点，未出现的中间位置不必建立；任意一致的前缀奇偶赋值都可经相邻异或还原一个 01 序列。</p>
<h2 id="s3">04 / 带异或权并查集</h2><p>令 xr[x]=S[x]⊕S[parent[x]]。路径压缩时，将到旧父亲的关系与旧父亲到根的关系异或。若两节点已同根，检查它们到根的异或是否满足要求；否则连接两根并设置新边关系。</p>${codeBlock(`struct ParityDSU {
    vector<int> parent, sz, xr;
    ParityDSU(int n): parent(n), sz(n,1), xr(n,0) {
        iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        if (parent[x]==x) return x;
        int old=parent[x];
        parent[x]=find(old);
        xr[x]^=xr[old];
        return parent[x];
    }
    bool join(int a, int b, int parity) {
        int ra=find(a), rb=find(b);
        int relation=xr[a]^xr[b]^parity;
        if (ra==rb) return relation==0;
        if (sz[ra]>sz[rb]) swap(ra,rb);
        parent[ra]=rb;
        xr[ra]=relation; // XOR 对称，交换两根仍是同一关系
        sz[rb]+=sz[ra];
        return true;
    }
};`)}<p>S[0]⊕S[2]=0、S[2]⊕S[4]=1 推出 S[0]⊕S[4]=1；若下一条要求为 0，就立即冲突。排序压缩 O(m log m)，关系维护 O(m α(m))，空间 O(m)。</p>`,quiz:{q:'区间 [3,5] 有奇数个 1，对应哪条关系？',options:['S[3]⊕S[5]=1','S[2]⊕S[5]=1','S[2]⊕S[4]=0'],answer:1,explain:'消去第 3 项之前的 S[2]，奇数对应异或值 1。'}}
);

const rangeProblems = [
{id:'P8218',name:'【深进1.例1】求区间和',chapter:'range-prefix',difficulty:2,tags:['前缀和','静态查询'],summary:'多次查询正整数序列的闭区间 [l,r] 元素和。',steps:['设 S[0]=0，逐项计算 S[i]=S[i−1]+a[i]。','每次输出 S[r]−S[l−1]。','查询可以读入一条回答一条，无需全部存储。'],example:'[4,3,2,1] 查询 [2,3]：9−4=5。',complexity:'O(n+m) 时间，O(n) 空间；n,m≤10⁵。',pitfall:'输入先 n 和数组，再 m 和查询；减去 l−1 而不是 l。'},
{id:'P1719',name:'最大加权矩形',chapter:'range-grid',difficulty:3,tags:['降维','最大子段和'],summary:'在可含负数的 n×n 矩阵中，求非空子矩形的最大元素和。',steps:['枚举上边界并清空列和。','扩展下边界，把新行加入列和。','对列和运行非空最大子段和，更新答案。'],example:'[[−2,3],[−1,4]] 选择第二列，和为 7。',complexity:'O(n³) 时间，矩阵 O(n²)、额外列和 O(n)；n≤120。',pitfall:'答案不能初始化为 0；二维前缀求和不等于减少四条边的枚举数量。'},
{id:'P1314',name:'[NOIP 2011 提高组] 聪明的质监员',chapter:'range-binary',difficulty:3,tags:['二分阈值','双前缀'],summary:'选阈值 W，使各区间“合格矿石数×合格矿石价值和”的总和最接近 S。',steps:['建立 w≥W 的数量和价值两份前缀。','O(m) 计算 Y(W)，乘积累加用 __int128。','二分第一个 Y≤S 的阈值，比较跨越点和前一合法阈值的误差。','搜索包含 max(w)+1，覆盖空集合情形。'],example:'原题 W=4 时区间贡献 20、5、0，Y=25，距 S=15 相差 10。',complexity:'O((n+m) log(max w+1)) 时间，O(n+m) 空间。',pitfall:'Y 是阶梯函数，不保证等于 S；总检验值可能超过 64 位。'},
{id:'P2367',name:'语文成绩',chapter:'range-diff',difficulty:2,tags:['一维差分','区间加'],summary:'对初始成绩执行若干区间加，求最终最低分。',steps:['读入初始成绩，构建差分。','[x,y] 加 z：d[x]+=z、d[y+1]−=z。','前缀还原最终成绩，取最小值。'],example:'[1,1,1] 给 [1,2]、[2,3] 各加 1，得到 [2,3,2]，最低 2。',complexity:'O(n+p) 时间，O(n) 空间；n≤5×10⁶。',pitfall:'只问最终最低分，不需要每次操作维护最小值。注意结束标记和内存占用。'},
{id:'P3397',name:'地毯',chapter:'range-diff',difficulty:2,tags:['二维差分','矩形覆盖'],summary:'n×n 网格上覆盖 m 个闭矩形，输出每格覆盖次数。',steps:['对矩形四角做 +1、−1、−1、+1 标记。','按行列递增顺序还原二维前缀。','输出每格次数，未覆盖位置为 0。'],example:'2×2 全覆盖一次，再覆盖 (2,2)，得到 [[1,1],[1,2]]。',complexity:'O(m+n²) 时间，O(n²) 空间；n,m≤1000。',pitfall:'负标记在 x₂+1 或 y₂+1；统计次数，而非是否被覆盖。'},
{id:'P1496',name:'火烧赤壁',chapter:'range-compress',difficulty:2,tags:['区间并','排序合并'],summary:'求左闭右开起火区间的并集长度，重复覆盖只计一次。',steps:['按左端点排序，维护当前合并段 [L,R)。','下一段起点≤R 就延伸，否则结算 R−L 并新开一段。','最后结算剩余段；也可离散化差分统计正覆盖坐标带。'],example:'[−1,1)、[5,11)、[2,9) 的并集长度为 2+9=11。',complexity:'O(n log n) 时间，O(n) 存储；n≤2×10⁴。',pitfall:'长度 b−a，不加 1；坐标可为负，坐标差使用 64 位。'},
{id:'P1955',name:'[NOI2015] 程序自动分析',chapter:'range-relations',difficulty:4,tags:['离散化','并查集'],summary:'判定变量的相等、不等约束能否同时满足。',steps:['收集变量编号并离散化。','先合并所有等式。','检查不等式，两端同根则 NO，否则 YES。','每组数据重新初始化。'],example:'x₁=x₂、x₂=x₃、x₁≠x₃ 矛盾，输出 NO。',complexity:'每组 O(n log n+n α(n)) 时间，O(n) 空间；编号≤10⁹。',pitfall:'不等关系不能传递；先处理全部等式，再判断不等式。'},
{id:'P1884',name:'[USACO12FEB] Overplanting S',chapter:'range-compress',difficulty:4,tags:['离散化','面积并'],summary:'求最多 1000 个轴对齐矩形的面积并。',steps:['收集并压缩 x、y 端点。','压缩网格做二维差分、还原覆盖次数。','对正覆盖坐标带累加原宽度×原高度。','内存受限时可按 x 扫描、维护 y 段覆盖。'],example:'原题两个矩形面积 16、8，重叠 4，面积并为 20。',complexity:'压缩网格 O(N²+N log N) 时间、O(N²) 空间；朴素扫描可用 O(N) 空间。',pitfall:'左上与右下角使 y₁通常大于 y₂；格子面积不等于 1，使用 long long 乘法。'},
{id:'P2004',name:'领地选择',chapter:'range-grid',difficulty:2,tags:['二维前缀','固定矩形'],summary:'找可含负权地图中价值最高的 C×C 正方形左上角。',steps:['构建 long long 二维前缀。','枚举合法左上角，O(1) 查询候选和。','记录最优坐标并输出，原题保证唯一最优。'],example:'原题 3×4 地图，边长 2，左上角 (1,2) 的和为 14。',complexity:'O(NM) 时间和空间；N,M≤1000。',pitfall:'最大值不能初始为 0；输出行列坐标而非价值，前缀用 64 位。'},
{id:'P3017',name:'[USACO11MAR] Brownie Slicing G',chapter:'range-binary',difficulty:5,tags:['二分答案','非负贪心'],summary:'非负矩阵先横切 A 条，各自竖切 B 块，最大化所有块的最小和。',steps:['二分下限 T，范围 0…总和/(AB)。','逐行累计当前横条列和。','从左向右尽早切出和≥T 的块，能切 B 块即确定横条。','形成至少 A 条则可行，多余部分并入最后一块或条。'],example:'原题 5×4 蛋糕切 4 条、每条 2 块，可保证每块至少 3 个巧克力。',complexity:'O(RC log(总和/(AB)+1)) 时间，矩阵 O(RC)、检查额外 O(C)。',pitfall:'不同横条竖切位置可不同；依赖权值非负，T=0 也不能切空块。'},
{id:'P3406',name:'海底高铁',chapter:'range-diff',difficulty:3,tags:['边差分','独立决策'],summary:'按城市序列出行，各铁路段可买票或办卡，求最少总费用。',steps:['每次 u→v 对边区间 [min(u,v),max(u,v)−1] 加 1。','用差分统计各边使用次数 c。','累加各边 min(cA,cB+C)。'],example:'使用 3 次，A=10、B=4、C=8：买票 30，办卡 20，选 20。',complexity:'O(N+M) 时间，O(N) 差分空间。',pitfall:'结束标记在 max(u,v)，不是再加 1；次数乘费用和总和用 64 位。'},
{id:'P1083',name:'[NOIP 2012 提高组] 借教室',chapter:'range-binary',difficulty:3,tags:['二分订单','差分判定'],summary:'按顺序处理区间租借，求第一份无法满足的订单。',steps:['check(k) 用差分汇总前 k 个订单的每日需求。','任意一天需求超容量即失败。','先查全部订单，若失败则二分第一个不可行前缀。','全可行输出 0，否则输出 −1 和订单编号。'],example:'原题第 2 单使第 3 天容量不足，输出 −1 和 2。',complexity:'O((n+m) log m) 时间，O(n+m) 空间；n,m≤10⁶。',pitfall:'每次 check 清空差分；累积需求可达约 10¹⁵，使用 long long。'},
{id:'P2882',name:'[USACO07MAR] Face The Right Way G',chapter:'range-diff',difficulty:4,tags:['枚举长度','翻转差分'],summary:'每次翻转连续 K 头牛，求最少操作次数及达到它的最小 K。',steps:['递增枚举 K。','从左到右维护有效翻转奇偶，当前朝后则必须从这里翻。','在 i+K 撤销影响；末尾不足 K 头则无解。','仅在次数严格更少时更新最优 K。'],example:'B B F B F B B 取 K=3，翻 [1,3]、[3,5]、[5,7]，共 3 次。',complexity:'O(N²) 时间，O(N) 空间；N≤5000。',pitfall:'每个 K 重置状态；末尾不能截短翻转区间。'},
{id:'P4552',name:'[Poetize6] IncDec Sequence',chapter:'range-diff',difficulty:4,tags:['差分','正负配对'],summary:'区间加减 1 使全序列相等，求最少次数和最优结果种数。',steps:['仅统计 d[2…n] 的正和 P 与负值绝对值和 Q。','正负单位优先配对消去，剩余通过两端吸收。','最少 max(P,Q) 次，最终公共值共 |P−Q|+1 种。'],example:'[1,1,2,2]：P=1、Q=0，1 次，可变全 1 或全 2。',complexity:'O(n) 时间，流式 O(1) 额外空间。',pitfall:'排除首项差分和末尾哨兵；n=1 时 0 次、1 种。'},
{id:'P3029',name:'[USACO11NOV] Cow Lineup S',chapter:'range-compress',difficulty:3,tags:['离散化','双指针'],summary:'找包含所有品种的最短位置区间，代价是两端坐标差。',steps:['按位置排序，压缩品种编号。','双指针和频次维护已覆盖品种数。','覆盖齐全时更新原坐标跨度，再尝试缩小左端。'],example:'原题 [22,26] 包含品种 1、3、7，跨度为 4。',complexity:'O(N log N) 时间，O(N) 空间；N≤50000。',pitfall:'最小化坐标差，不是牛的数量；只有一种品种时答案 0。'},
{id:'P1904',name:'天际线',chapter:'range-compress',difficulty:2,tags:['高度包络','坐标段'],summary:'由建筑 (L,H,R) 输出城市轮廓的全部高度变化点。',steps:['读到 EOF，对 L≤x<R 的每个小段取最大高度。','按横坐标扫描，仅在高度改变时输出坐标和新高度。','输出最右端降为 0 的点；可用压缩坐标或扫描线拓展。'],example:'(1,3,4)、(2,5,3) 轮廓为 (1,3)、(2,5)、(3,3)、(4,0)。',complexity:'原题直接 O(NX) 时间、O(X) 空间，X<10⁴；扫描线可 O(N log N)。',pitfall:'输入没有 N；高度取最大值，不能累加；同一横坐标只输出最终变化。'},
{id:'P4375',name:'[USACO18OPEN] Out of Sorts G',chapter:'range-compress',difficulty:5,tags:['稳定排名','跨界差分'],summary:'预测每轮向右再向左扫描的双向冒泡排序轮数。',steps:['按 (数值,原下标) 排序，求稳定排名。','rank[i]>i 时对切分线 [i,rank[i]−1] 加 1。','差分还原跨界计数，答案是其最大值与 1 的较大者。'],example:'[4,3,2,1] 跨界计数 [1,2,1]，需 2 轮；有序数组仍执行 1 轮。',complexity:'O(N log N) 时间、O(N) 空间；N≤10⁵。',pitfall:'重复值要稳定排名；不能套单向冒泡公式，也不额外加结束检查轮数。'},
{id:'P5937',name:'[CEOI 1999] Parity Game',chapter:'range-relations',difficulty:4,tags:['前缀异或','带权并查集'],summary:'依次给出区间奇偶性，求最多多少条开头回答能够同时成立。',steps:['转为 S[l−1]⊕S[r]=p，even=0、odd=1。','离散化全部 l−1、r。','按顺序加入异或带权并查集，首次矛盾在 k 则输出 k−1。','无矛盾输出 m。'],example:'原题前三条推出 [1,6] 为 odd，第四条说 even，输出 3。',complexity:'O(m log m+m α(m)) 时间、O(m) 空间；n≤10⁹、m≤5000。',pitfall:'压缩 l−1、r，保留下标 0；输出已成立条数，不是错误编号。'}
];

const learningModules = [
{id:'math',title:'基础数学',subtitle:'进制、计数与数论',training:117,sourceName:'【数学1】基础数学问题',checkedAt:'2026-09-20',description:'从位权与计数出发，理解整除、素数和模运算，建立基础数学工具箱。',chapterIds:chapters.map(c=>c.id),problemIds:problems.map(p=>p.id),labCount:6},
{id:'range',title:'前缀和、差分与离散化',subtitle:'区间处理与算法进阶',training:200,sourceName:'【算法2-1】前缀和、差分与离散化',checkedAt:'2026-09-21',description:'从一次累积到批量修改，再用坐标压缩连接扫描、二分和并查集。建议先掌握数组、排序与复杂度分析。',chapterIds:rangeChapters.map(c=>c.id),problemIds:rangeProblems.map(p=>p.id),labCount:2}
];
chapters.push(...rangeChapters);
problems.push(...rangeProblems);
