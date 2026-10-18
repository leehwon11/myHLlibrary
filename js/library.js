// ══════════════ 나의 서재 — Library (Book CRUD, Render, Ridi) ══════════════

let _editingId=null;
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
    if(query&&!b.title?.toLowerCase().includes(query)&&!b.author?.toLowerCase().includes(query)) return false;
    if(showAll) return true;
    if(activePills.includes('fav')&&b.fav) return true;
    if(activePills.includes(b.status)) return true;
    return false;
  });

  list.sort((a,b)=>{
    switch(sort){
      case 'oldest': return (a.created||'')>(b.created||'')?1:-1;
      case 'title': return (a.title||'').localeCompare(b.title||'');
      case 'rating': return (b.rating||0)-(a.rating||0);
      default: return (b.created||'')>(a.created||'')?1:-1;
    }
  });

  if(!list.length){
    grid.innerHTML=`<div class="empty-state"><div class="empty-icon">📖</div><p>${query?'검색 결과가 없어요':'아직 기록이 없어요. 첫 이야기를 적어볼까요?'}</p></div>`;
    return;
  }

  grid.innerHTML=list.map(b=>{
    const gc=b.genre?.length?getGenreColor(b.genre[0]):'#808080';
    const stars='★'.repeat(b.rating||0)+'<span class="off">'+'★'.repeat(5-(b.rating||0))+'</span>';
    const dateStr=b.dateend||b.datestart||b.created?.slice(0,10)||'';
    const coverHtml=b.cover?`<img src="${escHtml(b.cover)}" alt="" loading="lazy">`:'📖';
    const allTags=[...(b.sojaiTags||[]),...(b.relTags||[])];
    if(b.mlType) allTags.push(b.mlType);
    if(b.flType) allTags.push(b.flType);
    const stickers=allTags.slice(0,5).map((t,i)=>`<span class="sticker ${STICKER_COLORS[i%4]}">${escHtml(t)}</span>`).join('');
    const titleHtml=query?highlightText(b.title,query):escHtml(b.title);
    const authorHtml=query?highlightText(b.author||'',query):escHtml(b.author||'');
    return `<div class="diary-entry" onclick="openDetail('${b.id}')">
      <button class="entry-fav${b.fav?' on':''}" onclick="event.stopPropagation();toggleFav('${b.id}')">♥</button>
      <div class="washi ${getStatusClass(b.status)}"></div>
      <div class="entry-date">${escHtml(dateStr)}</div>
      <div class="entry-cover">${coverHtml}</div>
      <div class="entry-title">${titleHtml}</div>
      <div class="entry-author">${authorHtml}</div>
      <div class="entry-stars">${stars}</div>
      ${b.genre?.length?`<span class="entry-genre" style="background:${hexToRgba(gc,.15)};color:${gc}">${escHtml(b.genre[0])}</span>`:''}
      ${stickers?`<div class="sticker-row">${stickers}</div>`:''}
    </div>`;
  }).join('');
}

