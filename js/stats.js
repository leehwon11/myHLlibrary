// ══════════════ 나의 서재 — Stats ══════════════

function renderStats(){
  const c=document.getElementById('statsContent');
  if(!c) return;
  if(!books.length){c.innerHTML='<div style="text-align:center;padding:60px 0;color:var(--txt3)"><div style="font-size:40px;opacity:.2">📊</div><p style="margin-top:8px">책을 추가하면 통계가 보여요!</p></div>';return;}
  const done=books.filter(b=>b.status==='완독');
  const reading=books.filter(b=>b.status==='읽는중');
  const wish=books.filter(b=>b.status==='읽고싶어요');
  const dnf=books.filter(b=>b.status==='하차');
  const avgR=done.length?((done.reduce((s,b)=>s+(b.rating||0),0)/done.length).toFixed(1)):'0.0';
  const year=new Date().getFullYear();
  const doneThisYear=done.filter(b=>b.dateend&&b.dateend.startsWith(String(year)));
  const goal=appSettings.yearlyGoal||30;

  let html='';

  html+=`<div class="section-title">기본 통계</div>
  <div class="stat-row">
    <div class="stat-box"><div class="stat-num">${books.length}</div><div class="stat-label">전체</div></div>
    <div class="stat-box"><div class="stat-num">${done.length}</div><div class="stat-label">완독</div></div>
    <div class="stat-box"><div class="stat-num">${reading.length}</div><div class="stat-label">읽는중</div></div>
    <div class="stat-box"><div class="stat-num">${wish.length}</div><div class="stat-label">읽고싶어요</div></div>
    ${dnf.length?`<div class="stat-box"><div class="stat-num">${dnf.length}</div><div class="stat-label">하차</div></div>`:''}
    <div class="stat-box"><div class="stat-num">${avgR}</div><div class="stat-label">평균 별점</div></div>
  </div>`;

  const goalPct=Math.min(100,Math.round(doneThisYear.length/goal*100));
  let circles='';
  for(let i=1;i<=goal;i++){
    circles+=`<div class="goal-circle${i<=doneThisYear.length?' filled':''}">${i}</div>`;
  }
  html+=`<div class="section-title">${year}년 독서 목표</div>
  <div class="goal-tracker">
    <div class="goal-tracker-header">
      <span style="font-family:var(--font-serif);font-size:18px;color:var(--txt2)">${doneThisYear.length} / ${goal}권</span>
      <span style="font-family:var(--font-serif);font-size:16px;color:var(--txt3)">${goalPct}%</span>
    </div>
    ${circles}
  </div>`;

  const monthCounts=Array(12).fill(0);
  doneThisYear.forEach(b=>{
    const m=parseInt(b.dateend.slice(5,7))-1;
    if(m>=0&&m<12) monthCounts[m]++;
  });
  let monthHtml='';
  for(let i=0;i<12;i++){
    let dots='';
    for(let d=0;d<monthCounts[i];d++) dots+=`<div class="month-dot"></div>`;
    monthHtml+=`<div class="month-col"><div class="month-dots">${dots}</div><div class="month-label-text">${i+1}월</div></div>`;
  }
  html+=`<div class="section-title">월별 독서량</div><div class="monthly-row">${monthHtml}</div>`;

  const genreMap={};
  done.forEach(b=>(b.genre||[]).forEach(g=>{genreMap[g]=(genreMap[g]||0)+1;}));
  const genreEntries=Object.entries(genreMap).sort((a,b)=>b[1]-a[1]);
  if(genreEntries.length){
    let totalG=genreEntries.reduce((s,e)=>s+e[1],0);
    let conic='',deg=0;
    const legendItems=[];
    genreEntries.forEach(([name,count])=>{
      const color=getGenreColor(name);
      const pct=count/totalG*360;
      conic+=`${color} ${deg}deg ${deg+pct}deg,`;
      deg+=pct;
      legendItems.push(`<div class="pie-item"><div class="pie-dot" style="background:${color}"></div>${escHtml(name)} (${count})</div>`);
    });
    conic=conic.slice(0,-1);
    html+=`<div class="section-title">장르 분포</div>
    <div class="pie-wrap">
      <div class="pie-chart" style="background:conic-gradient(${conic})"></div>
      <div class="pie-legend">${legendItems.join('')}</div>
    </div>`;
  }

  const starCounts=[0,0,0,0,0];
  done.forEach(b=>{if(b.rating>=1&&b.rating<=5) starCounts[b.rating-1]++;});
  const maxStar=Math.max(...starCounts,1);
  let starHtml='';
  for(let i=4;i>=0;i--){
    const pct=Math.round(starCounts[i]/maxStar*100);
    starHtml+=`<div class="star-bar-row">
      <div class="star-bar-label">${'★'.repeat(i+1)}</div>
      <div class="star-bar-track"><div class="star-bar-fill" style="width:${pct}%"></div></div>
      <div class="star-bar-count">${starCounts[i]}</div>
    </div>`;
  }
  html+=`<div class="section-title">별점 분포</div><div class="star-bars">${starHtml}</div>`;

  html+=renderTagCloud('소재 태그',done,'sojaiTags');
  html+=renderTagCloud('관계 태그',done,'relTags');
  html+=renderMlTypeBars(done);
  html+=renderFlTypeBars(done);
  html+=renderHeatmap(done);

  c.innerHTML=html;
}

