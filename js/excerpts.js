// ══════════════ 나의 서재 — 발췌함 ══════════════

const EXC_PAGE=30;
let _excSpeaker='',_excTag='',_excQuery='',_excBook='',_excSort='new',_excSeed=0,_boxPick=null,_excLimit=EXC_PAGE;
let _excView=(()=>{try{return localStorage.getItem('myLib_excView')==='list'?'list':'card';}catch(e){return'card';}})();
// 폰에서는 접어두고, 넓은 화면에서는 펼쳐둔다. 한번 열고 닫으면 그대로 기억한다
let _foldDraw=null,_foldFilter=null;

function openExcerptTag(tag){_excTag=tag;_excSpeaker='';_excQuery='';_excBook='';_excLimit=EXC_PAGE;switchPage('excerpts');}
function openExcerptBook(id){_excBook=id;_excTag='';_excSpeaker='';_excQuery='';_excLimit=EXC_PAGE;switchPage('excerpts');}
function setExcFilter(fn){fn();_excLimit=EXC_PAGE;renderExcerptBox();}

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
  _foldDraw=true;
  renderExcerptBox();
}

function pickExcBook(title){
  const t=String(title||'').trim();
  if(!t){setExcFilter(()=>{_excBook='';});return;}
  const b=books.find(x=>x.title===t&&(x.excerpts||[]).some(e=>e.text));
  if(b)setExcFilter(()=>{_excBook=b.id;});
}

