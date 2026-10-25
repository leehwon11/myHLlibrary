// ══════════════ 나의 서재 — Stats ══════════════

let _statsYear=new Date().getFullYear();

function countMap(list,fn){const m={};list.forEach(b=>fn(b).forEach(k=>{if(k)m[k]=(m[k]||0)+1;}));return Object.entries(m).sort((a,b)=>b[1]-a[1]);}

function hbarsHtml(entries,cls,limit=8){
  if(!entries.length) return '<p class="hint">아직 기록이 없어요.</p>';
  const top=entries.slice(0,limit);const max=top[0][1]||1;
  return`<div class="hbars">${top.map(([k,n])=>`<div class="hbar"><span class="hbar-label">${escHtml(k)}</span><div class="hbar-track"><div class="hbar-fill ${cls||''}" style="width:${Math.max(3,Math.round(n/max*100))}%"></div></div><span class="hbar-val">${n}</span></div>`).join('')}</div>`;
}

function cloudHtml(entries,cls){
  if(!entries.length) return '<p class="hint">아직 기록이 없어요.</p>';
  const top=entries.slice(0,20);const max=top[0][1];
  return`<div class="tag-cloud ${cls||''}">${top.map(([t,n])=>`<button type="button" class="cloud-tag" style="font-size:${Math.round(12+(n/max)*6)}px;border:0" data-tag="${encodeURIComponent(t)}" onclick="searchByTag(decodeURIComponent(this.dataset.tag))">${escHtml(t)}<small>${n}</small></button>`).join('')}</div>`;
}

