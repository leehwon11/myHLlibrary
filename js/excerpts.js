// ══════════════ 나의 서재 — 발췌함 ══════════════

let _excSpeaker='',_excTag='',_excQuery='',_excSort='new',_excSeed=0,_boxPick=null;

function openExcerptTag(tag){_excTag=tag;_excSpeaker='';_excQuery='';switchPage('excerpts');}

// 상자에서 한 장 뽑기: 처음에는 오늘의 발췌와 같은 카드, 누르면 다른 책에서 한 장
function drawnExcerpt(){
  const all=allExcerpts();
  if(!all.length)return null;
  if(_boxPick){const hit=all.find(x=>x.b.id===_boxPick.bookId&&x.e.text===_boxPick.text);if(hit)return hit;}
  const p=pickExcerpt();return p?{e:p.e,b:p.b}:all[0];
}
function drawAnother(){
  const all=allExcerpts(),cur=drawnExcerpt();
  const pool=all.filter(x=>!cur||x.b.id!==cur.b.id);
  const pick=(pool.length?pool:all)[Math.floor(Math.random()*(pool.length||all.length))];
  _boxPick={bookId:pick.b.id,text:pick.e.text};
  renderExcerptBox();
}

function renderExcerptBox(){
  const c=document.getElementById('excerptsPage');
  if(!c) return;
  const all=allExcerpts();
  if(!all.length){
    c.innerHTML=`<div class="page-head"><h1 class="page-title">발췌함</h1></div><div class="empty"><div class="empty-ico">✍️</div><p>아직 발췌가 없어요. 도서 등록부의 "6. 발췌"에서 마음에 남은 문장을 카드로 남겨보세요.</p></div>`;
    return;
  }
  const spkCount={};all.forEach(({e})=>{if(e.speaker)spkCount[e.speaker]=(spkCount[e.speaker]||0)+1;});
  const tagCount={};all.forEach(({e})=>(e.tags||[]).forEach(t=>{tagCount[t]=(tagCount[t]||0)+1;}));
  const tagList=Object.entries(tagCount).sort((a,b)=>b[1]-a[1]);
  if(_excTag&&!tagCount[_excTag])_excTag='';

  const speakerBtns=[`<button class="spk-btn${!_excSpeaker?' on':''}" aria-pressed="${!_excSpeaker}" onclick="_excSpeaker='';renderExcerptBox()">전체 <small>${all.length}</small></button>`,
    ...EXC_SPEAKERS.filter(s=>spkCount[s.v]).map(s=>`<button class="spk-btn spk-${s.v}${_excSpeaker===s.v?' on':''}" aria-pressed="${_excSpeaker===s.v}" onclick="_excSpeaker=_excSpeaker==='${s.v}'?'':'${s.v}';renderExcerptBox()">${s.v} <small>${spkCount[s.v]}</small></button>`)].join('');
  const tagBtns=tagList.map(([t,n])=>`<button class="tag-btn${_excTag===t?' on':''}" aria-pressed="${_excTag===t}" data-tag="${encodeURIComponent(t)}" onclick="const t=decodeURIComponent(this.dataset.tag);_excTag=_excTag===t?'':t;renderExcerptBox()">${escHtml(t)} ${n}</button>`).join('');
  const sorts=[['new','최신순'],['ep','화수순'],['shuffle','섞기']].map(([v,l])=>`<button class="${_excSort===v?'on':''}" aria-pressed="${_excSort===v}" onclick="_excSort='${v}';if('${v}'==='shuffle')_excSeed=Math.random();renderExcList()">${l}</button>`).join('');

  const d=drawnExcerpt();
  const drawn=d?`<div class="drawn"><figure class="index-card${d.e.speaker?' spk-'+escHtml(d.e.speaker):''}" style="border-top:4px solid var(--spk,var(--red))"><span class="tape" aria-hidden="true"></span><p class="hand" onclick="openDetail('${d.b.id}')">${escHtml(d.e.text)}</p><figcaption><button type="button" class="quote-src" onclick="openDetail('${d.b.id}')">${escHtml(d.b.title)}${d.e.location?' · '+escHtml(d.e.location):''}</button>${d.e.speaker?`<span class="q-speaker spk-${escHtml(d.e.speaker)}">${escHtml(d.e.speaker)}</span>`:''}</figcaption></figure></div>`:'';

  c.innerHTML=`<div class="page-head">
      <h1 class="page-title">발췌함<span class="page-count" id="excCount"></span></h1>
      <div class="seg" role="group" aria-label="정렬" id="excSort">${sorts}</div>
    </div>
    <div class="exc-layout">
      <div class="exc-side">
        <section class="sec"><div class="sec-head"><h2 class="sec-title">오늘 뽑은 카드</h2></div>${drawn}
          ${all.length>1?`<button class="btn primary" onclick="drawAnother()">한 장 더 뽑기</button>`:''}
        </section>
        <section class="filter-box" aria-label="걸러 보기">
          <h2 class="card-h">걸러 보기</h2>
          <label style="display:flex;flex-direction:column;gap:4px"><span>검색</span><input type="search" placeholder="문장, 책 제목, 태그" value="${escHtml(_excQuery)}" oninput="_excQuery=this.value;renderExcList()"></label>
          <div style="display:flex;flex-direction:column;gap:6px"><span class="filter-cap">화자</span><div class="filter-row">${speakerBtns}</div></div>
          ${tagBtns?`<div style="display:flex;flex-direction:column;gap:6px"><span class="filter-cap">내가 단 태그</span><div class="filter-row">${tagBtns}</div></div>`:''}
        </section>
      </div>
      <section class="exc-main">
        <div class="sec-head"><h2 class="sec-title">카드 상자</h2><span class="hint" id="excFilterNote"></span></div>
        <div class="card-box"><div class="quote-grid" id="excList"></div></div>
      </section>
    </div>`;
  renderExcList();
}

