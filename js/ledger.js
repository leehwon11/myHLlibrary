// ══════════════ 나의 서재 — 가계부 ══════════════

let _ledgerYear=new Date().getFullYear();
let _ledgerMonth=new Date().getMonth();

function won(n){return Math.round(n||0).toLocaleString('ko-KR')+'원';}

// 책의 기본 금액(구매일 기준) + 추가 구매 기록을 결제 단위로 펼친다
function getPurchases(){
  const out=[];
  books.forEach(b=>{
    const price=Number(b.price)||0;
    if(price>0) out.push({book:b,date:b.datebuy||'',amount:price,memo:'',extra:false});
    (b.purchases||[]).forEach(p=>{
      const amt=Number(p.amount)||0;
      if(amt>0) out.push({book:b,date:p.date||'',amount:amt,memo:p.memo||'',extra:true});
    });
  });
  return out;
}

function sumBy(list,keyFn){
  const map={};
  list.forEach(p=>{const k=keyFn(p)||'미입력';if(!map[k])map[k]={amount:0,count:0};map[k].amount+=p.amount;map[k].count++;});
  return Object.entries(map).sort((a,b)=>b[1].amount-a[1].amount);
}

function ledgerBars(entries,color){
  if(!entries.length) return '<p class="lg-empty">기록이 없어요.</p>';
  const max=entries[0][1].amount||1;
  return entries.map(([name,v])=>`<div class="lg-bar-row"><span class="lg-bar-label">${escHtml(name)}</span><div class="lg-bar-track"><div class="lg-bar-fill" style="width:${Math.max(2,Math.round(v.amount/max*100))}%;background:${color}"></div></div><span class="lg-bar-val">${won(v.amount)}<small>${v.count}건</small></span></div>`).join('');
}

