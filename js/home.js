// ══════════════ 나의 서재 — 홈 ══════════════

let _excPick=null;

function allExcerpts(){
  return books.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
    .flatMap(b=>(b.excerpts||[]).filter(e=>e.text).map(e=>({e,b})));
}

function profileTags(p){return(p.tags||[]).filter(Boolean);}

function renderHome(){
  const c=document.getElementById('homeContent');
  if(!c) return;
  const p=appSettings.profile||{};
  const year=new Date().getFullYear();
  const doneYear=books.filter(b=>b.status==='완독'&&b.dateend&&b.dateend.startsWith(String(year))).length;
  const st=calcStreaks();
  const libName=getLibName();
  const photo=safeUrl(p.photo);
  const avatar=photo?`<img src="${escHtml(photo)}" alt="">`:escHtml((p.name||libName).trim().charAt(0)||'책');
  const tags=profileTags(p).map(t=>`<span class="chip">${escHtml(t)}</span>`).join('');
  const cnt=s=>books.filter(b=>b.status===s).length;
  const goal=appSettings.yearlyGoal||0;

  if(!books.length){
    c.innerHTML=`<section class="card" style="align-items:flex-start"><div class="card-h">서재가 비어 있어요</div><p class="hint">첫 책을 등록하면 여기에 읽는 중인 책, 다음에 읽을 책, 다 읽은 책이 정리돼요.</p><button class="btn primary owner-only" onclick="openAdd()">＋ 새 책 등록</button></section>`;
    return;
  }

  const reading=books.filter(b=>b.status==='읽는중').sort((a,b)=>(b.datestart||'').localeCompare(a.datestart||''));
  const wish=books.filter(b=>b.status==='읽고싶어요').sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const done=books.filter(b=>b.status==='완독').sort((a,b)=>(b.dateend||b.createdAt||'').localeCompare(a.dateend||a.createdAt||''));

  const nowCard=b=>{
    const [y,m,d]=(b.datestart||'').split('-');
    const days=b.datestart?daysBetween(b.datestart,localDate()):0;
    return`<div class="now-card" role="link" tabindex="0" onclick="openDetail('${b.id}')" onkeydown="if(event.key==='Enter')openDetail('${b.id}')">${coverHtml(b)}<div class="now-info"><span class="now-call">${escHtml(callNumber(b))}</span><span class="now-title">${escHtml(b.title)}</span><span class="now-meta">${escHtml(b.author||'작가 미상')}${b.platform?' · '+escHtml(b.platform):''}</span><span class="now-since">${b.datestart?`${y}. ${m}. ${d}. 대출${days?` · ${days}일째`:''}`:'읽는 중'}</span></div><span class="stamp st-읽는중">대출 중</span></div>`;
  };
  const row=(b,i,side,stamp)=>`<div class="ledger-row" role="link" tabindex="0" onclick="openDetail('${b.id}')" onkeydown="if(event.key==='Enter')openDetail('${b.id}')">${i!=null?`<span class="ledger-no">${String(i+1).padStart(2,'0')}</span>`:''}<span class="ledger-main"><span class="ledger-title">${escHtml(b.title)}</span><span class="ledger-sub">${escHtml(b.author||'작가 미상')}${b.rating?` · <span style="color:var(--star)">${'★'.repeat(b.rating)}</span>`:''}</span></span>${stamp||`<span class="ledger-side">${side||''}</span>`}</div>`;

  let main=`<section class="sec"><div class="sec-head"><h2 class="sec-title">지금 읽는 책<small>대출 중 ${reading.length}</small></h2>${reading.length>3?`<button class="link-btn" onclick="goShelf('읽는중')">모두 보기</button>`:''}</div>`;
  main+=reading.length?`<div style="display:flex;flex-direction:column;gap:12px">${reading.slice(0,3).map(nowCard).join('')}</div>`:`<div class="empty" style="padding:28px 20px">지금 읽는 책이 없어요.${wish.length?' 다음에 읽을 책에서 골라보세요.':''}</div>`;
  if(!VIEW_MODE)main+=`<div class="stamp-row">${readTodayBtn(st.dateSet.has(localDate()),'stamp-btn')}<div class="streak-box"><b>${st.currentStreak}일</b><span>연속 열람</span></div></div>`;
  main+=`</section>`;
  if(wish.length)main+=`<section class="sec"><div class="sec-head"><h2 class="sec-title">다음에 읽을 책<small>예약 ${wish.length}</small></h2><button class="link-btn" onclick="goShelf('읽고싶어요')">전체 보기</button></div><div class="ledger-list">${wish.slice(0,5).map((b,i)=>row(b,i,`${fmtMD(String(b.createdAt||'').slice(0,10)).slice(5)} 예약`)).join('')}</div></section>`;
  if(done.length)main+=`<section class="sec"><div class="sec-head"><h2 class="sec-title">최근 다 읽은 책<small>반납 ${done.length}</small></h2><button class="link-btn" onclick="goShelf('완독')">전체 보기</button></div><div class="ledger-list">${done.slice(0,5).map(b=>row(b,null,'',`<span class="stamp st-완독">${b.dateend?fmtMD(b.dateend).slice(5)+' ':''}완독</span>`)).join('')}</div></section>`;

  const side=`<section class="library-card" aria-label="열람증">
      <div class="library-card-head"><b>열 람 증</b><button class="edit-mini owner-only" onclick="openProfile()">편집</button></div>
      <div class="library-card-body"><div class="avatar">${avatar}</div><div class="profile-info">
        <div class="profile-name">${escHtml(p.name||libName)}</div>
        <div class="profile-sub">올해 ${doneYear}권 완독${st.currentStreak?` · ${st.currentStreak}일 연속`:''}</div>
        ${p.intro?`<div class="profile-intro">${escHtml(p.intro)}</div>`:(p.name||VIEW_MODE?'':`<div class="hint">편집을 눌러 이름, 사진, 한 줄 소개를 넣어보세요.</div>`)}
        ${tags?`<div class="profile-tags">${tags}</div>`:''}
      </div></div>
    </section>
    <section class="sec">${todayExcerptHtml()}</section>
    <section class="sec"><h2 class="sec-title">올해 열람 현황</h2>
      <table class="year-table"><thead><tr><th scope="col">읽는 중</th><th scope="col">완독</th><th scope="col">읽고 싶어요</th><th scope="col">하차</th></tr></thead><tbody><tr><td onclick="goShelf('읽는중')">${cnt('읽는중')}</td><td onclick="goShelf('완독')">${cnt('완독')}</td><td onclick="goShelf('읽고싶어요')">${cnt('읽고싶어요')}</td><td onclick="goShelf('하차')">${cnt('하차')}</td></tr></tbody></table>
      <div class="goal-strip"><span>올해 목표</span><span><b>${doneYear}</b> / ${goal?goal+'권':'—'}</span></div>
    </section>`;
  c.innerHTML=`<div class="home-grid"><div class="home-main">${main}</div><div class="home-side">${side}</div></div>`;
}

