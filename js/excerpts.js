// ══════════════ 나의 서재 — 발췌함 ══════════════

let _excSpeaker='',_excTag='',_excQuery='';

function openExcerptTag(tag){_excTag=tag;_excSpeaker='';_excQuery='';switchPage('excerpts');}

function renderExcerptBox(){
  const c=document.getElementById('excerptsPage');
  if(!c) return;
  const all=allExcerpts();
  if(!all.length){
    c.innerHTML=`<div class="page-head"><h1 class="page-title">발췌함</h1></div><div class="empty" style="background:var(--white);border:1px solid var(--line);border-radius:var(--radius)"><div class="empty-ico">✍️</div><p>아직 발췌가 없어요. 책 수정 화면의 "발췌"에서 마음에 남은 문장을 남겨보세요.</p></div>`;
    return;
  }
  const spkCount={};all.forEach(({e})=>{if(e.speaker)spkCount[e.speaker]=(spkCount[e.speaker]||0)+1;});
  const tagCount={};all.forEach(({e})=>(e.tags||[]).forEach(t=>{tagCount[t]=(tagCount[t]||0)+1;}));
  const tagList=Object.entries(tagCount).sort((a,b)=>b[1]-a[1]);
  if(_excTag&&!tagCount[_excTag])_excTag='';

  const speakerPills=[`<button class="pill${!_excSpeaker?' on':''}" onclick="_excSpeaker='';renderExcerptBox()">전체</button>`,
    ...EXC_SPEAKERS.filter(s=>spkCount[s.v]).map(s=>`<button class="pill${_excSpeaker===s.v?' on':''}" onclick="_excSpeaker=_excSpeaker==='${s.v}'?'':'${s.v}';renderExcerptBox()">${s.v} <span class="hint">${spkCount[s.v]}</span></button>`)].join('');
  const tagPills=tagList.map(([t,n])=>`<button class="pill${_excTag===t?' on':''}" data-tag="${encodeURIComponent(t)}" onclick="const t=decodeURIComponent(this.dataset.tag);_excTag=_excTag===t?'':t;renderExcerptBox()">${escHtml(t)} <span class="hint">${n}</span></button>`).join('');

  c.innerHTML=`<div class="page-head">
      <h1 class="page-title">발췌함<span class="page-count" id="excCount"></span></h1>
      <div class="search-wrap"><span class="search-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg></span><input type="text" placeholder="문장, 책 제목으로 검색" aria-label="발췌 검색" value="${escHtml(_excQuery)}" oninput="_excQuery=this.value;renderExcList()"></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card filter-card">
        <div class="filter-row"><span class="filter-label">누구의</span>${speakerPills}</div>
        ${tagPills?`<div class="filter-row"><span class="filter-label">태그</span>${tagPills}</div>`:''}
      </div>
      <div class="quote-grid" id="excList"></div>
    </div>`;
  renderExcList();
}

function renderExcList(){
  const el=document.getElementById('excList');
  if(!el) return;
  const q=_excQuery.trim().toLowerCase();
  const all=allExcerpts();
  const list=all.filter(({e,b})=>(!_excSpeaker||e.speaker===_excSpeaker)&&(!_excTag||(e.tags||[]).includes(_excTag))&&(!q||[e.text,e.reason,e.location,b.title,b.author].join(' ').toLowerCase().includes(q)));
  const cnt=document.getElementById('excCount');
  if(cnt)cnt.textContent=`책 ${new Set(all.map(x=>x.b.id)).size}권 · 발췌 ${all.length}개${list.length!==all.length?` 중 ${list.length}개`:''}`;
  el.innerHTML=list.length?list.map(({e,b})=>quoteCardHtml(e,b,true)).join(''):'<p class="hint">조건에 맞는 발췌가 없어요.</p>';
}