function renderExcerptBox(){
  const c=document.getElementById('excerptsPage');
  if(!c) return;
  const all=allExcerpts();
  if(!all.length){
    c.innerHTML=`<div class="page-head"><h1 class="page-title">발췌함</h1></div><div class="empty"><div class="empty-ico">✍️</div><p>아직 발췌가 없어요. 도서 등록부의 "6. 발췌"에서 마음에 남은 문장을 카드로 남겨보세요.</p></div>`;
    return;
  }
  const wide=window.matchMedia('(min-width:700px)').matches;
  if(_foldDraw===null)_foldDraw=wide;
  if(_foldFilter===null)_foldFilter=wide||!!(_excSpeaker||_excTag||_excBook||_excQuery);
  if(_excBook&&!all.some(x=>x.b.id===_excBook))_excBook='';
  const scope=_excBook?all.filter(x=>x.b.id===_excBook):all;
  const spkCount={};scope.forEach(({e})=>{if(e.speaker)spkCount[e.speaker]=(spkCount[e.speaker]||0)+1;});
  const tagCount={};scope.forEach(({e})=>(e.tags||[]).forEach(t=>{tagCount[t]=(tagCount[t]||0)+1;}));
  const tagList=Object.entries(tagCount).sort((a,b)=>b[1]-a[1]);
  if(_excTag&&!tagCount[_excTag])_excTag='';
  if(_excSpeaker&&!spkCount[_excSpeaker])_excSpeaker='';

  const bookCount={};all.forEach(({b})=>{bookCount[b.id]=(bookCount[b.id]||0)+1;});
  const bookOpts=Object.keys(bookCount).map(id=>books.find(x=>x.id===id)).filter(Boolean).sort((a,b)=>a.title.localeCompare(b.title,'ko')).map(b=>`<option value="${escHtml(b.title)}">${bookCount[b.id]}장</option>`).join('');
  const curBook=_excBook?books.find(x=>x.id===_excBook):null;

  const speakerBtns=[`<button class="spk-btn${!_excSpeaker?' on':''}" aria-pressed="${!_excSpeaker}" onclick="setExcFilter(()=>{_excSpeaker=''})">전체 <small>${scope.length}</small></button>`,
    ...EXC_SPEAKERS.filter(s=>spkCount[s.v]).map(s=>`<button class="spk-btn spk-${s.v}${_excSpeaker===s.v?' on':''}" aria-pressed="${_excSpeaker===s.v}" onclick="setExcFilter(()=>{_excSpeaker=_excSpeaker==='${s.v}'?'':'${s.v}'})">${s.v} <small>${spkCount[s.v]}</small></button>`)].join('');
  const tagBtns=tagList.map(([t,n])=>`<button class="tag-btn${_excTag===t?' on':''}" aria-pressed="${_excTag===t}" data-tag="${encodeURIComponent(t)}" onclick="const t=decodeURIComponent(this.dataset.tag);setExcFilter(()=>{_excTag=_excTag===t?'':t})">${escHtml(t)} ${n}</button>`).join('');
  const sorts=[['new','최신순'],['ep','화수순'],['shuffle','섞기']].map(([v,l])=>`<button data-sort="${v}" class="${_excSort===v?'on':''}" aria-pressed="${_excSort===v}" onclick="_excSort='${v}';if('${v}'==='shuffle')_excSeed=Math.random();_excLimit=EXC_PAGE;renderExcList()">${l}</button>`).join('');
  const views=[['card','카드'],['list','목록']].map(([v,l])=>`<button data-view="${v}" class="${_excView===v?'on':''}" aria-pressed="${_excView===v}" onclick="setExcView('${v}')">${l}</button>`).join('');
  const activeNote=[curBook?curBook.title:'',_excSpeaker,_excTag,_excQuery.trim()?`"${_excQuery.trim()}"`:''].filter(Boolean).join(' · ');

  const d=drawnExcerpt();
  const drawn=d?`<div class="drawn"><figure class="index-card${d.e.speaker?' spk-'+escHtml(d.e.speaker):''}" style="border-top:4px solid var(--spk,var(--red))"><span class="tape" aria-hidden="true"></span><p class="hand" onclick="openDetail('${d.b.id}')">${escHtml(d.e.text)}</p><figcaption><button type="button" class="quote-src" onclick="openDetail('${d.b.id}')">${escHtml(d.b.title)}${d.e.location?' · '+escHtml(d.e.location):''}</button>${d.e.speaker?`<span class="q-speaker spk-${escHtml(d.e.speaker)}">${escHtml(d.e.speaker)}</span>`:''}</figcaption></figure></div>`:'';

  c.innerHTML=`<div class="page-head">
      <h1 class="page-title">발췌함<span class="page-count" id="excCount"></span></h1>
      <div class="exc-tools">
        <div class="seg" role="group" aria-label="정렬" id="excSort">${sorts}</div>
        <div class="seg" role="group" aria-label="보기 방식" id="excView">${views}</div>
      </div>
    </div>
    <div class="exc-layout">
      <div class="exc-side">
        <details class="fold"${_foldDraw?' open':''} ontoggle="_foldDraw=this.open">
          <summary class="fold-sum"><span class="sec-title">오늘 뽑은 카드</span></summary>
          <div class="fold-body">${drawn}${all.length>1?`<button class="btn primary" onclick="drawAnother()">한 장 더 뽑기</button>`:''}</div>
        </details>
        <details class="fold filter-box"${_foldFilter?' open':''} ontoggle="_foldFilter=this.open">
          <summary class="fold-sum"><span class="card-h">걸러 보기</span>${activeNote?`<span class="fold-note">${escHtml(activeNote)}</span>`:''}</summary>
          <div class="fold-body">
            <label style="display:flex;flex-direction:column;gap:4px"><span>책 고르기</span>
              <span class="book-pick">${curBook?`<span class="book-chip">${escHtml(curBook.title)}<button type="button" aria-label="책 고르기 지우기" onclick="setExcFilter(()=>{_excBook=''})">✕</button></span>`:`<input type="search" list="excBookList" placeholder="책 제목을 입력해 고르기" onchange="pickExcBook(this.value)">`}</span>
            </label>
            <datalist id="excBookList">${bookOpts}</datalist>
            <label style="display:flex;flex-direction:column;gap:4px"><span>검색</span><input type="search" placeholder="문장, 태그" value="${escHtml(_excQuery)}" oninput="_excQuery=this.value;_excLimit=EXC_PAGE;renderExcList()"></label>
            <div style="display:flex;flex-direction:column;gap:6px"><span class="filter-cap">화자</span><div class="filter-row">${speakerBtns}</div></div>
            ${tagBtns?`<div style="display:flex;flex-direction:column;gap:6px"><span class="filter-cap">내가 단 태그</span><div class="filter-row tag-scroll">${tagBtns}</div></div>`:''}
            ${activeNote?`<button type="button" class="link-btn" style="align-self:flex-start" onclick="setExcFilter(()=>{_excBook='';_excSpeaker='';_excTag='';_excQuery=''})">조건 모두 지우기</button>`:''}
          </div>
        </details>
      </div>
      <section class="exc-main">
        <div class="sec-head"><h2 class="sec-title">카드 상자</h2><span class="hint" id="excFilterNote"></span></div>
        <div class="card-box"><div id="excList"></div><div id="excMore"></div></div>
      </section>
    </div>
    <button type="button" class="top-btn" id="excTopBtn" hidden aria-label="맨 위로" onclick="window.scrollTo({top:0,behavior:'smooth'})">↑ 맨 위로</button>`;
  initExcTopBtn();
  renderExcList();
}

