// ══════════════ 나의 서재 — Stats ══════════════

function renderStats(){
  const c=document.getElementById('statsContainer');
  if(!c) return;
  const done=books.filter(b=>b.status==='완독');
  const reading=books.filter(b=>b.status==='읽는중');
  const wish=books.filter(b=>b.status==='읽고싶어요');
  const avgR=done.length?((done.reduce((s,b)=>s+(b.rating||0),0)/done.length).toFixed(1)):'0.0';
  const year=new Date().getFullYear();
  const doneThisYear=done.filter(b=>b.dateEnd&&b.dateEnd.startsWith(String(year)));
  const goal=appSettings.yearlyGoal||30;

  let html='';

  html+=`<div class="section-title">기본 통계</div>
  <div class="stat-row">
    <div class="stat-box"><div class="stat-num">${books.length}</div><div class="stat-label">전체</div></div>
    <div class="stat-box"><div class="stat-num">${done.length}</div><div class="stat-label">완독</div></div>
    <div class="stat-box"><div class="stat-num">${reading.length}</div><div class="stat-label">읽는중</div></div>
    <div class="stat-box"><div class="stat-num">${wish.length}</div><div class="stat-label">읽고싶어요</div></div>
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
      <span style="font-family:var(--font-hand);font-size:18px;color:var(--ink-light)">${doneThisYear.length} / ${goal}권</span>
      <span style="font-family:var(--font-hand);font-size:16px;color:var(--ink-muted)">${goalPct}%</span>
    </div>
    ${circles}
  </div>`;

  const monthCounts=Array(12).fill(0);
  doneThisYear.forEach(b=>{
    const m=parseInt(b.dateEnd.slice(5,7))-1;
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
  done.forEach(b=>(b.genres||[]).forEach(g=>{genreMap[g]=(genreMap[g]||0)+1;}));
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

  html+=renderTagCloud('소재 태그',done,'sojai');
  html+=renderTagCloud('관계 태그',done,'rel');
  html+=renderCharBars('남주 유형',done,'mlType','var(--pink)');
  html+=renderCharBars('여주 유형',done,'flType','var(--lavender)');
  html+=renderHeatmap(done);

  c.innerHTML=html;
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

function renderHeatmap(doneBooks){
  const today=new Date();
  const yearAgo=new Date(today);
  yearAgo.setFullYear(yearAgo.getFullYear()-1);
  yearAgo.setDate(yearAgo.getDate()-yearAgo.getDay());

  const dateMap={};
  doneBooks.forEach(b=>{
    if(b.dateEnd) dateMap[b.dateEnd]=(dateMap[b.dateEnd]||0)+1;
  });

  let cells='';
  const d=new Date(yearAgo);
  while(d<=today){
    const key=d.toISOString().slice(0,10);
    const count=dateMap[key]||0;
    let lv='';
    if(count===1) lv='lv1';
    else if(count===2) lv='lv2';
    else if(count===3) lv='lv3';
    else if(count>=4) lv='lv4';
    cells+=`<div class="hm-cell ${lv}" title="${key}: ${count}권"></div>`;
    d.setDate(d.getDate()+1);
  }

  const days=['일','월','화','수','목','금','토'];
  const dayLabels=days.map(d=>`<div class="heatmap-day">${d}</div>`).join('');

  return `<div class="section-title">독서 히트맵</div>
  <div class="heatmap-wrap">
    <div class="heatmap-outer">
      <div class="heatmap-days">${dayLabels}</div>
      <div class="heatmap-grid">${cells}</div>
    </div>
    <div class="heatmap-legend">
      적음
      <div class="swatch" style="background:var(--ink-faint);opacity:.3"></div>
      <div class="swatch" style="background:var(--mint);opacity:.3"></div>
      <div class="swatch" style="background:var(--mint);opacity:.5"></div>
      <div class="swatch" style="background:var(--mint);opacity:.7"></div>
      <div class="swatch" style="background:var(--mint);opacity:1"></div>
      많음
    </div>
  </div>`;
}
