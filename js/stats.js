// ══════════════ STATS ══════════════
let _currentStatsTab='overview';
function switchStatsTab(id,el){_currentStatsTab=id;document.querySelectorAll('.stats-tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');renderStats();}
function renderStats(){
  const el=document.getElementById('statsContent');
  if(!books.length){el.innerHTML='<div style="text-align:center;padding:60px 0;color:var(--txt3)"><div style="font-size:40px;opacity:.2">📊</div><p style="margin-top:8px">책을 추가하면 통계가 보여요!</p></div>';return;}
  const done=books.filter(b=>b.status==='완독').length,reading=books.filter(b=>b.status==='읽는중').length,wish=books.filter(b=>b.status==='읽고싶어요').length;
  const rated=books.filter(b=>b.rating>0),avg=rated.length?(rated.reduce((s,b)=>s+b.rating,0)/rated.length).toFixed(1):'-';
  const totalPrice=books.reduce((s,b)=>s+(Number(b.price)||0),0);
  const daysArr=books.filter(b=>b.datestart&&b.dateend).map(b=>daysBetween(b.datestart,b.dateend)).filter(d=>d>0);
  const avgDays=daysArr.length?Math.round(daysArr.reduce((a,b)=>a+b,0)/daysArr.length):null;
  const genreMap={};books.forEach(b=>{(b.genre||[]).forEach(g=>{genreMap[g]=(genreMap[g]||0)+1;});});
  const genreEntries=Object.entries(genreMap).sort((a,b)=>b[1]-a[1]),maxG=genreEntries[0]?.[1]||1;
  const platMap={};books.forEach(b=>{if(b.platform)platMap[b.platform]=(platMap[b.platform]||0)+1;});
  const platEntries=Object.entries(platMap).sort((a,b)=>b[1]-a[1]),maxP=platEntries[0]?.[1]||1;
  const starMap={1:0,2:0,3:0,4:0,5:0};books.forEach(b=>{if(b.rating>0)starMap[b.rating]++;});
  const year=new Date().getFullYear(),monthMap=Array(12).fill(0);
  books.forEach(b=>{const d=b.datebuy?new Date(b.datebuy):(b.createdAt?new Date(b.createdAt):null);if(d&&d.getFullYear()===year)monthMap[d.getMonth()]++;});
  const maxM=Math.max(...monthMap,1),MN=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
  const monthBars=monthMap.map((n,i)=>`<div class="month-col"><div class="month-num-label">${n||''}</div><div class="month-bar-wrap"><div class="month-bar" style="height:${Math.round(n/maxM*88)+2}px;opacity:${n?1:.12}" data-tip="${MN[i]}: ${n}권"></div></div></div>`).join('');
  const genreBars=genreEntries.map(([id,cnt])=>{const g=getGenre(id);return`<div class="bar-row"><span class="bar-label">${escHtml(g.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(cnt/maxG*100)}%;background:${g.color}"></div></div><span class="bar-count">${cnt}</span></div>`;}).join('');
  const platBars=platEntries.map(([p,c])=>`<div class="bar-row"><span class="bar-label">${escHtml(p)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/maxP*100)}%;background:var(--acc)"></div></div><span class="bar-count">${c}</span></div>`).join('')||'<p style="font-size:12px;color:var(--txt4)">플랫폼 데이터 없음</p>';
  const starBars=[5,4,3,2,1].map(n=>`<div class="star-dist-row"><span class="star-dist-label">${'★'.repeat(n)}</span><div class="bar-track"><div class="bar-fill" style="width:${rated.length?Math.round(starMap[n]/rated.length*100):0}%;background:#e8a020"></div></div><span class="bar-count">${starMap[n]}</span></div>`).join('');
  const mlTypeMap={},flTypeMap={};
  books.forEach(b=>{const mlArr=Array.isArray(b.ml)?b.ml:(b.ml&&b.ml.name?[b.ml]:[]);mlArr.forEach(m=>(m.typeTags||[]).forEach(t=>{mlTypeMap[t]=(mlTypeMap[t]||0)+1;}));if(b.fl)(b.fl.typeTags||[]).forEach(t=>{flTypeMap[t]=(flTypeMap[t]||0)+1;});});
  const mlTE=Object.entries(mlTypeMap).sort((a,b)=>b[1]-a[1]).slice(0,10),maxMlT=mlTE[0]?.[1]||1;
  const flTE=Object.entries(flTypeMap).sort((a,b)=>b[1]-a[1]).slice(0,10),maxFlT=flTE[0]?.[1]||1;
  const mlTypeBars=mlTE.map(([t,c])=>`<div class="bar-row"><span class="bar-label">${escHtml(t)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/maxMlT*100)}%;background:var(--acc2)"></div></div><span class="bar-count">${c}</span></div>`).join('')||'<p style="font-size:12px;color:var(--txt4)">유형 데이터 없음</p>';
  const flTypeBars=flTE.map(([t,c])=>`<div class="bar-row"><span class="bar-label">${escHtml(t)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/maxFlT*100)}%;background:var(--rose)"></div></div><span class="bar-count">${c}</span></div>`).join('')||'<p style="font-size:12px;color:var(--txt4)">유형 데이터 없음</p>';
  const moodMap={};books.forEach(b=>(b.moods||[]).forEach(m=>{moodMap[m]=(moodMap[m]||0)+1;}));
  const moodEntries=Object.entries(moodMap).sort((a,b)=>b[1]-a[1]),maxMood=moodEntries[0]?.[1]||1;
  const moodBars=moodEntries.map(([label,cnt])=>{const m=MOOD_OPTIONS.find(x=>x.label===label);return`<div class="bar-row"><span class="bar-label" style="color:${m?.color||'var(--txt2)'}">${m?.emoji||''} ${escHtml(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(cnt/maxMood*100)}%;background:${m?.color||'var(--acc)'}"></div></div><span class="bar-count">${cnt}</span></div>`;}).join('')||'<p style="font-size:12px;color:var(--txt4)">감정 태그 데이터 없음</p>';
  // ── 소재/관계 태그 Top 10 ──
  const sojai={},rel={};
  books.forEach(b=>{(b.sojaiTags||b.tags||[]).forEach(t=>{sojai[t]=(sojai[t]||0)+1;});(b.relTags||b.themes||[]).forEach(t=>{rel[t]=(rel[t]||0)+1;});});
  const sojai10=Object.entries(sojai).sort((a,b)=>b[1]-a[1]).slice(0,10),maxS=sojai10[0]?.[1]||1;
  const rel10=Object.entries(rel).sort((a,b)=>b[1]-a[1]).slice(0,10),maxR=rel10[0]?.[1]||1;
  const sojaBars=sojai10.map(([t,c])=>`<div class="bar-row"><span class="bar-label">${escHtml(t)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/maxS*100)}%;background:var(--rose)"></div></div><span class="bar-count">${c}</span></div>`).join('')||'<p style="font-size:12px;color:var(--txt4)">소재 태그 없음</p>';
  const relBars=rel10.map(([t,c])=>`<div class="bar-row"><span class="bar-label">${escHtml(t)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.round(c/maxR*100)}%;background:var(--green)"></div></div><span class="bar-count">${c}</span></div>`).join('')||'<p style="font-size:12px;color:var(--txt4)">관계 태그 없음</p>';

  const panels={
    overview:`
      <div class="stats-top-grid">
        <div class="stat-card"><div class="stat-label">전체</div><div class="stat-value">${books.length}</div><div class="stat-sub">권</div></div>
        <div class="stat-card"><div class="stat-label">완독</div><div class="stat-value" style="color:var(--green)">${done}</div><div class="stat-sub">권 읽었어요</div></div>
        <div class="stat-card"><div class="stat-label">읽는 중</div><div class="stat-value" style="color:var(--amber)">${reading}</div><div class="stat-sub">권</div></div>
        <div class="stat-card"><div class="stat-label">읽고 싶어요</div><div class="stat-value" style="color:var(--blue)">${wish}</div><div class="stat-sub">권 대기 중</div></div>
        <div class="stat-card"><div class="stat-label">평균 별점</div><div class="stat-value">${avg}</div><div class="stat-sub">${rated.length}권 기준</div></div>
        <div class="stat-card"><div class="stat-label">총 소비 금액</div><div class="stat-value" style="font-size:${totalPrice>=100000?'20px':'28px'}">${totalPrice?totalPrice.toLocaleString('ko-KR'):'-'}</div><div class="stat-sub">${totalPrice?'원':'금액 미입력'}</div></div>
        <div class="stat-card"><div class="stat-label">평균 독서 시간</div><div class="stat-value">${avgDays||'-'}</div><div class="stat-sub">${avgDays?'일 / '+daysArr.length+'권 기준':'날짜 미입력'}</div></div>
      </div>
      <div class="stats-section"><h3>📅 연간 완독 히트맵 <span style="font-size:13px;color:var(--txt4);font-family:var(--font-body)">${year}년</span></h3>${buildHeatmap()}</div>`,
    chart:`
      <div class="stats-section"><h3>월별 구매 현황 <span style="font-size:13px;color:var(--txt4);font-family:var(--font-body)">${year}년</span></h3><div class="monthly-chart">${monthBars}</div><div style="display:flex;gap:6px;padding:0 4px;margin-top:4px">${MN.map(m=>`<div style="flex:1;font-size:10px;color:var(--txt4);text-align:center">${m}</div>`).join('')}</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px">
        <div class="stats-section"><h3>장르 분포</h3>${genreBars}</div>
        <div class="stats-section"><h3>별점 분포</h3>${starBars}</div>
        <div class="stats-section"><h3>구매 플랫폼</h3>${platBars}</div>
      </div>`,
    tags:`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div class="stats-section"><h3>🔖 소재 태그 Top 10</h3>${sojaBars}</div>
        <div class="stats-section"><h3>💞 관계 태그 Top 10</h3>${relBars}</div>
      </div>`,
    char:`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div class="stats-section"><h3>💙 남주 유형 Top 10</h3>${mlTypeBars}</div>
        <div class="stats-section"><h3>🩷 여주 유형 Top 10</h3>${flTypeBars}</div>
      </div>`,
    mood:`<div class="stats-section"><h3>💭 감정 태그 분포</h3>${moodBars}</div>`
  };
  el.innerHTML=panels[_currentStatsTab]||panels.overview;
}