function openDetail(id){
  const b=books.find(x=>x.id===id);
  if(!b) return;
  const body=document.getElementById('detailBody');
  const gc=b.genre?.length?getGenreColor(b.genre[0]):'#808080';
  const stars='★'.repeat(b.rating||0)+'<span style="color:var(--ink-faint)">'+'★'.repeat(5-(b.rating||0))+'</span>';
  const coverHtml=b.cover?`<img src="${escHtml(b.cover)}" alt="">`:'<span style="font-size:48px">📖</span>';

  const statusColors={'완독':'var(--mint-bg)','읽는중':'var(--yellow-bg)','읽고싶어요':'var(--lavender-bg)'};
  const statusTextColors={'완독':'var(--green)','읽는중':'var(--amber)','읽고싶어요':'var(--lavender)'};

  const allTags=[...(b.sojaiTags||[]),...(b.relTags||[])];
  if(b.mlType) allTags.push(b.mlType);
  if(b.flType) allTags.push(b.flType);
  const tagHtml=allTags.map((t,i)=>`<span class="sticker ${STICKER_COLORS[i%4]}">${escHtml(t)}</span>`).join('');

  let datesHtml='';
  if(b.datestart||b.dateend){
    datesHtml=`<div class="det-section"><div class="det-section-title">독서 기간</div><div style="font-size:13px;color:var(--ink-light)">${escHtml(b.datestart||'?')} ~ ${escHtml(b.dateend||'?')}</div></div>`;
  }
  let memoHtml='';
  if(b.memo) memoHtml=`<div class="det-section"><div class="det-section-title">메모</div><div class="det-text">${escHtml(b.memo)}</div></div>`;
  let excerptHtml='';
  if(b.excerpt) excerptHtml=`<div class="det-section"><div class="det-section-title">발췌</div><div class="det-text" style="font-style:italic">${escHtml(b.excerpt)}</div></div>`;
  let rereadsHtml='';
  if(b.rereads?.length){
    rereadsHtml=`<div class="det-section"><div class="det-section-title">재독 기록 (${b.rereads.length}회)</div><div style="font-size:13px;color:var(--ink-light)">${b.rereads.map(r=>escHtml(r)).join(', ')}</div></div>`;
  }

  body.innerHTML=`
    <div class="det-header">
      <div class="det-cover">${coverHtml}</div>
      <div class="det-info">
        <div class="det-title">${escHtml(b.title)}</div>
        <div class="det-author">${escHtml(b.author||'')}</div>
        <div class="det-stars">${stars}</div>
        <div class="det-meta">
          <span class="entry-genre" style="background:${b.status?statusColors[b.status]||'var(--ink-faint)':'var(--ink-faint)'};color:${statusTextColors[b.status]||'var(--ink-muted)'};padding:3px 10px">${escHtml(b.status||'')}</span>
          ${(b.genre||[]).map(g=>{const c=getGenreColor(g);return `<span class="entry-genre" style="background:${hexToRgba(c,.15)};color:${c}">${escHtml(g)}</span>`;}).join('')}
        </div>
        ${b.fav?'<div style="font-size:14px;color:#e74c5e">♥ 즐겨찾기</div>':''}
        ${b.url?`<a href="${escHtml(b.url)}" target="_blank" rel="noopener" style="font-size:12px;color:var(--blue);text-decoration:underline">원본 링크</a>`:''}
      </div>
    </div>
    ${tagHtml?`<div class="sticker-row" style="margin-bottom:12px">${tagHtml}</div>`:''}
    ${datesHtml}${memoHtml}${excerptHtml}${rereadsHtml}
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

function openEditModal(book){
  _editingId=book?book.id:null;
  const isNew=!book;
  const b=book||{genre:[],sojaiTags:[],relTags:[],rating:0,status:'읽고싶어요'};
  document.getElementById('editModalTitle').textContent=isNew?'새 기록':'기록 수정';
  document.getElementById('editDelete').hidden=isNew;
  if(!isNew) document.getElementById('editDelete').onclick=()=>{closeModal('ov-edit');deleteBook(b.id);};

  const body=document.getElementById('editModalBody');
  body.innerHTML=buildEditForm(b);
  initEditForm(b);
  openModal('ov-edit');
}

function buildEditForm(b){
  const genreChecks=DEFAULT_GENRES.map(g=>{
    const checked=(b.genre||[]).includes(g.name)?'checked':'';
    return `<label style="display:inline-flex;align-items:center;gap:4px;font-size:13px;cursor:pointer;margin-right:8px;margin-bottom:4px"><input type="checkbox" class="edit-genre-cb" value="${escHtml(g.name)}" ${checked}><span class="sticker" style="background:${hexToRgba(g.color,.15)};color:${g.color};font-size:13px;padding:1px 6px;border-radius:6px">${escHtml(g.name)}</span></label>`;
  }).join('');

  return `
  <div class="form-grid">
    <div class="form-col">
      <div class="cover-box" id="coverPreview">
        ${b.cover?`<img src="${escHtml(b.cover)}" alt="">`:
        `<div class="cover-hint"><span class="ci">🖼️</span>표지 이미지</div>`}
      </div>
      <div class="cover-url-row">
        <input type="url" id="editCoverUrl" placeholder="이미지 URL" value="${escHtml(b.cover||'')}">
        <button class="btn btn-sm" onclick="applyCoverUrl()">적용</button>
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
        <div class="fg"><label>시작일</label><input type="date" id="editDateStart" value="${escHtml(b.datestart||'')}"></div>
        <div class="fg"><label>완독일</label><input type="date" id="editDateEnd" value="${escHtml(b.dateend||'')}"></div>
      </div>

      <div class="sec-label">소재 태그</div>
      <div class="tag-input-wrap" id="sojaiTagWrap"></div>
      <div class="quick-tags" id="sojaiQuick"></div>

      <div class="sec-label">관계 태그</div>
      <div class="tag-input-wrap" id="relTagWrap"></div>
      <div class="quick-tags" id="relQuick"></div>

      <div class="row2">
        <div class="fg"><label>남주 유형</label>
          <select id="editMlType"><option value="">선택 안함</option>${RIDI_ML_TYPES.map(t=>`<option value="${escHtml(t)}"${b.mlType===t?' selected':''}>${escHtml(t)}</option>`).join('')}</select>
        </div>
        <div class="fg"><label>여주 유형</label>
          <select id="editFlType"><option value="">선택 안함</option>${RIDI_FL_TYPES.map(t=>`<option value="${escHtml(t)}"${b.flType===t?' selected':''}>${escHtml(t)}</option>`).join('')}</select>
        </div>
      </div>

      <div class="fg"><label>URL</label><input type="url" id="editUrl" value="${escHtml(b.url||'')}" placeholder="원본 링크 (선택)"></div>
      <div class="fg"><label>메모</label><textarea id="editMemo" rows="3" placeholder="감상, 메모...">${escHtml(b.memo||'')}</textarea></div>
      <div class="fg"><label>발췌</label><textarea id="editExcerpt" rows="2" placeholder="인상깊은 구절...">${escHtml(b.excerpt||'')}</textarea></div>
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
      document.querySelectorAll('#editStarRow .sr-btn').forEach(x=>{
        x.classList.toggle('on',parseInt(x.dataset.star)<=val);
      });
      document.getElementById('editStarLabel').textContent=STAR_LABELS[val]||'';
    });
  });

  initTagWrap('sojaiTagWrap','sojaiQuick',RIDI_SOJAI,b.sojaiTags||[]);
  initTagWrap('relTagWrap','relQuick',RIDI_REL,b.relTags||[]);
}