function getGenreColor(name){
  return (typeof GENRE_COLOR_MAP!=='undefined'&&GENRE_COLOR_MAP[name])||'#808080';
}

function renderTagCloud(title,doneBooks,field){
  const map={};
  doneBooks.forEach(b=>(b[field]||[]).forEach(t=>{map[t]=(map[t]||0)+1;}));
  const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]);
  if(!entries.length) return '';
  const maxC=entries[0][1];
  const colors=['sticker-pink','sticker-mint','sticker-lavender','sticker-yellow'];
  const tags=entries.map(([name,count],i)=>{
    const size=Math.round(13+(count/maxC)*9);
    return `<span class="sticker ${colors[i%4]}" style="font-size:${size}px">${escHtml(name)} (${count})</span>`;
  }).join('');
  return `<div class="section-title">${escHtml(title)}</div><div class="tag-cloud">${tags}</div>`;
}

function renderCharBars(title,doneBooks,field,color){
  const map={};
  doneBooks.forEach(b=>{if(b[field]) map[b[field]]=(map[b[field]]||0)+1;});
  const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,10);
  if(!entries.length) return '';
  const maxC=entries[0][1];
  const bars=entries.map(([name,count])=>{
    const pct=Math.round(count/maxC*100);
    return `<div class="char-bar-row">
      <div class="char-bar-label">${escHtml(name)}</div>
      <div class="char-bar-track"><div class="char-bar-fill" style="width:${pct}%;background:${color}"></div></div>
      <div class="char-bar-count">${count}</div>
    </div>`;
  }).join('');
  return `<div class="section-title">${escHtml(title)}</div><div class="char-bars">${bars}</div>`;
}

