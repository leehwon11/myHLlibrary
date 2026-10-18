// ══════════════ 나의 서재 — Library (Book CRUD, Render, Ridi) ══════════════

let _editingId=null;
let _mlData=[];
let _flTypeTagsData=[];
let _excerptsData=[];
let _rereadsData=[];
const STICKER_COLORS=['sticker-pink','sticker-mint','sticker-lavender','sticker-yellow'];

function getStatusClass(s){
  if(s==='완독') return 'washi-done';
  if(s==='읽는중') return 'washi-reading';
  return 'washi-wish';
}

function highlightText(text,query){
  if(!query) return escHtml(text);
  const safe=escHtml(text);
  const q=query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return safe.replace(new RegExp(`(${q})`,'gi'),'<mark class="search-hl">$1</mark>');
}

function renderBooks(){
  const grid=document.getElementById('bookGrid');
  if(!grid) return;
  const query=(document.getElementById('searchInput')?.value||'').trim().toLowerCase();
  const activePills=[...document.querySelectorAll('.filter-pill.active')].map(p=>p.dataset.filter);
  const showAll=activePills.includes('all')||activePills.length===0;
  const sort=document.getElementById('sortSelect')?.value||'newest';

  let list=books.filter(b=>{
    if(query){
      const hay=[b.title,b.author,b.memo,b.summary,b.review,...(b.genres||[]),...(b.sojai||[]),...(b.rel||[])].join(' ').toLowerCase();
      if(!hay.includes(query)) return false;
    }
    if(showAll) return true;
    if(activePills.includes('fav')&&b.fav) return true;
    if(activePills.includes(b.status)) return true;
    return false;
  });

  list.sort((a,b)=>{
    switch(sort){
      case 'oldest': return (a.createdAt||0)-(b.createdAt||0);
      case 'title': return (a.title||'').localeCompare(b.title||'','ko');
      case 'author': return (a.author||'').localeCompare(b.author||'','ko');
      case 'rating': return (b.rating||0)-(a.rating||0);
      default: return (b.createdAt||0)-(a.createdAt||0);
    }
  });

  if(!list.length){
    grid.innerHTML=`<div class="empty-state"><div class="empty-icon">📖</div><p>${query?'검색 결과가 없어요':'아직 기록이 없어요. 첫 이야기를 적어볼까요?'}</p></div>`;
    return;
  }

  grid.innerHTML=list.map(b=>{
    const gc=(b.genres||[]).length?getGenreColor(b.genres[0]):'#808080';
    const stars='★'.repeat(b.rating||0)+'<span class="off">'+'★'.repeat(5-(b.rating||0))+'</span>';
    const dateStr=b.dateEnd||b.dateStart||'';
    const coverHtml=b.cover?`<img src="${escHtml(b.cover)}" alt="" loading="lazy">`:'📖';
    const allTags=[...(b.sojai||[]),...(b.rel||[])];
    const stickers=allTags.slice(0,5).map((t,i)=>`<span class="sticker ${STICKER_COLORS[i%4]}">${escHtml(t)}</span>`).join('');
    const titleHtml=query?highlightText(b.title,query):escHtml(b.title);
    const authorHtml=query?highlightText(b.author||'',query):escHtml(b.author||'');
    return `<div class="diary-entry" onclick="openDetail('${b.id}')">
      <button class="entry-fav${b.fav?' on':''}" onclick="event.stopPropagation();toggleFav('${b.id}')">♥</button>
      <div class="washi ${getStatusClass(b.status)}"></div>
      ${dateStr?`<div class="entry-date">${escHtml(dateStr)}</div>`:''}
      <div class="entry-cover">${coverHtml}</div>
      <div class="entry-title">${titleHtml}</div>
      <div class="entry-author">${authorHtml}</div>
      ${(b.rating||0)?`<div class="entry-stars">${stars}</div>`:''}
      ${(b.genres||[]).length?`<span class="entry-genre" style="background:${hexToRgba(gc,.15)};color:${gc}">${escHtml(b.genres[0])}</span>`:''}
      ${stickers?`<div class="sticker-row">${stickers}</div>`:''}
    </div>`;
  }).join('');
}