// ══════════════ 히트맵 ══════════════
function buildHeatmap(){
  const year=new Date().getFullYear();
  const dateMap={},dateBooks={};
  books.forEach(b=>{if(b.dateend&&b.status==='완독'&&b.dateend.startsWith(String(year))){const k=b.dateend.slice(0,10);dateMap[k]=(dateMap[k]||0)+1;if(!dateBooks[k])dateBooks[k]=[];dateBooks[k].push(b.id);}});
  const start=new Date(year,0,1),startDow=start.getDay();
  const totalDays=(new Date(year,11,31)-start)/86400000+1;
  const totalWeeks=Math.ceil((startDow+totalDays)/7);
  const monthLabels=[];for(let m=0;m<12;m++){const d=new Date(year,m,1);const di=Math.round((d-start)/86400000);monthLabels.push({month:m,weekIndex:Math.floor((di+startDow)/7)});}
  const MNS=['1','2','3','4','5','6','7','8','9','10','11','12'];
  const DAYS=['일','','화','','목','','토'];
  let cells='';
  for(let w=0;w<totalWeeks;w++){for(let d=0;d<7;d++){const dayOffset=w*7+d-startDow;if(dayOffset<0||dayOffset>=totalDays){cells+='<div></div>';continue;}const date=new Date(year,0,1+dayOffset);const k=date.toISOString().slice(0,10);const cnt=dateMap[k]||0;const lv=cnt===0?'':cnt===1?'lv1':cnt===2?'lv2':cnt===3?'lv3':'lv4';const tip=`${date.getMonth()+1}월 ${date.getDate()}일${cnt?' — 완독 '+cnt+'권':''}`;const ids=(dateBooks[k]||[]).join(',');const clickable=cnt?` heatmap-cell-clickable" onclick="goToHeatmapDate('${k}','${ids}')`:'';cells+=`<div class="heatmap-cell ${lv}${clickable}" title="${tip}"></div>`;}}
  let monthLabelHtml='<div style="display:flex;gap:0;padding-left:28px;min-width:max-content">';
  for(let w=0;w<totalWeeks;w++){const ml=monthLabels.find(m=>m.weekIndex===w);monthLabelHtml+=`<div style="width:17px;font-size:10px;color:var(--txt4)">${ml?MNS[ml.month]:''}</div>`;}
  monthLabelHtml+='</div>';
  let dayLabelHtml='<div class="heatmap-days">';
  DAYS.forEach(d=>{dayLabelHtml+=`<div class="heatmap-day-label">${d}</div>`;});dayLabelHtml+='</div>';
  const totalDone=Object.values(dateMap).reduce((a,b)=>a+b,0);
  return`<div>${monthLabelHtml}<div class="heatmap-outer">${dayLabelHtml}<div class="heatmap-wrap"><div class="heatmap-grid">${cells}</div></div></div><div class="heatmap-legend"><span>적음</span><div class="heatmap-legend-cell"></div><div class="heatmap-legend-cell" style="background:#c6e6d4"></div><div class="heatmap-legend-cell" style="background:#7bc99d"></div><div class="heatmap-legend-cell" style="background:#3d9e68"></div><div class="heatmap-legend-cell" style="background:#1d6e44"></div><span>많음</span><span style="margin-left:8px">완독 ${totalDone}권</span></div></div>`;
}
// 히트맵 날짜 클릭 → 완독 캘린더 탭으로 이동, 해당 월로 이동. 그 날 완독한 책이 1권이면 바로 상세 열기.
function goToHeatmapDate(dateStr,idsCsv){
  const ids=idsCsv?idsCsv.split(','):[];
  const [y,m]=dateStr.split('-').map(Number);
  _calYear=y;_calMonth=m-1;
  switchPage('calendar',document.querySelector('[onclick*="switchPage(\'calendar\'"]')||document.querySelectorAll('.nav-tab')[1]);
  renderCalendar();
  if(ids.length===1){setTimeout(()=>openDetail(ids[0]),150);}
  else if(ids.length>1){showToast(`${dateStr}에 완독한 책 ${ids.length}권 — 아래 목록에서 확인하세요.`);}
}