function setExcView(v){_excView=v;try{localStorage.setItem('myLib_excView',v);}catch(e){}renderExcList();}

function epNum(loc){const m=String(loc||'').match(/\d+/);return m?Number(m[0]):Infinity;}
function seeded(seed,i){const x=Math.sin(seed*9973+i*7919)*10000;return x-Math.floor(x);}

function excRowHtml(e,b,i){
  const spk=e.speaker?' spk-'+escHtml(e.speaker):'';
  return`<details class="exc-row${spk}"><summary><span class="exc-row-mark" aria-hidden="true"></span><span class="exc-row-text">${escHtml(e.text)}</span><span class="exc-row-src">${escHtml(b.title)}${e.location?' · '+escHtml(e.location):''}</span></summary><div class="exc-row-body">${quoteCardHtml(e,b,true,i)}</div></details>`;
}

function renderExcList(){
  const el=document.getElementById('excList');
  if(!el) return;
  document.querySelectorAll('#excSort button').forEach(btn=>{const on=btn.dataset.sort===_excSort;btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',on);});
  document.querySelectorAll('#excView button').forEach(btn=>{const on=btn.dataset.view===_excView;btn.classList.toggle('on',on);btn.setAttribute('aria-pressed',on);});
  const q=_excQuery.trim().toLowerCase();
  const all=allExcerpts();
  let list=all.filter(({e,b})=>(!_excBook||b.id===_excBook)&&(!_excSpeaker||e.speaker===_excSpeaker)&&(!_excTag||(e.tags||[]).includes(_excTag))&&(!q||[e.text,e.reason,e.location,b.title,b.author,...(e.tags||[])].join(' ').toLowerCase().includes(q)));
  if(_excSort==='ep')list=list.slice().sort((x,y)=>x.b.title.localeCompare(y.b.title,'ko')||epNum(x.e.location)-epNum(y.e.location));
  else if(_excSort==='shuffle')list=list.map((x,i)=>({x,k:seeded(_excSeed,i)})).sort((a,b)=>a.k-b.k).map(o=>o.x);
  const cnt=document.getElementById('excCount');
  if(cnt)cnt.textContent=`색인 카드 ${all.length}장 · 책 ${new Set(all.map(x=>x.b.id)).size}권`;
  const note=document.getElementById('excFilterNote');
  if(note)note.textContent=list.length!==all.length?`${list.length}장`:'';
  const shown=list.slice(0,_excLimit);
  el.className=_excView==='list'?'exc-rows':'quote-grid';
  el.innerHTML=shown.length?shown.map(({e,b},i)=>_excView==='list'?excRowHtml(e,b,i):quoteCardHtml(e,b,true,i)).join(''):'<p class="hint" style="padding:12px">조건에 맞는 카드가 없어요.</p>';
  const more=document.getElementById('excMore');
  if(more){
    const left=list.length-shown.length;
    more.innerHTML=left>0?`<button type="button" class="more-btn-wide" onclick="_excLimit+=EXC_PAGE;renderExcList()">${Math.min(EXC_PAGE,left)}장 더 보기 <small>· 남은 ${left}장</small></button>`:(list.length>EXC_PAGE?'<p class="hint" style="text-align:center;padding:10px 0 2px">마지막 카드예요.</p>':'');
  }
}

let _excTopReady=false;
function initExcTopBtn(){
  const update=()=>{const btn=document.getElementById('excTopBtn');if(btn)btn.hidden=window.scrollY<900||_currentPage!=='excerpts';};
  update();
  if(_excTopReady)return;_excTopReady=true;
  window.addEventListener('scroll',update,{passive:true});
}