// ══════════════ Detail View ══════════════
function openDetail(id){
  const b=books.find(x=>x.id===id);
  if(!b) return;
  const body=document.getElementById('detailBody');
  if(!body) return;
  const gc=(b.genres||[]).length?getGenreColor(b.genres[0]):'#808080';
  const stars='★'.repeat(b.rating||0)+'<span style="color:var(--ink-faint)">'+'★'.repeat(5-(b.rating||0))+'</span>';
  const coverHtml=b.cover?`<img src="${escHtml(b.cover)}" alt="">`:'<span style="font-size:48px">📖</span>';

  const statusColors={'완독':'var(--mint-bg)','읽는중':'var(--yellow-bg)','읽고싶어요':'var(--lavender-bg)'};
  const statusTextColors={'완독':'var(--green)','읽는중':'var(--amber)','읽고싶어요':'var(--lavender)'};

  const allTags=[...(b.sojai||[]),...(b.rel||[])];
  const tagHtml=allTags.map((t,i)=>`<span class="sticker ${STICKER_COLORS[i%4]}">${escHtml(t)}</span>`).join('');

  let metaChips='';
  if(b.booktype) metaChips+=`<span class="det-chip">${escHtml(b.booktype)}</span>`;
  if(b.platform) metaChips+=`<span class="det-chip">${escHtml(b.platform)}</span>`;
  if(b.agerating) metaChips+=`<span class="det-chip">${escHtml(b.agerating)}</span>`;
  if(b.price) metaChips+=`<span class="det-chip">${Number(b.price).toLocaleString()}원</span>`;

  let datesHtml='';
  if(b.dateStart||b.dateEnd||b.datebuy){
    let parts=[];
    if(b.dateStart||b.dateEnd) parts.push(`독서 기간: ${escHtml(b.dateStart||'?')} ~ ${escHtml(b.dateEnd||'?')}`);
    if(b.datebuy) parts.push(`구매일: ${escHtml(b.datebuy)}`);
    datesHtml=`<div class="det-section"><div class="det-section-title">날짜</div><div style="font-size:13px;color:var(--ink-light);line-height:1.8">${parts.join('<br>')}</div></div>`;
  }

  // 남주/여주 캐릭터 카드
  let charHtml='';
  const mlArr=Array.isArray(b.ml)?b.ml:(b.ml&&b.ml.name?[b.ml]:[]);
  const fl=b.fl&&typeof b.fl==='object'?b.fl:null;
  if(mlArr.length||fl){
    let cards='';
    mlArr.forEach(m=>{
      const typeTags=(m.typeTags||[]).map(t=>`<span class="det-char-tag">${escHtml(t)}</span>`).join('');
      cards+=`<div class="det-char-card ml">
        <div class="det-char-label">💙 ${m.sub?'서브남':'남주'}</div>
        <div class="det-char-name">${escHtml(m.name||'이름 미입력')}</div>
        ${m.age?`<div class="det-char-age">${escHtml(m.age)}</div>`:''}
        ${typeTags?`<div class="det-char-tags">${typeTags}</div>`:''}
        ${m.intro?`<p class="det-char-intro">${escHtml(m.intro)}</p>`:''}
      </div>`;
    });
    if(fl&&fl.name){
      const flTags=(fl.typeTags||b.flTypeTags||[]).map(t=>`<span class="det-char-tag">${escHtml(t)}</span>`).join('');
      cards+=`<div class="det-char-card fl">
        <div class="det-char-label">🩷 여주</div>
        <div class="det-char-name">${escHtml(fl.name)}</div>
        ${fl.age?`<div class="det-char-age">${escHtml(fl.age)}</div>`:''}
        ${flTags?`<div class="det-char-tags">${flTags}</div>`:''}
        ${fl.intro?`<p class="det-char-intro">${escHtml(fl.intro)}</p>`:''}
      </div>`;
    }
    charHtml=`<div class="det-section"><div class="det-section-title">주인공 정보</div><div class="det-char-grid">${cards}</div></div>`;
  }

  let summaryHtml=b.summary?`<div class="det-section"><div class="det-section-title">줄거리</div><div class="det-text" style="white-space:pre-wrap">${escHtml(b.summary)}</div></div>`:'';
  let reviewHtml=b.review?`<div class="det-section"><div class="det-section-title">총평</div><div class="det-text" style="white-space:pre-wrap">${escHtml(b.review)}</div></div>`:'';
  let memoHtml=b.memo?`<div class="det-section"><div class="det-section-title">메모</div><div class="det-text det-memo">${escHtml(b.memo)}</div></div>`:'';

  let excerptHtml='';
  const excerpts=b.excerpts||[];
  if(excerpts.length){
    const items=excerpts.map((e,i)=>{
      const ex=typeof e==='string'?{text:e}:e;
      return `<div class="det-excerpt">
        <div class="det-excerpt-label">발췌 ${i+1}</div>
        ${ex.location?`<div class="det-excerpt-loc">📍 ${escHtml(ex.location)}</div>`:''}
        <div class="det-excerpt-text">"${escHtml(ex.text||'')}"</div>
        ${ex.reason?`<div class="det-excerpt-reason">💭 ${escHtml(ex.reason)}</div>`:''}
      </div>`;
    }).join('');
    excerptHtml=`<div class="det-section"><div class="det-section-title">발췌</div>${items}</div>`;
  } else if(b.excerpt){
    excerptHtml=`<div class="det-section"><div class="det-section-title">인상 깊은 구절</div><div class="det-text" style="font-style:italic">"${escHtml(b.excerpt)}"</div></div>`;
  }

  let rereadHtml='';
  const rereads=b.rereads||[];
  if(rereads.length){
    const items=rereads.map(r=>`<div class="det-reread-item"><span class="det-reread-num">제${r.nth||1}회독</span><span style="color:var(--ink-light)">${escHtml(r.date||'')}</span>${r.note?`<span style="font-size:12px;color:var(--ink-muted)">${escHtml(r.note)}</span>`:''}</div>`).join('');
    rereadHtml=`<div class="det-section"><div class="det-section-title">재독 기록</div>${items}</div>`;
  }

  const platformLink=b.platformurl||b.url;

  body.innerHTML=`
    <div class="det-header">
      <div class="det-cover">${coverHtml}</div>
      <div class="det-info">
        <div class="det-title">${escHtml(b.title)}</div>
        <div class="det-author">${escHtml(b.author||'')}</div>
        <div class="det-stars">${stars}</div>
        <div class="det-meta">
          <span class="entry-genre" style="background:${statusColors[b.status]||'var(--ink-faint)'};color:${statusTextColors[b.status]||'var(--ink-muted)'};padding:3px 10px">${escHtml(b.status||'')}</span>
          ${(b.genres||[]).map(g=>{const c=getGenreColor(g);return `<span class="entry-genre" style="background:${hexToRgba(c,.15)};color:${c}">${escHtml(g)}</span>`;}).join('')}
        </div>
        ${metaChips?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">${metaChips}</div>`:''}
        ${b.fav?'<div style="font-size:14px;color:#e74c5e;margin-top:4px">♥ 즐겨찾기</div>':''}
        ${platformLink?`<a href="${escHtml(platformLink)}" target="_blank" rel="noopener" style="font-size:12px;color:var(--blue);text-decoration:underline;display:inline-block;margin-top:4px">🔗 원본 링크</a>`:''}
      </div>
    </div>
    ${tagHtml?`<div class="sticker-row" style="margin-bottom:12px">${tagHtml}</div>`:''}
    ${charHtml}${summaryHtml}${datesHtml}${reviewHtml}${memoHtml}${excerptHtml}${rereadHtml}
  `;

  document.getElementById('detailEdit').onclick=()=>{closeModal('ov-detail');openEditModal(b);};
  document.getElementById('detailDelete').onclick=()=>{closeModal('ov-detail');deleteBook(b.id);};
  openModal('ov-detail');
}

function toggleFav(id){
  const b=books.find(x=>x.id===id);
  if(!b) return;
  b.fav=!b.fav;
  saveData();
  renderBooks();
}

function deleteBook(id){
  showConfirm('이 기록을 삭제할까요?',()=>{
    books=books.filter(b=>b.id!==id);
    saveData();
    renderBooks();
    updateBookCount();
    showToast('삭제했어요');
  });
}

// ══════════════ Edit Form ══════════════
function openEditModal(book){
  _editingId=book?book.id:null;
  const isNew=!book;
  const b=book||{genres:[],sojai:[],rel:[],rating:0,status:'읽고싶어요',ml:[],fl:{},excerpts:[],rereads:[],flTypeTags:[]};
  document.getElementById('editModalTitle').textContent=isNew?'새 기록':'기록 수정';
  document.getElementById('editDelete').hidden=isNew;
  if(!isNew) document.getElementById('editDelete').onclick=()=>{closeModal('ov-edit');deleteBook(b.id);};

  _mlData=Array.isArray(b.ml)?b.ml.map(m=>({...m,typeTags:m.typeTags||[]})):(b.ml&&b.ml.name?[{...b.ml,typeTags:b.ml.typeTags||[]}]:[]);
  _flTypeTagsData=[...(b.flTypeTags||[]),...(b.fl&&b.fl.typeTags?b.fl.typeTags:[])].filter((v,i,a)=>a.indexOf(v)===i);
  _excerptsData=Array.isArray(b.excerpts)?b.excerpts.map(e=>typeof e==='string'?{text:e,location:'',reason:''}:{...e}):[];
  _rereadsData=Array.isArray(b.rereads)?b.rereads.map(r=>({...r})):[];

  const body=document.getElementById('editModalBody');
  body.innerHTML=buildEditForm(b);
  initEditForm(b);
  openModal('ov-edit');
}

function buildEditForm(b){
  const genreChecks=DEFAULT_GENRES.map(g=>{
    const checked=(b.genres||[]).includes(g.name)?'checked':'';
    return `<label style="display:inline-flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;margin-right:8px;margin-bottom:4px"><input type="checkbox" class="edit-genre-cb" value="${escHtml(g.name)}" ${checked}><span class="sticker" style="background:${hexToRgba(g.color,.15)};color:${g.color};font-size:13px;padding:1px 6px;border-radius:6px">${escHtml(g.name)}</span></label>`;
  }).join('');

  const fl=b.fl&&typeof b.fl==='object'?b.fl:{};

  return `
  <div class="form-grid">
    <div class="form-col">
      <div class="cover-box" id="coverPreview">
        ${b.cover?`<img src="${escHtml(b.cover)}" alt="">`:
        `<div class="cover-hint"><span class="ci">📷</span>표지 이미지</div>`}
      </div>
      <div class="cover-url-row">
        <input type="url" id="editCoverUrl" placeholder="이미지 URL" value="${escHtml(b.cover||'')}">
        <button type="button" class="btn btn-sm" onclick="applyCoverUrl()">적용</button>
      </div>
    </div>
    <div class="form-col">
      <div class="fg"><label>제목</label><input type="text" id="editTitle" value="${escHtml(b.title||'')}" placeholder="책 제목"></div>
      <div class="fg"><label>작가</label><input type="text" id="editAuthor" value="${escHtml(b.author||'')}" placeholder="작가명"></div>

      <div class="fg"><label>상태</label>
        <div class="status-selector" id="editStatusWrap">
          <button type="button" class="status-opt${b.status==='완독'?' sel-on':''}" data-status="완독">완독</button>
          <button type="button" class="status-opt${b.status==='읽는중'?' sel-on':''}" data-status="읽는중">읽는중</button>
          <button type="button" class="status-opt${b.status==='읽고싶어요'?' sel-on':''}" data-status="읽고싶어요">읽고싶어요</button>
        </div>
      </div>

      <div class="fg"><label>별점</label>
        <div class="star-row" id="editStarRow">
          ${[1,2,3,4,5].map(n=>`<button type="button" class="sr-btn${n<=(b.rating||0)?' on':''}" data-star="${n}">★</button>`).join('')}
          <span class="star-label-text" id="editStarLabel">${STAR_LABELS[b.rating||0]||''}</span>
        </div>
      </div>

      <div class="fg"><label>장르</label><div style="line-height:1.8">${genreChecks}</div></div>

      <div class="row2">
        <div class="fg"><label>작품 유형</label>
          <select id="editBooktype"><option value="">선택 안함</option>${['단행본','장편소설','단편소설','시리즈','웹소설'].map(t=>`<option value="${escHtml(t)}"${b.booktype===t?' selected':''}>${escHtml(t)}</option>`).join('')}</select>
        </div>
        <div class="fg"><label>연령 등급</label>
          <select id="editAgerating"><option value="">선택 안함</option>${['전체 이용가','15세 이용가','19세 이용가'].map(t=>`<option value="${escHtml(t)}"${b.agerating===t?' selected':''}>${escHtml(t)}</option>`).join('')}</select>
        </div>
      </div>

      <div class="row2">
        <div class="fg"><label>플랫폼</label><input type="text" id="editPlatform" value="${escHtml(b.platform||'')}" placeholder="리디, 시리즈 등"></div>
        <div class="fg"><label>가격</label><input type="number" id="editPrice" value="${b.price||''}" placeholder="0" min="0"></div>
      </div>

      <div class="row2">
        <div class="fg"><label>시작일</label><input type="date" id="editDateStart" value="${escHtml(b.dateStart||'')}"></div>
        <div class="fg"><label>완독일</label><input type="date" id="editDateEnd" value="${escHtml(b.dateEnd||'')}"></div>
      </div>
      <div class="fg"><label>구매일</label><input type="date" id="editDatebuy" value="${escHtml(b.datebuy||'')}" style="width:200px"></div>

      <div class="sec-label">소재 태그</div>
      <div class="tag-input-wrap" id="sojaiTagWrap"></div>
      <div class="quick-tags" id="sojaiQuick"></div>

      <div class="sec-label">관계 태그</div>
      <div class="tag-input-wrap" id="relTagWrap"></div>
      <div class="quick-tags" id="relQuick"></div>

      <div class="sec-label">💙 남주 정보</div>
      <div id="mlAccordion"></div>
      <button type="button" class="btn btn-sm" onclick="addMlEntry()" style="margin-top:8px">💙 남주 추가</button>

      <div class="sec-label">🩷 여주 정보</div>
      <div class="char-form-block">
        <div class="row2">
          <div class="fg"><label>이름</label><input type="text" id="editFlName" value="${escHtml(fl.name||'')}" placeholder="여주 이름"></div>
          <div class="fg"><label>나이</label><input type="text" id="editFlAge" value="${escHtml(fl.age||'')}" placeholder="나이"></div>
        </div>
        <div class="fg"><label>소개</label><textarea id="editFlIntro" rows="2" placeholder="여주 소개...">${escHtml(fl.intro||'')}</textarea></div>
        <div class="sec-label" style="font-size:12px">여주 유형 태그</div>
        <div class="tag-input-wrap" id="flTypeTagWrap"></div>
        <div class="quick-tags" id="flTypeQuick"></div>
      </div>

      <div class="fg"><label>플랫폼 URL</label><input type="url" id="editPlatformUrl" value="${escHtml(b.platformurl||b.url||'')}" placeholder="원본 링크 (선택)"></div>
      <div class="fg"><label>줄거리</label><textarea id="editSummary" rows="3" placeholder="간략한 줄거리...">${escHtml(b.summary||'')}</textarea></div>
      <div class="fg"><label>총평</label><textarea id="editReview" rows="3" placeholder="총평, 감상...">${escHtml(b.review||'')}</textarea></div>
      <div class="fg"><label>메모</label><textarea id="editMemo" rows="2" placeholder="비공개 메모...">${escHtml(b.memo||'')}</textarea></div>

      <div class="sec-label">발췌</div>
      <div id="excerptsWrap"></div>
      <button type="button" class="btn btn-sm" onclick="addExcerpt()" style="margin-top:8px">📝 발췌 추가</button>

      <div class="sec-label">재독 기록</div>
      <div id="rereadsWrap"></div>
      <button type="button" class="btn btn-sm" onclick="addReread()" style="margin-top:8px">🔄 재독 추가</button>
    </div>
  </div>`;
}

function initEditForm(b){
  document.querySelectorAll('#editStatusWrap .status-opt').forEach(btn=>{
    btn.addEventListener('click',()=>{
      document.querySelectorAll('#editStatusWrap .status-opt').forEach(x=>x.classList.remove('sel-on'));
      btn.classList.add('sel-on');
    });
  });

  document.querySelectorAll('#editStarRow .sr-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const val=parseInt(btn.dataset.star);
      const current=[...document.querySelectorAll('#editStarRow .sr-btn.on')].length;
      const newVal=val===current?0:val;
      document.querySelectorAll('#editStarRow .sr-btn').forEach(x=>{
        x.classList.toggle('on',parseInt(x.dataset.star)<=newVal);
      });
      document.getElementById('editStarLabel').textContent=STAR_LABELS[newVal]||'';
    });
  });

  initTagWrap('sojaiTagWrap','sojaiQuick',RIDI_SOJAI,b.sojai||[]);
  initTagWrap('relTagWrap','relQuick',RIDI_REL,b.rel||[]);
  initTagWrap('flTypeTagWrap','flTypeQuick',RIDI_FL_TYPES.map(t=>'#'+t),_flTypeTagsData);

  renderMlAccordion();
  renderExcerpts();
  renderRereads();
}

// ── Tag Input ──
function initTagWrap(wrapId,quickId,options,initial){
  const wrap=document.getElementById(wrapId);
  const quick=document.getElementById(quickId);
  if(!wrap) return;

  let tags=[...initial];
  const render=()=>{
    const chips=tags.map(t=>`<span class="tag-chip sticker-mint">${escHtml(t)}<span class="tag-remove" data-tag="${escHtml(t)}">&times;</span></span>`).join('');
    wrap.innerHTML=chips+`<input type="text" class="tag-input" placeholder="태그 입력...">`;
    const input=wrap.querySelector('.tag-input');
    input.addEventListener('keydown',e=>{
      if(e.key==='Enter'&&e.target.value.trim()){
        e.preventDefault();
        const v=e.target.value.trim();
        if(!tags.includes(v)){tags.push(v);render();}
        else e.target.value='';
      }
      if(e.key==='Backspace'&&!e.target.value&&tags.length){
        tags.pop();render();
      }
    });
    wrap.querySelectorAll('.tag-remove').forEach(r=>{
      r.addEventListener('click',()=>{tags=tags.filter(t=>t!==r.dataset.tag);render();});
    });
  };
  render();
  wrap._getTags=()=>[...tags];

  if(quick){
    quick.innerHTML=options.slice(0,15).map(o=>`<button type="button" class="quick-tag">${escHtml(o)}</button>`).join('');
    quick.addEventListener('click',e=>{
      if(e.target.classList.contains('quick-tag')){
        const v=e.target.textContent;
        if(!tags.includes(v)){tags.push(v);render();}
      }
    });
  }
}

// ── ML Accordion ──
function renderMlAccordion(){
  const wrap=document.getElementById('mlAccordion');
  if(!wrap) return;
  wrap.innerHTML=_mlData.map((m,i)=>{
    const label=m.sub?'🩵 서브남':'💙 남주';
    const typeTags=(m.typeTags||[]).map(t=>`<span class="tag-chip sticker-pink" style="font-size:11px">${escHtml(t)}</span>`).join('');
    return `<div class="ml-entry" data-idx="${i}">
      <div class="ml-entry-header" onclick="toggleMlEntry(${i})">
        <span>${label} — ${escHtml(m.name||'(이름 없음)')}</span>
        <button type="button" class="ml-del" onclick="event.stopPropagation();removeMl(${i})">✕</button>
      </div>
      <div class="ml-entry-body ${m._open?'open':''}">
        <div class="row2">
          <div class="fg"><label>이름</label><input type="text" value="${escHtml(m.name||'')}" onchange="syncMl(${i},'name',this.value)"></div>
          <div class="fg"><label>나이</label><input type="text" value="${escHtml(m.age||'')}" onchange="syncMl(${i},'age',this.value)"></div>
        </div>
        <div class="fg"><label><input type="checkbox" ${m.sub?'checked':''} onchange="syncMl(${i},'sub',this.checked)"> 서브남</label></div>
        <div class="fg"><label>소개</label><textarea rows="2" onchange="syncMl(${i},'intro',this.value)">${escHtml(m.intro||'')}</textarea></div>
        <div class="fg"><label>유형 태그</label><div class="ml-type-tags">${typeTags}</div>
          <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">
            ${RIDI_ML_TYPES.slice(0,12).map(t=>`<button type="button" class="quick-tag" onclick="addMlTypeTag(${i},'#${t}')">#${escHtml(t)}</button>`).join('')}
          </div>
          <input type="text" placeholder="직접 입력 후 Enter" style="margin-top:4px;width:100%" onkeydown="if(event.key==='Enter'){event.preventDefault();addMlTypeTag(${i},this.value);this.value='';}">
        </div>
      </div>
    </div>`;
  }).join('');
}

function toggleMlEntry(i){_mlData[i]._open=!_mlData[i]._open;renderMlAccordion();}
function syncMl(i,key,val){_mlData[i][key]=val;}
function removeMl(i){_mlData.splice(i,1);renderMlAccordion();}
function addMlEntry(){_mlData.push({name:'',age:'',intro:'',typeTags:[],sub:false,_open:true});renderMlAccordion();}
function addMlTypeTag(i,tag){
  tag=tag.trim();
  if(!tag) return;
  if(!tag.startsWith('#')) tag='#'+tag;
  if(!_mlData[i].typeTags) _mlData[i].typeTags=[];
  if(!_mlData[i].typeTags.includes(tag)){_mlData[i].typeTags.push(tag);renderMlAccordion();}
}

// ── Excerpts ──
function renderExcerpts(){
  const wrap=document.getElementById('excerptsWrap');
  if(!wrap) return;
  wrap.innerHTML=_excerptsData.map((e,i)=>`<div class="excerpt-entry">
    <div class="excerpt-head">발췌 ${i+1} <button type="button" class="ml-del" onclick="removeExcerpt(${i})">✕</button></div>
    <div class="fg"><label>위치</label><input type="text" value="${escHtml(e.location||'')}" placeholder="예: 2권 147p" onchange="syncExcerpt(${i},'location',this.value)"></div>
    <div class="fg"><label>문장</label><textarea rows="2" placeholder="발췌 구절..." onchange="syncExcerpt(${i},'text',this.value)">${escHtml(e.text||'')}</textarea></div>
    <div class="fg"><label>이유</label><textarea rows="1" placeholder="이 구절을 고른 이유..." onchange="syncExcerpt(${i},'reason',this.value)">${escHtml(e.reason||'')}</textarea></div>
  </div>`).join('');
}
function addExcerpt(){_excerptsData.push({text:'',location:'',reason:''});renderExcerpts();}
function removeExcerpt(i){_excerptsData.splice(i,1);renderExcerpts();}
function syncExcerpt(i,key,val){_excerptsData[i][key]=val;}

// ── Rereads ──
function renderRereads(){
  const wrap=document.getElementById('rereadsWrap');
  if(!wrap) return;
  wrap.innerHTML=_rereadsData.map((r,i)=>`<div class="reread-entry">
    <span>제${r.nth||i+1}회독</span>
    <input type="date" value="${escHtml(r.date||'')}" onchange="syncReread(${i},'date',this.value)">
    <input type="text" value="${escHtml(r.note||'')}" placeholder="메모" onchange="syncReread(${i},'note',this.value)" style="flex:1">
    <button type="button" class="ml-del" onclick="removeReread(${i})">✕</button>
  </div>`).join('');
}
function addReread(){_rereadsData.push({nth:_rereadsData.length+1,date:'',note:''});renderRereads();}
function removeReread(i){_rereadsData.splice(i,1);renderRereads();}
function syncReread(i,key,val){_rereadsData[i][key]=val;}

// ── Cover ──
function applyCoverUrl(){
  const url=document.getElementById('editCoverUrl').value.trim();
  const preview=document.getElementById('coverPreview');
  if(url){
    preview.innerHTML=`<img src="${escHtml(url)}" alt="" onerror="this.parentElement.innerHTML='<div class=\\'cover-hint\\'><span class=\\'ci\\'>⚠️</span>로드 실패</div>'">`;
  }else{
    preview.innerHTML='<div class="cover-hint"><span class="ci">📷</span>표지 이미지</div>';
  }
}

// ── Save ──
function saveBook(){
  const title=document.getElementById('editTitle').value.trim();
  if(!title){showToast('제목을 입력해주세요');return;}
  const author=document.getElementById('editAuthor').value.trim();
  const status=document.querySelector('#editStatusWrap .status-opt.sel-on')?.dataset.status||'읽고싶어요';
  const rating=[...document.querySelectorAll('#editStarRow .sr-btn.on')].length;
  const genres=[...document.querySelectorAll('.edit-genre-cb:checked')].map(c=>c.value);
  const cover=document.getElementById('editCoverUrl').value.trim();
  const dateStart=document.getElementById('editDateStart').value;
  const dateEnd=document.getElementById('editDateEnd').value;
  const datebuy=document.getElementById('editDatebuy').value;
  const platformurl=document.getElementById('editPlatformUrl').value.trim();
  const platform=document.getElementById('editPlatform').value.trim();
  const price=Number(document.getElementById('editPrice').value)||0;
  const booktype=document.getElementById('editBooktype').value;
  const agerating=document.getElementById('editAgerating').value;
  const summary=document.getElementById('editSummary').value.trim();
  const review=document.getElementById('editReview').value.trim();
  const memo=document.getElementById('editMemo').value.trim();
  const sojaiWrap=document.getElementById('sojaiTagWrap');
  const relWrap=document.getElementById('relTagWrap');
  const flTypeTagWrap=document.getElementById('flTypeTagWrap');
  const sojai=sojaiWrap?._getTags?.()||[];
  const rel=relWrap?._getTags?.()||[];
  const flTypeTags=flTypeTagWrap?._getTags?.()||[];

  const ml=_mlData.filter(m=>m.name||m.intro||(m.typeTags&&m.typeTags.length)).map(m=>({name:m.name||'',age:m.age||'',typeTags:m.typeTags||[],intro:m.intro||'',sub:!!m.sub}));
  const fl={name:document.getElementById('editFlName').value.trim(),age:document.getElementById('editFlAge').value.trim(),typeTags:[...flTypeTags],intro:document.getElementById('editFlIntro')?.value.trim()||''};
  const excerpts=_excerptsData.filter(e=>e.text);
  const rereads=_rereadsData.filter(r=>r.date||r.note);

  const bookData={title,author,status,rating,genres,cover,dateStart,dateEnd,datebuy,platformurl,url:platformurl,platform,price,booktype,agerating,summary,review,memo,sojai,rel,flTypeTags,ml,fl,excerpts,rereads,updatedAt:new Date().toISOString()};

  if(_editingId){
    const idx=books.findIndex(b=>b.id===_editingId);
    if(idx>=0) Object.assign(books[idx],bookData);
    showToast('수정했어요');
  }else{
    books.push({id:generateId(),fav:false,createdAt:new Date().toISOString(),...bookData});
    showToast('새 기록을 추가했어요');
  }
  saveData();
  renderBooks();
  updateBookCount();
  closeModal('ov-edit');
}

document.getElementById('editSave')?.addEventListener('click',saveBook);

// ══════════════ Ridi Import ══════════════
function openRidiModal(){
  document.getElementById('ridiUrl').value='';
  openModal('ov-ridi');
}

async function importFromRidi(){
  const urlInput=document.getElementById('ridiUrl');
  const url=urlInput.value.trim();
  if(!url||!url.includes('ridibooks.com/books/')){showToast('올바른 리디북스 URL을 입력해주세요');return;}
  const btn=document.getElementById('ridiSubmit');
  btn.textContent='불러오는 중...';
  btn.disabled=true;
  try{
    const res=await fetch(RIDI_PROXY_URL+'?url='+encodeURIComponent(url));
    if(!res.ok) throw new Error('Fetch failed: '+res.status);
    const html=await res.text();
    const doc=new DOMParser().parseFromString(html,'text/html');
    const getMeta=(p)=>doc.querySelector(`meta[property="${p}"]`)?.content||doc.querySelector(`meta[name="${p}"]`)?.content||'';
    const title=getMeta('og:title')||doc.title||'';
    const desc=getMeta('og:description')||'';
    const cover=getMeta('og:image')||'';
    const pageText=doc.body?.textContent||'';
    let author='';
    const authorEl=doc.querySelector('.author_metadata_writer a,.metadata_writer .author_detail_link');
    if(authorEl) author=authorEl.textContent.trim();
    else{const m=desc.match(/^([^,]+)/);if(m)author=m[1].trim();}

    const genres=RIDI_GENRES.filter(g=>pageText.includes(g));
    const sojai=RIDI_SOJAI.filter(t=>pageText.includes(t));
    const rel=RIDI_REL.filter(t=>pageText.includes(t));

    closeModal('ov-ridi');
    openEditModal({
      genres,sojai,rel,
      title:title.replace(/\s*-\s*리디$/,''),author,cover,
      status:'읽고싶어요',rating:0,fav:false,
      summary:desc.replace(/\s*\.\.\.\s*$/,'').trim(),
      review:'',memo:'',ml:[],fl:{},excerpts:[],rereads:[],flTypeTags:[],
      dateStart:'',dateEnd:'',datebuy:new Date().toISOString().slice(0,10),
      platformurl:url,url,platform:'리디',price:0,booktype:'',agerating:''
    });
    showToast('리디북스에서 불러왔어요');
  }catch(e){
    console.error('Ridi import error:',e);
    showToast('불러오기 실패: '+e.message);
  }finally{
    btn.textContent='불러오기';
    btn.disabled=false;
  }
}

document.getElementById('ridiSubmit')?.addEventListener('click',importFromRidi);