function renderLedger(){
  const c=document.getElementById('ledgerContent');
  if(!c) return;
  const all=getPurchases();
  const today=new Date();
  const thisYear=today.getFullYear();
  const years=[...new Set([thisYear,...all.filter(p=>p.date).map(p=>Number(p.date.slice(0,4)))])].sort((a,b)=>b-a);
  if(!years.includes(_ledgerYear)) _ledgerYear=thisYear;
  const year=_ledgerYear;

  const dated=all.filter(p=>p.date);
  const undated=all.filter(p=>!p.date);
  const yearList=dated.filter(p=>p.date.startsWith(String(year)));
  const total=yearList.reduce((s,p)=>s+p.amount,0);
  const bookCount=new Set(yearList.map(p=>p.book.id)).size;
  const monthsElapsed=year===thisYear?today.getMonth()+1:12;

  const monthly=Array.from({length:12},()=>({amount:0,count:0}));
  yearList.forEach(p=>{const m=Number(p.date.slice(5,7))-1;if(m>=0&&m<12){monthly[m].amount+=p.amount;monthly[m].count++;}});
  const maxM=Math.max(...monthly.map(m=>m.amount),1);

  const sel=monthly[_ledgerMonth];
  const prev=_ledgerMonth>0?monthly[_ledgerMonth-1].amount:dated.filter(p=>p.date.startsWith(`${year-1}-12`)).reduce((s,p)=>s+p.amount,0);
  const diff=sel.amount-prev;
  const budget=Number(appSettings.monthlyBudget)||0;
  const budgetPct=budget?Math.round(sel.amount/budget*100):0;

  const monthKey=`${year}-${String(_ledgerMonth+1).padStart(2,'0')}`;
  const monthList=dated.filter(p=>p.date.startsWith(monthKey)).sort((a,b)=>b.date.localeCompare(a.date));

  // 상태별(올해 결제 기준), 쌓아둔 책·하차 손실(전체 기간)
  const statusOrder=['완독','읽는중','읽고싶어요','하차'];
  const byStatus=sumBy(yearList,p=>p.book.status).sort((a,b)=>statusOrder.indexOf(a[0])-statusOrder.indexOf(b[0]));
  const spendOf=st=>{const bs=books.filter(b=>b.status===st&&bookSpend(b)>0);return{count:bs.length,amount:bs.reduce((s,b)=>s+bookSpend(b),0),list:bs.sort((a,b)=>bookSpend(b)-bookSpend(a))};};
  const pile=spendOf('읽고싶어요');
  const dnf=spendOf('하차');
  const noPrice=books.filter(b=>!bookSpend(b)).length;
  const undatedSum=undated.reduce((s,p)=>s+p.amount,0);

  const topBooks=Object.values(yearList.reduce((m,p)=>{(m[p.book.id]=m[p.book.id]||{book:p.book,amount:0}).amount+=p.amount;return m;},{})).sort((a,b)=>b.amount-a.amount).slice(0,5);

  let h='';
  h+=`<div class="lg-head"><h2 class="lg-title">${year}년 가계부</h2><select class="sort-select" onchange="_ledgerYear=Number(this.value);renderLedger()">${years.map(y=>`<option value="${y}"${y===year?' selected':''}>${y}년</option>`).join('')}</select></div>`;

  h+=`<div class="lg-kpis">
    <div class="lg-kpi"><div class="lg-kpi-label">올해 총 지출</div><div class="lg-kpi-num">${won(total)}</div><div class="lg-kpi-sub">결제 ${yearList.length}건 · 책 ${bookCount}권</div></div>
    <div class="lg-kpi"><div class="lg-kpi-label">권당 평균</div><div class="lg-kpi-num">${won(bookCount?total/bookCount:0)}</div><div class="lg-kpi-sub">추가 구매 포함</div></div>
    <div class="lg-kpi"><div class="lg-kpi-label">월 평균</div><div class="lg-kpi-num">${won(total/monthsElapsed)}</div><div class="lg-kpi-sub">${monthsElapsed}개월 기준</div></div>
    <div class="lg-kpi"><div class="lg-kpi-label">쌓아둔 책</div><div class="lg-kpi-num">${won(pile.amount)}</div><div class="lg-kpi-sub">읽고 싶어요 ${pile.count}권</div></div>
  </div>`;

  h+=`<div class="lg-card"><div class="lg-card-head"><h3>월별 지출</h3><span class="lg-hint">막대를 누르면 그달 내역이 보여요</span></div>
    <div class="lg-months">${monthly.map((m,i)=>`<button class="lg-month${i===_ledgerMonth?' on':''}" onclick="_ledgerMonth=${i};renderLedger()" aria-label="${i+1}월 ${won(m.amount)}"><span class="lg-month-val">${m.amount?(m.amount>=10000?Math.round(m.amount/1000)/10+'만':m.amount.toLocaleString('ko-KR')):''}</span><span class="lg-month-bar" style="height:${m.amount?Math.max(4,Math.round(m.amount/maxM*140)):2}px"></span><span class="lg-month-label">${i+1}<span class="m-unit">월</span></span></button>`).join('')}</div>
  </div>`;

  h+=`<div class="lg-grid">
    <div class="lg-card">
      <div class="lg-card-head"><h3>${_ledgerMonth+1}월</h3><span class="lg-hint">${monthList.length}건</span></div>
      <div class="lg-month-total">${won(sel.amount)}</div>
      <div class="lg-diff ${diff>0?'up':diff<0?'down':''}">${prev||sel.amount?`지난달보다 ${diff>0?'+':''}${won(diff)}`:'지난달 기록 없음'}</div>
      <div class="lg-budget">
        ${budget?`<div class="lg-budget-row"><span>예산 ${won(budget)}</span><span class="${budgetPct>100?'lg-over':''}">${budgetPct}%${budgetPct>100?' · 초과':''}</span></div><div class="lg-budget-track"><div class="lg-budget-fill${budgetPct>100?' over':''}" style="width:${Math.min(100,budgetPct)}%"></div></div>`:''}
        <div class="lg-budget-edit"><input type="number" id="ledgerBudgetInput" min="0" step="1000" placeholder="월 예산 (원)" value="${budget||''}"><button class="btn sm" onclick="saveLedgerBudget()">${budget?'예산 변경':'예산 설정'}</button></div>
      </div>
    </div>
    <div class="lg-card lg-card-wide">
      <div class="lg-card-head"><h3>${_ledgerMonth+1}월 내역</h3></div>
      ${monthList.length?`<div class="lg-table-wrap"><table class="lg-table"><thead><tr><th>날짜</th><th>책</th><th>플랫폼</th><th>상태</th><th class="num">금액</th></tr></thead><tbody>${monthList.map(p=>`<tr onclick="openDetail('${p.book.id}')"><td>${p.date.slice(5).replace('-','.')}</td><td><span class="lg-book">${escHtml(p.book.title)}</span>${p.extra?`<span class="lg-extra">${escHtml(p.memo||'추가 구매')}</span>`:''}</td><td>${escHtml(p.book.platform||'-')}</td><td>${escHtml(p.book.status||'-')}</td><td class="num">${won(p.amount)}</td></tr>`).join('')}</tbody></table></div>`:'<p class="lg-empty">이 달에 산 책이 없어요.</p>'}
    </div>
  </div>`;

  h+=`<div class="lg-grid">
    <div class="lg-card"><div class="lg-card-head"><h3>플랫폼별</h3><span class="lg-hint">${year}년</span></div>${ledgerBars(sumBy(yearList,p=>p.book.platform),'var(--acc)')}</div>
    <div class="lg-card"><div class="lg-card-head"><h3>책 종류별</h3><span class="lg-hint">${year}년</span></div>${ledgerBars(sumBy(yearList,p=>p.book.booktype),'var(--acc2)')}</div>
    <div class="lg-card"><div class="lg-card-head"><h3>지금 상태별</h3><span class="lg-hint">${year}년에 산 책</span></div>${ledgerBars(byStatus,'var(--rose)')}</div>
  </div>`;

  h+=`<div class="lg-grid">
    <div class="lg-card"><div class="lg-card-head"><h3>올해 가장 많이 쓴 책</h3></div>${topBooks.length?`<ol class="lg-rank">${topBooks.map(t=>`<li onclick="openDetail('${t.book.id}')"><span class="lg-book">${escHtml(t.book.title)}</span><span>${won(t.amount)}</span></li>`).join('')}</ol>`:'<p class="lg-empty">기록이 없어요.</p>'}</div>
    <div class="lg-card"><div class="lg-card-head"><h3>쌓아둔 책</h3><span class="lg-hint">사놓고 아직 안 읽은 책</span></div>${pile.list.length?`<ol class="lg-rank">${pile.list.slice(0,5).map(b=>`<li onclick="openDetail('${b.id}')"><span class="lg-book">${escHtml(b.title)}</span><span>${won(bookSpend(b))}</span></li>`).join('')}</ol>${pile.list.length>5?`<p class="lg-hint">외 ${pile.list.length-5}권</p>`:''}`:'<p class="lg-empty">쌓아둔 책이 없어요.</p>'}</div>
    <div class="lg-card"><div class="lg-card-head"><h3>하차한 책에 쓴 돈</h3><span class="lg-hint">전체 기간</span></div><div class="lg-month-total">${won(dnf.amount)}</div><div class="lg-hint">하차 ${dnf.count}권${dnf.count?` · 권당 ${won(dnf.amount/dnf.count)}`:''}</div></div>
  </div>`;

  const notes=[];
  if(undated.length) notes.push(`구매일이 없는 결제 ${undated.length}건(${won(undatedSum)})은 월별 집계에서 빠져 있어요.`);
  if(noPrice) notes.push(`금액을 입력하지 않은 책이 ${noPrice}권 있어요.`);
  if(notes.length) h+=`<div class="lg-note">${notes.map(n=>`<p>${n}</p>`).join('')}<p>책 수정 화면의 금액, 구매일, 추가 구매 기록에서 채울 수 있어요.</p></div>`;

  c.innerHTML=h;
}

function saveLedgerBudget(){
  const v=Math.max(0,parseInt(document.getElementById('ledgerBudgetInput')?.value)||0);
  appSettings.monthlyBudget=v;
  saveData();
  renderLedger();
  showToast(v?'월 예산을 '+won(v)+'으로 저장했어요.':'월 예산을 지웠어요.');
}
