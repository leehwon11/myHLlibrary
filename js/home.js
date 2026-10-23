// ══════════════ 나의 서재 — 홈 ══════════════

let _excShift=0;

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
  const streak=calcStreaks().currentStreak;
  const libName=localStorage.getItem('myLib_libName')||'나의 서재';
  const photo=safeUrl(p.photo);
  const avatar=photo?`<img src="${escHtml(photo)}" alt="">`:escHtml((p.name||libName).trim().charAt(0)||'책');
  const tags=profileTags(p).map(t=>`<span class="chip">${escHtml(t)}</span>`).join('');

  let h=`<section class="home-hero">
    <div class="card profile-card">
      <div class="avatar">${avatar}</div>
      <div class="profile-info">
        <div class="profile-name">${escHtml(p.name||libName)}<button class="edit-mini" onclick="openProfile()">편집</button></div>
        <div class="profile-sub">올해 ${doneYear}권 완독${streak?` · ${streak}일 연속 독서 중`:''}</div>
        ${p.intro?`<div class="profile-intro">${escHtml(p.intro)}</div>`:(p.name?'':`<div class="profile-intro">편집을 눌러 이름, 사진, 한 줄 소개를 넣어보세요.</div>`)}
        ${tags?`<div class="profile-tags">${tags}</div>`:''}
      </div>
    </div>
    ${todayExcerptHtml()}
  </section>`;

  if(!books.length){
    h+=`<section class="card" style="align-items:flex-start"><div class="card-h">서재가 비어 있어요</div><p class="hint">첫 책을 추가하면 홈에 읽는 중인 책과 최근 완독한 책이 보여요.</p><button class="btn primary" onclick="openAdd()">+ 책 추가</button></section>`;
    c.innerHTML=h;return;
  }

  const reading=books.filter(b=>b.status==='읽는중').sort((a,b)=>(b.datestart||'').localeCompare(a.datestart||''));
  if(reading.length){
    h+=`<section class="sec"><div class="sec-head"><h2 class="sec-title">지금 읽는 중</h2>${reading.length>4?`<button class="link-btn" onclick="goShelf('읽는중')">${reading.length}권 모두 보기</button>`:''}</div><div class="reading-grid">${reading.slice(0,4).map(b=>{
      const ml=(Array.isArray(b.ml)?b.ml:[]).flatMap(m=>m.typeTags||[]).slice(0,2);
      const meta=[...(b.genre||[]).slice(0,1),...ml].map(escHtml).join(' · ');
      const [y,m,d]=(b.datestart||'').split('-');
      return`<div class="card reading-card" onclick="openDetail('${b.id}')">${coverHtml(b)}<div class="rc-info"><div class="rc-title">${escHtml(b.title)}</div>${meta?`<div class="rc-meta">${meta}</div>`:''}<div class="rc-since">${b.datestart?`${Number(m)}월 ${Number(d)}일부터 읽는 중`:'읽는 중'}</div></div></div>`;
    }).join('')}</div></section>`;
  }

  const done=books.filter(b=>b.status==='완독').sort((a,b)=>(b.dateend||b.createdAt||'').localeCompare(a.dateend||a.createdAt||''));
  if(done.length) h+=shelfSection('최근 완독',done,'완독','책장 전체 보기');
  const wish=books.filter(b=>b.status==='읽고싶어요').sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  if(wish.length) h+=shelfSection('읽고 싶어요',wish,'읽고싶어요',`${wish.length}권 모두 보기`);

  c.innerHTML=h;
}

function shelfSection(title,list,status,more){
  return`<section class="sec"><div class="sec-head"><h2 class="sec-title">${title}</h2><button class="link-btn" onclick="goShelf('${status}')">${more}</button></div><div class="shelf-row">${list.slice(0,6).map(b=>renderCard(b,'')).join('')}</div></section>`;
}

function todayExcerptHtml(){
  const ex=allExcerpts();
  if(!ex.length) return`<div class="ink-card today-exc"><div class="today-exc-top"><span class="today-exc-label">오늘의 발췌</span></div><p class="today-exc-text" style="cursor:default">마음에 남은 문장을 발췌로 남겨두면, 매일 하나씩 여기에 보여드려요.</p></div>`;
  const seed=Number(localDate().replace(/-/g,''));
  const {e,b}=ex[(seed+_excShift)%ex.length];
  const chips=[e.speaker?`<span class="chip chip-ink">${escHtml(e.speaker)}</span>`:'',...(e.tags||[]).slice(0,3).map(t=>`<span class="chip chip-ink">${escHtml(t)}</span>`)].join('');
  return`<div class="ink-card today-exc">
    <div class="today-exc-top"><span class="today-exc-label">오늘의 발췌</span>${chips}</div>
    <p class="today-exc-text" onclick="openDetail('${b.id}')">${escHtml(e.text)}</p>
    <div class="today-exc-src"><span>「${escHtml(b.title)}」${e.location?' '+escHtml(e.location):''}</span>${ex.length>1?`<button class="ink-btn" onclick="_excShift++;renderHome()">다른 발췌</button>`:''}</div>
  </div>`;
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