function initTagWrap(wrapId,quickId,options,initial){
  const wrap=document.getElementById(wrapId);
  const quick=document.getElementById(quickId);
  if(!wrap) return;

  let tags=[...initial];
  const render=()=>{
    const chips=tags.map(t=>`<span class="tag-chip sticker-mint">${escHtml(t)}<span class="tag-remove" data-tag="${escHtml(t)}">&times;</span></span>`).join('');
    wrap.innerHTML=chips+`<input type="text" class="tag-input" placeholder="태그 입력..." data-wrap="${wrapId}">`;
    wrap.querySelector('.tag-input').addEventListener('keydown',e=>{
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

function applyCoverUrl(){
  const url=document.getElementById('editCoverUrl').value.trim();
  const preview=document.getElementById('coverPreview');
  if(url){
    preview.innerHTML=`<img src="${escHtml(url)}" alt="" onerror="this.parentElement.innerHTML='<div class=\\'cover-hint\\'><span class=\\'ci\\'>⚠️</span>로드 실패</div>'">`;
  }else{
    preview.innerHTML='<div class="cover-hint"><span class="ci">🖼️</span>표지 이미지</div>';
  }
}

function saveBook(){
  const title=document.getElementById('editTitle').value.trim();
  if(!title){showToast('제목을 입력해주세요');return;}
  const author=document.getElementById('editAuthor').value.trim();
  const status=document.querySelector('#editStatusWrap .status-opt.sel-on')?.dataset.status||'읽고싶어요';
  const rating=[...document.querySelectorAll('#editStarRow .sr-btn.on')].length;
  const genre=[...document.querySelectorAll('.edit-genre-cb:checked')].map(c=>c.value);
  const cover=document.getElementById('editCoverUrl').value.trim();
  const datestart=document.getElementById('editDateStart').value;
  const dateend=document.getElementById('editDateEnd').value;
  const url=document.getElementById('editUrl').value.trim();
  const memo=document.getElementById('editMemo').value.trim();
  const excerpt=document.getElementById('editExcerpt').value.trim();
  const mlType=document.getElementById('editMlType').value;
  const flType=document.getElementById('editFlType').value;
  const sojaiWrap=document.getElementById('sojaiTagWrap');
  const relWrap=document.getElementById('relTagWrap');
  const sojaiTags=sojaiWrap?._getTags?.()||[];
  const relTags=relWrap?._getTags?.()||[];

  if(_editingId){
    const idx=books.findIndex(b=>b.id===_editingId);
    if(idx>=0){
      Object.assign(books[idx],{title,author,status,rating,genre,cover,datestart,dateend,url,memo,excerpt,mlType,flType,sojaiTags,relTags});
    }
    showToast('수정했어요');
  }else{
    books.push({id:generateId(),title,author,status,rating,genre,cover,fav:false,sojaiTags,relTags,mlType,flType,memo,excerpt,rereads:[],datestart,dateend,url,order:books.length,created:new Date().toISOString()});
    showToast('새 기록을 추가했어요');
  }
  saveData();
  renderBooks();
  updateBookCount();
  closeModal('ov-edit');
}

document.getElementById('editSave')?.addEventListener('click',saveBook);

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
    let author='';
    const authorMatch=desc.match(/^([^,]+)/);
    if(authorMatch) author=authorMatch[1].trim();

    let keywords=(getMeta('keywords')||'').split(',').map(k=>k.trim()).filter(Boolean);
    let genre=[];
    keywords.forEach(k=>{if(RIDI_GENRES.includes(k)) genre.push(k);});

    closeModal('ov-ridi');
    openEditModal({
      genre,title:title.replace(/\s*-\s*리디$/, ''),author,cover,
      status:'읽고싶어요',rating:0,fav:false,
      sojaiTags:[],relTags:[],mlType:'',flType:'',
      memo:'',excerpt:'',rereads:[],datestart:'',dateend:'',url,order:0,created:''
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