function shelfSection(title,list,status,more){
  return`<section class="sec"><div class="sec-head"><h2 class="sec-title">${title}</h2><button class="link-btn" onclick="goShelf('${status}')">${more}</button></div><div class="shelf-row">${list.slice(0,6).map(b=>renderCard(b,'')).join('')}</div></section>`;
}

function hashStr(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}

// 발췌가 많은 책이 자주 나오지 않도록 책을 먼저 고르고, 그 책 안에서 발췌를 고른다
function pickExcerpt(){
  const groups=books.map(b=>({b,exc:(b.excerpts||[]).filter(e=>e.text)})).filter(g=>g.exc.length);
  if(!groups.length) return null;
  if(_excPick){
    const g=groups.find(x=>x.b.id===_excPick.bookId);
    if(g&&g.exc[_excPick.idx]) return{b:g.b,e:g.exc[_excPick.idx],groups};
  }
  const day=localDate();
  const g=groups[hashStr(day)%groups.length];
  return{b:g.b,e:g.exc[hashStr(day+'|'+g.b.id)%g.exc.length],groups};
}

function nextExcerpt(currentId){
  const groups=books.map(b=>({b,exc:(b.excerpts||[]).filter(e=>e.text)})).filter(g=>g.exc.length);
  const others=groups.filter(g=>g.b.id!==currentId);
  const pool=others.length?others:groups;
  const g=pool[Math.floor(Math.random()*pool.length)];
  _excPick={bookId:g.b.id,idx:Math.floor(Math.random()*g.exc.length)};
  renderHome();
}

function todayExcerptHtml(){
  const head=more=>`<div class="sec-head"><h2 class="sec-title">오늘의 발췌</h2>${more||''}</div>`;
  const pick=pickExcerpt();
  if(!pick) return head()+`<figure class="index-card"><p class="hand" style="cursor:default">마음에 남은 문장을 발췌로 남겨두면, 매일 한 장씩 여기에 꽂아둘게요.</p></figure>`;
  const {e,b,groups}=pick;
  const total=groups.reduce((s,g)=>s+g.exc.length,0);
  const more=total>1?`<button class="link-btn" onclick="nextExcerpt('${b.id}')">다른 발췌</button>`:'';
  return head(more)+`<figure class="index-card${e.speaker?' spk-'+escHtml(e.speaker):''}" style="border-top-color:var(--spk,var(--red))"><p class="hand" onclick="openDetail('${b.id}')">${escHtml(e.text)}</p><figcaption><span>${escHtml(b.title)}${e.location?' · '+escHtml(e.location):''}</span>${e.speaker?`<span class="q-speaker spk-${escHtml(e.speaker)}">${escHtml(e.speaker)}</span>`:''}</figcaption></figure>`;
}

// ── 프로필 ──
function openProfile(){
  const p=appSettings.profile||{};
  document.getElementById('pf-name').value=p.name||'';
  document.getElementById('pf-photo').value=p.photo||'';
  document.getElementById('pf-intro').value=p.intro||'';
  document.getElementById('pf-tags').value=profileTags(p).join(' ');
  document.getElementById('profileOv').classList.add('open');
  autosizeEl(document.getElementById('pf-intro'));
}
function closeProfile(){document.getElementById('profileOv').classList.remove('open');}
function saveProfile(){
  const tags=document.getElementById('pf-tags').value.split(/[\s,]+/).map(t=>t.trim()).filter(Boolean).map(t=>t.startsWith('#')?t:'#'+t);
  appSettings.profile={
    name:document.getElementById('pf-name').value.trim(),
    photo:document.getElementById('pf-photo').value.trim(),
    intro:document.getElementById('pf-intro').value.trim(),
    tags:[...new Set(tags)].slice(0,6)
  };
  saveData();
  closeProfile();
  renderHome();
  showToast('프로필을 저장했어요!');
}