function epNum(loc){const m=String(loc||'').match(/\d+/);return m?Number(m[0]):Infinity;}
function seeded(seed,i){const x=Math.sin(seed*9973+i*7919)*10000;return x-Math.floor(x);}

function renderExcList(){
  const el=document.getElementById('excList');
  if(!el) return;
  document.querySelectorAll('#excSort button').forEach(btn=>{const on=btn.getAttribute('onclick').includes(`'${_excSort}'`);btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',on);});
  const q=_excQuery.trim().toLowerCase();
  const all=allExcerpts();
  let list=all.filter(({e,b})=>(!_excSpeaker||e.speaker===_excSpeaker)&&(!_excTag||(e.tags||[]).includes(_excTag))&&(!q||[e.text,e.reason,e.location,b.title,b.author,...(e.tags||[])].join(' ').toLowerCase().includes(q)));
  if(_excSort==='ep')list=list.slice().sort((x,y)=>x.b.title.localeCompare(y.b.title,'ko')||epNum(x.e.location)-epNum(y.e.location));
  else if(_excSort==='shuffle')list=list.map((x,i)=>({x,k:seeded(_excSeed,i)})).sort((a,b)=>a.k-b.k).map(o=>o.x);
  const cnt=document.getElementById('excCount');
  if(cnt)cnt.textContent=`색인 카드 ${all.length}장 · 책 ${new Set(all.map(x=>x.b.id)).size}권`;
  const note=document.getElementById('excFilterNote');
  if(note)note.textContent=[_excSpeaker,_excTag,q?`"${_excQuery.trim()}"`:''].filter(Boolean).join(' · ')+(list.length!==all.length?` · ${list.length}장`:'');
  el.innerHTML=list.length?list.map(({e,b},i)=>quoteCardHtml(e,b,true,i)).join(''):'<p class="hint" style="padding:12px">조건에 맞는 카드가 없어요.</p>';
}