function renderMlTypeBars(doneBooks){
  const map={};
  doneBooks.forEach(b=>{
    const arr=Array.isArray(b.ml)?b.ml:(b.ml&&b.ml.name?[b.ml]:[]);
    arr.forEach(m=>(m.typeTags||[]).forEach(t=>{const tag=t.replace(/^#/,'');map[tag]=(map[tag]||0)+1;}));
  });
  const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,10);
  if(!entries.length) return '';
  const maxC=entries[0][1];
  const bars=entries.map(([name,count])=>{
    const pct=Math.round(count/maxC*100);
    return `<div class="char-bar-row"><div class="char-bar-label">${escHtml(name)}</div><div class="char-bar-track"><div class="char-bar-fill" style="width:${pct}%;background:var(--rose)"></div></div><div class="char-bar-count">${count}</div></div>`;
  }).join('');
  return `<div class="section-title">남주 유형</div><div class="char-bars">${bars}</div>`;
}

function renderFlTypeBars(doneBooks){
  const map={};
  doneBooks.forEach(b=>{
    const tags=[...(b.flTypeTags||[]),...(b.fl&&b.fl.typeTags?b.fl.typeTags:[])].filter((v,i,a)=>a.indexOf(v)===i);
    tags.forEach(t=>{const tag=t.replace(/^#/,'');map[tag]=(map[tag]||0)+1;});
  });
  const entries=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,10);
  if(!entries.length) return '';
  const maxC=entries[0][1];
  const bars=entries.map(([name,count])=>{
    const pct=Math.round(count/maxC*100);
    return `<div class="char-bar-row"><div class="char-bar-label">${escHtml(name)}</div><div class="char-bar-track"><div class="char-bar-fill" style="width:${pct}%;background:var(--acc2)"></div></div><div class="char-bar-count">${count}</div></div>`;
  }).join('');
  return `<div class="section-title">여주 유형</div><div class="char-bars">${bars}</div>`;
}

function renderHeatmap(doneBooks){
  const today=new Date();
  const year=today.getFullYear();
  const dateMap={},dateBooks={};
  doneBooks.forEach(b=>{
    if(b.dateend&&b.dateend.startsWith(String(year))){
      const k=b.dateend.slice(0,10);
      dateMap[k]=(dateMap[k]||0)+1;
      if(!dateBooks[k]) dateBooks[k]=[];
      dateBooks[k].push(b.id);
    }
  });

  const start=new Date(year,0,1),startDow=start.getDay();
  const totalDays=(new Date(year,11,31)-start)/86400000+1;
  const totalWeeks=Math.ceil((startDow+totalDays)/7);
  const monthLabels=[];
  for(let m=0;m<12;m++){const d=new Date(year,m,1);const di=Math.round((d-start)/86400000);monthLabels.push({month:m,weekIndex:Math.floor((di+startDow)/7)});}
  const MNS=['1','2','3','4','5','6','7','8','9','10','11','12'];
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

  let monthLabelHtml='<div style="display:flex;gap:0;padding-left:28px;min-width:max-content">';
  for(let w=0;w<totalWeeks;w++){const ml=monthLabels.find(m=>m.weekIndex===w);monthLabelHtml+=`<div style="width:17px;font-size:10px;color:var(--txt4)">${ml?MNS[ml.month]:''}</div>`;}
  monthLabelHtml+='</div>';

  let dayLabelHtml='<div class="heatmap-days">';
  DAYS.forEach(d=>{dayLabelHtml+=`<div class="heatmap-day-label">${d}</div>`;});
  dayLabelHtml+='</div>';

  const totalDone=Object.values(dateMap).reduce((a,b)=>a+b,0);

  return `<div class="section-title">독서 히트맵</div>
  <div>${monthLabelHtml}<div class="heatmap-outer">${dayLabelHtml}<div class="heatmap-wrap"><div class="heatmap-grid">${cells}</div></div></div>
  <div class="heatmap-legend"><span>적음</span><div class="heatmap-legend-cell"></div><div class="heatmap-legend-cell" style="background:#c6e6d4"></div><div class="heatmap-legend-cell" style="background:#7bc99d"></div><div class="heatmap-legend-cell" style="background:#3d9e68"></div><div class="heatmap-legend-cell" style="background:#1d6e44"></div><span>많음</span><span style="margin-left:8px">완독 ${totalDone}권</span></div></div>`;
}

function goToHeatmapDate(dateStr,idsCsv){
  const ids=idsCsv?idsCsv.split(','):[];
  const [y,m]=dateStr.split('-').map(Number);
  _calYear=y;_calMonth=m-1;
  switchPage('calendar',document.querySelector('[onclick*="switchPage(\'calendar\'"]')||document.querySelectorAll('.nav-tab')[1]);
  renderCalendar();
  if(ids.length===1){setTimeout(()=>openDetail(ids[0]),150);}
  else if(ids.length>1){showToast(`${dateStr}에 완독한 책 ${ids.length}권 — 아래 목록에서 확인하세요.`);}
}