function renderStats(){
  const c=document.getElementById('statsContent');
  if(!c) return;
  if(!books.length){c.innerHTML='<div class="page-head"><h1 class="page-title">통계</h1></div><div class="empty"><div class="empty-ico">📊</div><p>책을 추가하면 통계가 보여요!</p></div>';return;}
  const thisYear=new Date().getFullYear();
  const allDone=books.filter(b=>b.status==='완독');
  const years=[...new Set([thisYear,...allDone.filter(b=>b.dateend).map(b=>Number(b.dateend.slice(0,4)))])].sort((a,b)=>b-a);
  const isAll=_statsYear==='all';
  if(!isAll&&!years.includes(_statsYear))_statsYear=thisYear;
  const year=_statsYear;
  const done=isAll?allDone:allDone.filter(b=>b.dateend&&b.dateend.startsWith(String(year)));
  const scope=isAll?'전체 기간':`${year}년 완독 기준`;
  const rated=done.filter(b=>b.rating);
  const avgR=rated.length?(rated.reduce((s,b)=>s+b.rating,0)/rated.length).toFixed(1):'-';
  const five=done.filter(b=>b.rating===5).length;
  const st=calcStreaks();
  const prevYearCnt=isAll?0:allDone.filter(b=>b.dateend&&b.dateend.startsWith(String(year-1))).length;
  const cntOf=s=>books.filter(b=>b.status===s).length;

  let h=`<div class="page-head"><h1 class="page-title">${isAll?'전체 기간의 독서':year+'년의 독서'}</h1>
    <select class="sort-select" aria-label="기간" onchange="_statsYear=this.value==='all'?'all':Number(this.value);renderStats()">${years.map(y=>`<option value="${y}"${y===year?' selected':''}>${y}년</option>`).join('')}<option value="all"${isAll?' selected':''}>전체 기간</option></select></div>`;

  h+=`<div class="kpis">
    <div class="kpi"><span class="kpi-label">${isAll?'완독':'올해 완독'}</span><span class="kpi-num">${done.length}</span><span class="kpi-sub">${!isAll&&prevYearCnt?`작년보다 ${done.length-prevYearCnt>=0?'+':''}${done.length-prevYearCnt}권`:'&nbsp;'}</span></div>
    <div class="kpi"><span class="kpi-label">읽는 중</span><span class="kpi-num">${cntOf('읽는중')}</span><span class="kpi-sub">&nbsp;</span></div>
    <div class="kpi"><span class="kpi-label">읽고 싶어요</span><span class="kpi-num">${cntOf('읽고싶어요')}</span><span class="kpi-sub">&nbsp;</span></div>
    <div class="kpi"><span class="kpi-label">하차</span><span class="kpi-num">${cntOf('하차')}</span><span class="kpi-sub">&nbsp;</span></div>
    <div class="kpi"><span class="kpi-label">평균 별점</span><span class="kpi-num">${avgR}</span><span class="kpi-sub">${five?`★5개 ${five}권`:'&nbsp;'}</span></div>
    <div class="kpi"><span class="kpi-label">최장 연속 독서</span><span class="kpi-num">${st.longestStreak}일</span><span class="kpi-sub">지금 ${st.currentStreak}일째</span></div>
  </div>`;

  if(!isAll&&year===thisYear){
    const goal=appSettings.yearlyGoal||0;
    const pct=goal?Math.min(100,Math.round(done.length/goal*100)):0;
    const left=Math.max(0,goal-done.length);const monthsLeft=12-new Date().getMonth();
    const pace=goal?(left?`남은 ${monthsLeft}개월 동안 한 달에 ${Math.ceil(left/monthsLeft)}권씩 읽으면 달성해요`:'🎉 올해 목표를 달성했어요!'):'목표 권수를 정하면 진행률을 보여드려요';
    h+=`<section class="card"><div class="card-head"><span class="card-h">${goal?`올해 목표 ${goal}권`:'올해 목표'}</span><span class="profile-sub">${goal?`<b style="color:var(--txt)">${done.length}권</b> · ${pct}%`:''}</span></div>
      ${goal?`<div class="progress${pct>=100?' done':''}"><div style="width:${pct}%"></div></div>`:''}
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><span class="hint">${pace}</span>
      <span class="inline-edit owner-only"><input type="number" id="statsGoalInput" min="0" max="999" placeholder="목표 권수" value="${goal||''}" aria-label="목표 권수"><button class="btn sm" onclick="saveGoalValue(document.getElementById('statsGoalInput').value)">저장</button></span></div></section>`;
  }

  const genres=countMap(done,b=>b.genre||[]);
  if(!isAll){
    const months=Array(12).fill(0);done.forEach(b=>{const m=Number(b.dateend.slice(5,7))-1;if(m>=0&&m<12)months[m]++;});
    const maxM=Math.max(...months,1);const curM=year===thisYear?new Date().getMonth():-1;
    h+=`<div class="cards-row"><section class="card wide"><span class="card-h">월별 완독</span>
      <div class="vbars">${months.map((n,i)=>`<div class="vbar${i===curM?' on':''}"><span class="vbar-val">${n||''}</span><div class="vbar-bar" style="height:${n?Math.max(4,Math.round(n/maxM*140)):2}px"></div></div>`).join('')}</div>
      <div class="vbar-labels">${months.map((_,i)=>`<span>${i+1}<span class="m-unit">월</span></span>`).join('')}</div></section>
      <section class="card"><div class="card-head"><span class="card-h">장르</span><span class="hint">${scope}</span></div>${hbarsHtml(genres)}</section></div>`;
  }else{
    h+=`<div class="cards-row"><section class="card"><div class="card-head"><span class="card-h">장르</span><span class="hint">${scope}</span></div>${hbarsHtml(genres)}</section></div>`;
  }

  const stars=[5,4,3,2,1].map(s=>['★'.repeat(s),done.filter(b=>b.rating===s).length]);
  const mlTypes=countMap(done,b=>(Array.isArray(b.ml)?b.ml:(b.ml&&b.ml.name?[b.ml]:[])).filter(m=>!m.sub).flatMap(m=>m.typeTags||[]));
  const flTypes=countMap(done,b=>[...new Set([...(b.flTypeTags||[]),...((b.fl&&b.fl.typeTags)||[])])]);
  h+=`<div class="cards-row">
    <section class="card"><div class="card-head"><span class="card-h">최애 남주 유형</span><span class="hint">${scope}</span></div>${hbarsHtml(mlTypes,'ml')}</section>
    <section class="card"><div class="card-head"><span class="card-h">여주 유형</span><span class="hint">${scope}</span></div>${hbarsHtml(flTypes,'fl')}</section>
    <section class="card"><div class="card-head"><span class="card-h">별점 분포</span><span class="hint">${scope}</span></div>${done.length?`<div class="hbars">${stars.map(([k,n])=>{const max=Math.max(...stars.map(s=>s[1]),1);return`<div class="hbar"><span class="hbar-label" style="color:var(--star)">${k}</span><div class="hbar-track"><div class="hbar-fill star" style="width:${n?Math.max(3,Math.round(n/max*100)):0}%"></div></div><span class="hbar-val">${n}</span></div>`;}).join('')}</div>`:'<p class="hint">아직 기록이 없어요.</p>'}</section>
  </div>`;

  h+=`<div class="cards-row">
    <section class="card"><div class="card-head"><span class="card-h">소재 태그</span><span class="hint">${scope}</span></div>${cloudHtml(countMap(done,b=>b.sojaiTags||b.tags||[]))}</section>
    <section class="card"><div class="card-head"><span class="card-h">관계 태그</span><span class="hint">${scope}</span></div>${cloudHtml(countMap(done,b=>b.relTags||b.themes||[]),'rel')}</section>
  </div>`;

  const moodCnt={};done.forEach(b=>(b.moods||[]).forEach(m=>{moodCnt[m]=(moodCnt[m]||0)+1;}));
  const moods=MOOD_OPTIONS.map(m=>({...m,n:moodCnt[m.label]||0})).sort((a,b)=>b.n-a.n);
  h+=`<section class="card"><div class="card-head"><span class="card-h">읽고 난 감정</span><span class="hint">${scope}</span></div>
    <div class="mood-grid">${moods.map(m=>`<div class="mood-cell" style="background:${m.bg};color:${m.color}"><span>${m.emoji} ${escHtml(m.label)}</span><b>${m.n}</b></div>`).join('')}</div></section>`;

  const dnf=books.filter(b=>b.status==='하차').sort((a,b)=>(b.dnfDate||'').localeCompare(a.dnfDate||''));
  if(dnf.length){
    h+=`<section class="card"><div class="card-head"><span class="card-h">하차한 책 ${dnf.length}권</span><span class="hint">전체 기간</span></div><ul class="dnf-list">${dnf.slice(0,6).map(b=>`<li onclick="openDetail('${b.id}')"><b style="color:var(--txt)">${escHtml(b.title)}</b>${b.dnfAt?` · ${escHtml(b.dnfAt)}`:''}${b.dnfReason?` — ${escHtml(b.dnfReason.split('\n')[0].slice(0,60))}`:''}</li>`).join('')}</ul></section>`;
  }

  if(!isAll) h+=`<section class="card"><span class="card-h">독서 히트맵</span>${renderHeatmap(allDone,year)}</section>`;
  c.innerHTML=h;
}

function saveGoalValue(v){
  appSettings.yearlyGoal=Math.max(0,Math.min(999,parseInt(v)||0));
  saveData();
  renderStats();
  showToast(appSettings.yearlyGoal?'목표를 저장했어요!':'목표를 지웠어요.');
}

function getGenreColor(name){
  return (typeof GENRE_COLOR_MAP!=='undefined'&&GENRE_COLOR_MAP[name])||'#808080';
}

function renderHeatmap(doneBooks,year){
  const dateMap={},dateBooks={};
  doneBooks.forEach(b=>{
    if(b.dateend&&b.dateend.startsWith(String(year))){
      const k=b.dateend.slice(0,10);
      dateMap[k]=(dateMap[k]||0)+1;
      (dateBooks[k]=dateBooks[k]||[]).push(b.id);
    }
  });
  const start=new Date(year,0,1),startDow=start.getDay();
  const totalDays=Math.round((new Date(year,11,31)-start)/86400000)+1;
  const totalWeeks=Math.ceil((startDow+totalDays)/7);
  const monthLabels=[];
  for(let m=0;m<12;m++){const d=new Date(year,m,1);const di=Math.round((d-start)/86400000);monthLabels.push({month:m,weekIndex:Math.floor((di+startDow)/7)});}
  const DAYS=['일','','화','','목','','토'];
  let cells='';
  for(let w=0;w<totalWeeks;w++){
    for(let d=0;d<7;d++){
      const dayOffset=w*7+d-startDow;
      if(dayOffset<0||dayOffset>=totalDays){cells+='<div></div>';continue;}
      const date=new Date(year,0,1+dayOffset);
      const k=localDate(date);
      const cnt=dateMap[k]||0;
      const lv=cnt===0?'':cnt===1?'lv1':cnt===2?'lv2':cnt===3?'lv3':'lv4';
      const tip=`${date.getMonth()+1}월 ${date.getDate()}일${cnt?' — 완독 '+cnt+'권':''}`;
      const ids=(dateBooks[k]||[]).join(',');
      const clickable=cnt?` heatmap-cell-clickable" onclick="goToHeatmapDate('${k}','${ids}')`:'';
      cells+=`<div class="heatmap-cell ${lv}${clickable}" title="${tip}"></div>`;
    }
  }
  let monthLabelHtml='<div style="display:flex;padding-left:22px;min-width:max-content">';
  for(let w=0;w<totalWeeks;w++){const ml=monthLabels.find(m=>m.weekIndex===w);monthLabelHtml+=`<div style="width:17px;font-size:10px;color:var(--txt3)">${ml?ml.month+1:''}</div>`;}
  monthLabelHtml+='</div>';
  const dayLabelHtml=`<div class="heatmap-days">${DAYS.map(d=>`<div class="heatmap-day-label">${d}</div>`).join('')}</div>`;
  const totalDone=Object.values(dateMap).reduce((a,b)=>a+b,0);
  return`<div class="heatmap-wrap"><div style="min-width:max-content">${monthLabelHtml}<div class="heatmap-outer">${dayLabelHtml}<div class="heatmap-grid">${cells}</div></div></div></div>
  <div class="heatmap-legend"><span>적음</span><div class="heatmap-cell"></div><div class="heatmap-cell lv1"></div><div class="heatmap-cell lv2"></div><div class="heatmap-cell lv3"></div><div class="heatmap-cell lv4"></div><span>많음</span><span style="margin-left:8px">완독 ${totalDone}권</span></div>`;
}

function goToHeatmapDate(dateStr,idsCsv){
  const ids=idsCsv?idsCsv.split(','):[];
  if(ids.length===1){openDetail(ids[0]);return;}
  const [y,m]=dateStr.split('-').map(Number);
  _calYear=y;_calMonth=m-1;
  switchPage('calendar');
  if(ids.length>1)showToast(`${dateStr}에 완독한 책 ${ids.length}권이에요.`);
}
