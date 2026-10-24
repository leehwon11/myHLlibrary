// ══════════════ RENDER BOOKS ══════════════
function stars(n){return[1,2,3,4,5].map(i=>`<span class="s ${i<=n?'on':'off'}">★</span>`).join('');}
function getSortedFiltered(){
  saveFilterState();
  const q=(document.getElementById('searchInput')?.value||'').toLowerCase();
  const sort=document.getElementById('sortSelect')?.value||'newest';
  let list=books.filter(b=>{
    const bG=b.genre||[];const cf=currentFilter.trim();
    const gm=cf==='전체'||bG.map(g=>g.trim()).includes(cf);
    const sm=!currentStatusFilter||b.status===currentStatusFilter;
    const fm=!showFavOnly||!!b.fav;
    const allTags=[...(b.sojaiTags||b.tags||[]),...(b.relTags||b.themes||[])];
    const excTags=(b.excerpts||[]).flatMap(e=>e.tags||[]);
    const qm=!q||[b.title,b.author,...bG,...allTags,...excTags].join(' ').toLowerCase().includes(q);
    return gm&&sm&&fm&&qm;
  });
  if(sort==='newest')list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  else if(sort==='oldest')list.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  else if(sort==='rating-desc')list.sort((a,b)=>(b.rating||0)-(a.rating||0));
  else if(sort==='rating-asc')list.sort((a,b)=>(a.rating||0)-(b.rating||0));
  else if(sort==='title')list.sort((a,b)=>a.title.localeCompare(b.title,'ko'));
  else if(sort==='custom'&&customOrder){const om=new Map(customOrder.map((id,i)=>[id,i]));list.sort((a,b)=>(om.has(a.id)?om.get(a.id):9999)-(om.has(b.id)?om.get(b.id):9999));}
  return list;
}
const STATUS_LABEL={완독:'완독',읽는중:'읽는 중',읽고싶어요:'읽고 싶어요',하차:'하차'};
function safeUrl(u){return /^https?:\/\//i.test(u||'')?u:'';}
function coverHtml(b,inner=''){
  const g=getGenre((b.genre||[])[0]);
  const img=safeUrl(b.cover)||(String(b.cover||'').startsWith('data:image/')?b.cover:'');
  return`<div class="cover">${img?`<img src="${escHtml(img)}" alt="" loading="lazy">`:`<div class="cover-ph" style="background:${g.color}"><span>${escHtml(b.title)}</span></div>`}${inner}</div>`;
}
function tagBtn(t,cls){return`<button type="button" class="${cls}" data-tag="${encodeURIComponent(t)}" onclick="event.stopPropagation();searchByTag(decodeURIComponent(this.dataset.tag))">${escHtml(t)}</button>`;}
function renderCard(b,q){
  const genre=(b.genre||[])[0]||'';
  const allTags=[...(b.sojaiTags||b.tags||[]),...(b.relTags||b.themes||[])];
  const tags=allTags.slice(0,2).map(t=>tagBtn(t,'ctag ctag-click')).join('');
  const st=b.status?`<span class="bc-status st-${b.status}">${STATUS_LABEL[b.status]||escHtml(b.status)}</span>`:'';
  const fav=`<button class="fav-btn owner-only${b.fav?' on':''}" onclick="event.stopPropagation();toggleFav('${b.id}')" aria-label="즐겨찾기"><span class="fav-star">★</span></button>`;
  const reread=(b.rereads&&b.rereads.length)?`<span class="bc-reread">${b.rereads.length}회독</span>`:'';
  const age=b.agerating&&b.agerating!=='전체'?`<span class="age-badge age-${b.agerating}">${parseInt(b.agerating)||escHtml(b.agerating)}</span>`:'';
  const titleHl=q?highlight(b.title,q):escHtml(b.title);
  const authorHl=q?highlight(b.author||'작가 미상',q):escHtml(b.author||'작가 미상');
  const mood=b.moods&&b.moods.length?`<div class="bc-mood">${MOOD_OPTIONS.find(m=>m.label===b.moods[0])?.emoji||''} ${escHtml(b.moods[0])}</div>`:'';
  return`<div class="book-card" draggable="true" data-id="${b.id}" onclick="openDetail('${b.id}')" ondragstart="onDragStart(event,'${b.id}')" ondragover="onDragOver(event)" ondrop="onDrop(event,'${b.id}')" ondragleave="onDragLeave(event)" ondragend="onDragEnd(event)">${coverHtml(b,st+fav+reread)}<div class="bc-title-row"><div class="bc-title">${titleHl}</div>${age}</div><div class="bc-meta">${authorHl}${genre?' · '+escHtml(genre):''}</div>${b.rating?`<div class="bc-stars" aria-label="별점 ${b.rating}점">${'★'.repeat(b.rating)}</div>`:''}${tags?`<div class="bc-tags">${tags}</div>`:''}${mood}</div>`;
}
function updateShelfCounts(){
  const cnt={'':books.length};books.forEach(b=>{cnt[b.status]=(cnt[b.status]||0)+1;});
  document.querySelectorAll('.sp').forEach(p=>{const s=p.querySelector('.sp-count');if(s)s.textContent=' '+(cnt[p.dataset.sv]||0);});
  const c=document.getElementById('shelfCount');if(c)c.textContent=books.length+'권';
}
function render(){
  updateLogo();updateShelfCounts();
  const q=(document.getElementById('searchInput')?.value||'').toLowerCase();
  const filtered=getSortedFiltered();const grid=document.getElementById('bookGrid');
  grid.innerHTML=filtered.length?filtered.map(b=>renderCard(b,q)).join(''):`<div class="empty"><div class="empty-ico">📚</div><p>${books.length?'조건에 맞는 책이 없어요.':'아직 등록된 책이 없어요. 오른쪽 위 "+ 책 추가"로 시작해보세요.'}</p></div>`;
  if(_currentPage!=='library')refreshActivePage();
}
function goShelf(status){currentStatusFilter=status||'';currentFilter='전체';document.querySelectorAll('.sp').forEach(p=>p.classList.toggle('sp-on',p.dataset.sv===currentStatusFilter));switchPage('library');}
function setStatusFilter(val){
  currentStatusFilter=val;
  document.querySelectorAll('.sp').forEach(p=>p.classList.toggle('sp-on',p.dataset.sv===val));
  render();
}

// ══════════════ 드래그 앤 드롭 ══════════════
let _dragId=null;
function onDragStart(e,id){_dragId=id;e.currentTarget.classList.add('dragging');}
function onDragOver(e){e.preventDefault();const card=e.currentTarget.closest('.book-card');if(card&&card.dataset.id!==_dragId)card.classList.add('drag-over');}
function onDragLeave(e){e.currentTarget.closest('.book-card')?.classList.remove('drag-over');}
function onDragEnd(e){e.currentTarget.classList.remove('dragging');document.querySelectorAll('.book-card').forEach(c=>c.classList.remove('drag-over'));}
function onDrop(e,targetId){
  e.preventDefault();document.querySelectorAll('.book-card').forEach(c=>c.classList.remove('drag-over','dragging'));
  if(!_dragId||_dragId===targetId){_dragId=null;return;}
  let order=customOrder?[...customOrder]:books.map(b=>b.id);
  const fi=order.indexOf(_dragId),ti=order.indexOf(targetId);
  if(fi===-1){order=books.map(b=>b.id);}const fi2=order.indexOf(_dragId),ti2=order.indexOf(targetId);
  if(fi2!==-1&&ti2!==-1){order.splice(fi2,1);order.splice(ti2,0,_dragId);}
  customOrder=order;try{sessionStorage.setItem('myLib_customOrder',JSON.stringify(customOrder));}catch(e){}
  const sel=document.getElementById('sortSelect');if(sel)sel.value='custom';
  _dragId=null;render();showToast('순서가 변경됐어요! 정렬: 사용자 지정 순서');
}

// ══════════════ 표지 검색 ══════════════
function applyCoverUrl(){const inp=document.getElementById('coverUrlInput');if(!inp)return;const url=inp.value.trim();if(!url){showToast('URL을 입력해주세요.');return;}currentCover=url;document.getElementById('coverBox').innerHTML=`<img src="${currentCover}" alt="" onerror="this.parentNode.innerHTML='<div class=\\'cover-hint\\'><span class=\\'ci\\'>⚠️</span>이미지를 불러올 수 없어요</div>'">`;inp.value='';showToast('표지 URL이 적용됐어요!');}

// ══════════════ EDIT MODAL ══════════════
function openAdd(){if(VIEW_MODE)return;editId=null;currentCover=null;currentStar=0;currentStatusVal='읽고싶어요';excerptsData=[];currentCtagsSojai=[];currentCtagsRel=[];currentFlTypeTags=[];currentGenreTags=[];currentMoods=[];mlData=[];rereadData=[];document.getElementById('editModalTitle').textContent='책 추가';document.getElementById('delBtn').style.display='none';clearForm();renderExcerpts();updateStatusUI();renderTagsSojai();renderTagsRel();renderFlTypeTags();renderMoodSelector();renderGenreTags();renderStarPicker();document.getElementById('editOv').classList.add('open');}
function openEdit(id){
  if(VIEW_MODE)return;
  const b=books.find(x=>x.id===id);if(!b)return;
  editId=id;currentStar=b.rating||0;currentCover=b.cover||null;currentStatusVal=b.status||'완독';excerptsData=(b.excerpts||[]).map(e=>({...e,open:false}));currentMoods=b.moods?[...b.moods]:[];
  document.getElementById('editModalTitle').textContent='책 수정';document.getElementById('delBtn').style.display='block';
  document.getElementById('f-title').value=b.title||'';document.getElementById('f-author').value=b.author||'';
  currentCtagsSojai=b.sojaiTags?[...b.sojaiTags]:[...(b.tags||[]),...(b.themes||[])];currentCtagsRel=b.relTags?[...b.relTags]:[];currentFlTypeTags=b.flTypeTags?[...b.flTypeTags]:(b.fl&&b.fl.typeTags?[...b.fl.typeTags]:[]);
  renderTagsSojai();renderTagsRel();renderFlTypeTags();renderMoodSelector();
  mlData=Array.isArray(b.ml)?b.ml.map(m=>({...m,typeTags:m.typeTags||[],open:false})):(b.ml&&b.ml.name?[{...b.ml,typeTags:[],open:false}]:[]);renderMlAcc();
  const fl=b.fl||{};document.getElementById('f-fl-name').value=fl.name||'';document.getElementById('f-fl-age').value=fl.age||'';const fliEl=document.getElementById('f-fl-intro');if(fliEl)fliEl.value=fl.intro||'';
  document.getElementById('f-summary').value=b.summary||'';document.getElementById('f-review').value=b.review||'';const memoEl=document.getElementById('f-memo');if(memoEl)memoEl.value=b.memo||'';document.getElementById('f-booktype').value=b.booktype||'';document.getElementById('f-agerating').value=b.agerating||'';
  document.getElementById('f-platform').value=b.platform||'';const pue=document.getElementById('f-platformurl');if(pue)pue.value=b.platformurl||'';
  rereadData=(b.rereads||[]).map(r=>({...r}));renderRereadList();
  purchasesData=(b.purchases||[]).map(p=>({...p}));renderPurchaseList();
  document.getElementById('f-price').value=b.price||'';document.getElementById('f-datebuy').value=b.datebuy||'';document.getElementById('f-datestart').value=b.datestart||'';document.getElementById('f-dateend').value=b.dateend||'';
  document.getElementById('f-dnf-at').value=b.dnfAt||'';document.getElementById('f-dnf-date').value=b.dnfDate||'';document.getElementById('f-dnf-reason').value=b.dnfReason||'';

  currentGenreTags=Array.isArray(b.genre)?[...b.genre]:(b.genre?[b.genre]:[]);renderGenreTags();
  document.getElementById('coverBox').innerHTML=currentCover?`<img src="${currentCover}" alt="">`:'<div class="cover-hint"><span class="ci">🔗</span>아래에<br>이미지 URL을 입력하세요</div>';
  renderStarPicker();updateStatusUI();renderExcerpts();
  ['f-summary','f-review','f-memo','f-fl-intro'].forEach(id=>autosizeEl(document.getElementById(id)));
  document.getElementById('editOv').classList.add('open');
}
function clearForm(){['f-title','f-author','f-summary','f-review','f-memo','f-platform','f-platformurl','f-price','f-datebuy','f-datestart','f-dateend','f-fl-name','f-fl-age','f-fl-intro','f-dnf-at','f-dnf-date','f-dnf-reason'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});rereadData=[];renderRereadList();purchasesData=[];renderPurchaseList();currentGenreTags=[];renderGenreTags();mlData=[];renderMlAcc();document.getElementById('f-booktype').value='';document.getElementById('f-agerating').value='';document.getElementById('coverBox').innerHTML='<div class="cover-hint"><span class="ci">🔗</span>아래에<br>이미지 URL을 입력하세요</div>';currentCtagsSojai=[];currentCtagsRel=[];currentFlTypeTags=[];renderTagsSojai();renderTagsRel();renderFlTypeTags();updateStarUI();['f-summary','f-review','f-memo','f-fl-intro'].forEach(id=>autosizeEl(document.getElementById(id)));}
function closeEdit(){document.getElementById('editOv').classList.remove('open');}
function removeCover(){currentCover=null;document.getElementById('coverBox').innerHTML='<div class="cover-hint"><span class="ci">🔗</span>아래에<br>이미지 URL을 입력하세요</div>';}
function setStar(n){currentStar=n;updateStarUI();}
function updateStarUI(){document.querySelectorAll('.sr-btn').forEach(b=>b.classList.toggle('on',parseInt(b.dataset.v)<=currentStar));const lbl=document.getElementById('starLabel');if(lbl)lbl.textContent=currentStar?STAR_LABELS[currentStar]:'';}
function renderStarPicker(){const row=document.getElementById('starRow');if(!row)return;row.innerHTML='';for(let i=1;i<=5;i++){const btn=document.createElement('button');btn.className='sr-btn';btn.dataset.v=i;btn.textContent='★';btn.onclick=()=>setStar(currentStar===i?0:i);row.appendChild(btn);}const lbl=document.createElement('span');lbl.id='starLabel';lbl.className='star-label';row.appendChild(lbl);updateStarUI();}// 상태 전환 시 관련 날짜 자동 제안 (읽는중→읽기 시작일 / 완독→완독일)
function setStatus(v){
  const t=localDate();
  if(v==='읽는중'&&currentStatusVal!=='읽는중'){
    const ds=document.getElementById('f-datestart');
    if(ds&&!ds.value){ds.value=t;showToast('읽기 시작일을 오늘('+t+')로 자동 입력했어요.');}
  }
  if(v==='완독'&&currentStatusVal!=='완독'){
    const de=document.getElementById('f-dateend');
    if(de&&!de.value){de.value=t;showToast('완독일을 오늘('+t+')로 자동 입력했어요.');}
  }
  if(v==='하차'&&currentStatusVal!=='하차'){
    const dd=document.getElementById('f-dnf-date');
    if(dd&&!dd.value)dd.value=t;
  }
  currentStatusVal=v;updateStatusUI();
}
function updateStatusUI(){
  document.querySelectorAll('.st-opt').forEach(b=>b.classList.toggle('sel-on',b.dataset.v===currentStatusVal));
  const dnf=document.getElementById('dnfFields');
  if(dnf){dnf.style.display=currentStatusVal==='하차'?'flex':'none';autosizeEl(document.getElementById('f-dnf-reason'));}
}

const EXC_SPEAKERS=[{v:'남주',label:'💙 남주'},{v:'여주',label:'🩷 여주'},{v:'서브남',label:'🩵 서브남'},{v:'기타',label:'💬 기타'}];
function excSpeakerLabel(v){return(EXC_SPEAKERS.find(s=>s.v===v)||{}).label||'';}
function addExcerpt(){excerptsData.push({id:uid(),text:'',location:'',reason:'',speaker:'',tags:[],open:true});renderExcerpts();}
function setExcerptSpeaker(id,v){const e=excerptsData.find(x=>x.id===id);if(!e)return;e.speaker=e.speaker===v?'':v;renderExcerpts();}
function addExcerptTag(id,val){const e=excerptsData.find(x=>x.id===id);if(!e)return;let v=(val||'').trim();if(!v)return;if(!v.startsWith('#'))v='#'+v;e.tags=e.tags||[];if(!e.tags.includes(v))e.tags.push(v);renderExcerpts();}
function removeExcerptTag(id,tag){const e=excerptsData.find(x=>x.id===id);if(!e)return;e.tags=(e.tags||[]).filter(t=>t!==tag);renderExcerpts();}
function removeExcerpt(id){excerptsData=excerptsData.filter(e=>e.id!==id);renderExcerpts();}
function toggleExcerpt(id){const e=excerptsData.find(x=>x.id===id);if(e)e.open=!e.open;renderExcerpts();}
function syncExcerpt(id,field,val){const e=excerptsData.find(x=>x.id===id);if(e)e[field]=val;}
function renderExcerpts(){const wrap=document.getElementById('excerptsWrap');if(!excerptsData.length){wrap.innerHTML='';return;}wrap.innerHTML=excerptsData.map((e,idx)=>`<div class="excerpt-item"><div class="excerpt-head" onclick="toggleExcerpt('${e.id}')"><span class="exc-arrow ${e.open?'open':''}">&#9654;</span><span style="font-size:11px;color:var(--acc);font-weight:600">발췌 ${idx+1}</span><span class="exc-summary">${e.text?escHtml(e.text.slice(0,60))+'…':'(내용 없음)'}</span><button class="exc-del" onclick="event.stopPropagation();removeExcerpt('${e.id}')">✕</button></div><div class="excerpt-body ${e.open?'open':''}"><div class="fg"><label>위치</label><input type="text" value="${escHtml(e.location||'')}" placeholder="예: 2권 147p" oninput="syncExcerpt('${e.id}','location',this.value)"></div><div class="fg"><label>발췌 문장</label><textarea rows="3" placeholder="발췌할 구절..." oninput="syncExcerpt('${e.id}','text',this.value);autosizeEl(this)">${escHtml(e.text||'')}</textarea></div><div class="fg"><label>발췌 이유</label><textarea rows="2" placeholder="이 구절을 고른 이유..." oninput="syncExcerpt('${e.id}','reason',this.value);autosizeEl(this)">${escHtml(e.reason||'')}</textarea></div>${renderExcerptMetaEditor(e)}</div></div>`).join('');wrap.querySelectorAll('textarea').forEach(autosizeEl);}
function renderExcerptMetaEditor(e){
  const tags=e.tags||[];
  const speakerBtns=EXC_SPEAKERS.map(s=>`<button type="button" class="exc-speaker-opt${e.speaker===s.v?' on':''}" onclick="setExcerptSpeaker('${e.id}','${s.v}')">${s.label}</button>`).join('');
  const selTags=tags.map(t=>`<span class="stag">${escHtml(t)} <button class="stag-del" data-tag="${encodeURIComponent(t)}" onclick="removeExcerptTag('${e.id}',decodeURIComponent(this.dataset.tag))">✕</button></span>`).join('');
  return`<div class="fg"><label>누구의 대사?</label><div class="exc-speaker-row">${speakerBtns}</div></div><div class="fg"><label>발췌 태그</label><div class="ctag-wrap"><div class="ctag-input-row"><input type="text" placeholder="#명대사, #설렘 ..." onkeydown="if(event.key==='Enter'){event.preventDefault();addExcerptTag('${e.id}',this.value);}"><button class="ctag-add-btn" onclick="addExcerptTag('${e.id}',this.previousElementSibling.value)">+</button></div><div class="selected-tags">${selTags}</div></div></div>`;
}
function saveBook(){
  try{
    const title=document.getElementById('f-title').value.trim();if(!title){showToast('제목을 입력해주세요.');return;}
    const genreArr=currentGenreTags.map(t=>t.trim()).filter(Boolean);
    const clean=excerptsData.filter(e=>e.text.trim()).map(({id,text,location,reason,speaker,tags})=>({id,text:text.trim(),location:(location||'').trim(),reason:(reason||'').trim(),speaker:speaker||'',tags:tags||[]}));
    const bookData={id:editId||uid(),title,author:document.getElementById('f-author').value.trim(),genre:genreArr,booktype:document.getElementById('f-booktype').value,agerating:document.getElementById('f-agerating').value,platform:document.getElementById('f-platform').value.trim(),platformurl:document.getElementById('f-platformurl')?.value.trim()||'',rereads:rereadData.map(r=>({...r})),purchases:purchasesData.filter(p=>Number(p.amount)>0).map(({id,date,amount,memo})=>({id,date:date||'',amount:Number(amount),memo:(memo||'').trim()})),price:Number(document.getElementById('f-price').value)||0,status:currentStatusVal,sojaiTags:[...currentCtagsSojai],relTags:[...currentCtagsRel],flTypeTags:[...currentFlTypeTags],moods:[...currentMoods],rating:currentStar,summary:document.getElementById('f-summary').value.trim(),review:document.getElementById('f-review').value.trim(),memo:document.getElementById('f-memo')?.value.trim()||'',excerpts:clean,cover:currentCover,ml:mlData.filter(m=>m.name||m.age||(m.typeTags&&m.typeTags.length)||m.intro).map(m=>({name:m.name||'',age:m.age||'',typeTags:m.typeTags||[],intro:m.intro||'',sub:!!m.sub})),fl:{name:document.getElementById('f-fl-name').value.trim(),age:document.getElementById('f-fl-age').value.trim(),typeTags:[...currentFlTypeTags],intro:document.getElementById('f-fl-intro')?.value.trim()||''},datebuy:document.getElementById('f-datebuy').value,datestart:document.getElementById('f-datestart').value,dateend:document.getElementById('f-dateend').value,dnfAt:document.getElementById('f-dnf-at').value.trim(),dnfDate:document.getElementById('f-dnf-date').value,dnfReason:document.getElementById('f-dnf-reason').value.trim(),updatedAt:new Date().toISOString()};
    if(editId){const idx=books.findIndex(b=>b.id===editId);if(idx===-1){showToast('저장할 책을 찾을 수 없어요.');return;}bookData.createdAt=books[idx].createdAt||bookData.updatedAt;bookData.fav=books[idx].fav||false;books[idx]=bookData;}else{bookData.createdAt=bookData.updatedAt;books.unshift(bookData);}
    saveData().then(()=>{render();closeEdit();showToast(editId?'수정되었어요!':'책이 추가되었어요!');}).catch(e=>{console.error('saveBook catch:',e);showToast('저장 중 오류가 발생했어요: '+e.message);});
  }catch(e){
    console.error('saveBook error:',e);
    showToast('저장 중 예기치 않은 오류가 발생했어요: '+e.message);
  }
}
async function deleteBook(){const b=books.find(x=>x.id===editId);if(!b)return;const ok=await showConfirm('책 삭제','"'+b.title+'" 을(를) 삭제할까요? 이 작업은 되돌릴 수 없어요.','삭제');if(!ok)return;books=books.filter(x=>x.id!==editId);await saveData();render();closeEdit();showToast('삭제되었어요.');}

// ══════════════ 책 상세 페이지 ══════════════
let _detailId=null;
function getSimilarBooks(b){
  const bG=new Set(b.genre||[]);
  const bT=new Set([...(b.sojaiTags||b.tags||[]),...(b.relTags||b.themes||[])]);
  return books.filter(x=>x.id!==b.id).map(x=>{
    let score=0;const shared=[];
    (x.genre||[]).forEach(g=>{if(bG.has(g)){score+=3;shared.push(g);}});
    [...(x.sojaiTags||x.tags||[]),...(x.relTags||x.themes||[])].forEach(t=>{if(bT.has(t)){score+=1;shared.push(t);}});
    return{book:x,score,why:shared.filter(s=>s.startsWith('#'))[0]||shared[0]||''};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,6);
}
function quoteCardHtml(e,b,withSrc){
  const spk=e.speaker?`<span class="chip q-speaker sp-${escHtml(e.speaker)}">${escHtml(e.speaker)}</span>`:'';
  const tags=(e.tags||[]).map(t=>`<button type="button" class="chip q-tag" data-tag="${encodeURIComponent(t)}" onclick="openExcerptTag(decodeURIComponent(this.dataset.tag))">${escHtml(t)}</button>`).join('');
  const src=withSrc?`<figcaption class="quote-src" onclick="openDetail('${b.id}')">${coverHtml(b)}<span>「${escHtml(b.title)}」 ${escHtml(e.location||'')}</span></figcaption>`:(e.location?`<figcaption class="hint">${escHtml(e.location)}</figcaption>`:'');
  return`<figure class="quote-card">${spk||tags?`<div class="quote-chips">${spk}${tags}</div>`:''}<blockquote class="quote-text">${escHtml(e.text)}</blockquote>${e.reason?`<p class="quote-reason">고른 이유 · ${escHtml(e.reason)}</p>`:''}${src}</figure>`;
}
function leadCardHtml(label,cls,p,tags){
  return`<div class="card lead-card"><div class="lead-label ${cls}">${label}</div><div class="lead-name">${escHtml(p.name||'이름 미입력')}${p.age?`<small>${escHtml(p.age)}</small>`:''}</div>${tags.length?`<div class="tag-group">${tags.map(t=>tagBtn(t,'ctag-detail '+(cls==='sub'?'ml':cls))).join('')}</div>`:''}${p.intro?`<p class="lead-intro">${escHtml(p.intro)}</p>`:''}</div>`;
}
function fmtMD(d){if(!d)return'';const[y,m,dd]=d.split('-');return`${y}.${m}.${dd}`;}
function renderDetail(id){
  const el=document.getElementById('detailPage');
  const b=books.find(x=>x.id===id);if(!b||!el)return false;
  const genreBadges=(b.genre||[]).map(gn=>{const gi=getGenre(gn);return`<span class="det-badge" style="background:${hexToRgba(gi.color,.18)};color:var(--txt)">${escHtml(gn)}</span>`;}).join('');
  const statusBadge=b.status?`<span class="det-badge st-${b.status}" style="background:var(--bg2)">${STATUS_LABEL[b.status]||escHtml(b.status)}</span>`:'';
  const ageBadge=b.agerating?`<span class="det-badge age-${b.agerating}">${escHtml(b.agerating)}</span>`:'';
  const url=safeUrl(b.platformurl);
  const platform=b.platform?(url?`<a href="${escHtml(url)}" target="_blank" rel="noopener noreferrer">${escHtml(b.platform)}에서 보기</a>`:escHtml(b.platform)):'';
  const authorLine=[escHtml(b.author||'작가 미상'),platform,escHtml(b.booktype||'')].filter(Boolean).join(' · ');
  const moods=(b.moods||[]).map(m=>{const mo=MOOD_OPTIONS.find(x=>x.label===m);return mo?`<span class="mood-tag" style="background:${mo.bg};color:${mo.color}">${mo.emoji} ${escHtml(m)}</span>`:'';}).join('');
  const sojai=b.sojaiTags||b.tags||[],rel=b.relTags||b.themes||[];
  const tagRows=(sojai.length?`<span class="tag-group-label">소재</span><div class="tag-group">${sojai.map(t=>tagBtn(t,'ctag-detail ctag-click')).join('')}</div>`:'')+(rel.length?`<span class="tag-group-label">관계</span><div class="tag-group">${rel.map(t=>tagBtn(t,'ctag-detail rel ctag-click')).join('')}</div>`:'');
  const spend=bookSpend(b);const readDays=daysBetween(b.datestart,b.dateend);
  const chips=[spend?`<span class="mchip">${fmtPrice(spend)}${(b.purchases||[]).length?` · 추가 구매 ${b.purchases.length}건 포함`:''}</span>`:'',(b.rereads&&b.rereads.length)?`<span class="mchip">${b.rereads.length}회 재독</span>`:''].filter(Boolean).join('');
  const dates=[b.datebuy?`<span>구매 ${fmtMD(b.datebuy)}</span>`:'',b.datestart?`<span>시작 ${fmtMD(b.datestart)}</span>`:'',b.dateend?`<span>완독 ${fmtMD(b.dateend)}</span>`:'',readDays?`<b>${readDays}일 만에 완독</b>`:''].filter(Boolean).join('');
  let h=`<button class="det-back" onclick="closeDetail()">← 돌아가기</button>
  <section class="det-top"><div class="det-cover">${coverHtml(b)}</div><div class="det-info">
    <div class="det-badges">${genreBadges}${statusBadge}${ageBadge}</div>
    <h1 class="det-title">${escHtml(b.title)}</h1>
    <div class="det-author">${authorLine}</div>
    ${b.rating?`<div class="det-stars" aria-label="별점 ${b.rating}점">${'★'.repeat(b.rating)}<span style="color:var(--line2)">${'★'.repeat(5-b.rating)}</span></div>`:''}
    ${moods?`<div class="det-moods">${moods}</div>`:''}
    ${tagRows?`<div class="tag-groups">${tagRows}</div>`:''}
    ${chips?`<div class="det-meta">${chips}</div>`:''}
    ${dates?`<div class="det-dates">${dates}</div>`:''}
    <div class="det-actions"><button class="btn primary owner-only" onclick="openEdit('${b.id}')">수정</button><button class="btn" onclick="openShare('${b.id}')">추천 카드 만들기</button><button class="btn owner-only" onclick="toggleFav('${b.id}')">${b.fav?'★ 즐겨찾기 해제':'☆ 즐겨찾기'}</button></div>
  </div></section>`;
  const mlArr=Array.isArray(b.ml)?b.ml:(b.ml&&b.ml.name?[b.ml]:[]);
  const fl=b.fl||{};const flTags=[...new Set([...(b.flTypeTags||[]),...(fl.typeTags||[])])];
  const leads=[...mlArr.filter(m=>!m.sub).map(m=>leadCardHtml('남주','ml',m,m.typeTags||[])),(fl.name||flTags.length||fl.intro)?leadCardHtml('여주','fl',fl,flTags):'',...mlArr.filter(m=>m.sub).map(m=>leadCardHtml('서브남','sub',m,m.typeTags||[]))].filter(Boolean).join('');
  if(leads)h+=`<section class="det-sec"><h2>주인공</h2><div class="lead-grid">${leads}</div></section>`;
  if(b.status==='하차'&&(b.dnfAt||b.dnfDate||b.dnfReason)){
    const meta=[b.dnfAt?`<span class="mchip">${escHtml(b.dnfAt)}에서 하차</span>`:'',b.dnfDate?`<span class="mchip">${fmtMD(b.dnfDate)}</span>`:''].filter(Boolean).join('');
    h+=`<section class="det-sec"><h2>하차 기록</h2><div class="dnf-detail">${meta?`<div class="det-meta">${meta}</div>`:''}${b.dnfReason?`<p>${escHtml(b.dnfReason)}</p>`:''}</div></section>`;
  }
  if(b.summary)h+=`<section class="det-sec"><h2>줄거리</h2><p class="det-text">${escHtml(b.summary)}</p></section>`;
  if(b.review)h+=`<section class="det-sec"><h2>총평</h2><p class="det-text">${escHtml(b.review)}</p></section>`;
  const exc=(b.excerpts||[]).filter(e=>e.text);
  if(exc.length)h+=`<section class="det-sec"><div class="sec-head"><h2>발췌<small>${exc.length}개</small></h2><button class="link-btn" onclick="switchPage('excerpts')">발췌함에서 보기</button></div><div class="quote-grid">${exc.map(e=>quoteCardHtml(e,b,false)).join('')}</div></section>`;
  if(b.memo)h+=`<section class="det-sec"><h2>메모<small>스포일러 포함</small></h2><button class="memo-hidden" onclick="this.hidden=true;this.nextElementSibling.hidden=false">눌러서 메모 보기</button><div class="memo-box" hidden>${escHtml(b.memo)}</div></section>`;
  if(b.rereads&&b.rereads.length)h+=`<section class="det-sec"><h2>재독 기록</h2><div class="reread-list">${b.rereads.map(r=>`<div class="reread-item"><span class="reread-num">${r.nth||1}회독</span><span class="hint">${fmtMD(r.date)}</span>${r.note?`<span>${escHtml(r.note)}</span>`:''}</div>`).join('')}</div></section>`;
  const sim=getSimilarBooks(b);
  if(sim.length)h+=`<section class="det-sec"><h2>비슷한 책</h2><div class="similar-grid">${sim.map(({book:s,why})=>`<div class="similar-item" onclick="openDetail('${s.id}')">${coverHtml(s)}<div class="similar-title">${escHtml(s.title)}</div>${why?`<div class="similar-reason">${escHtml(why)}</div>`:''}</div>`).join('')}</div></section>`;
  el.innerHTML=h;
  return true;
}
function openDetail(id){
  if(_currentPage!=='detail')_prevPage=_currentPage;
  _detailId=id;
  if(renderDetail(id))switchPage('detail');
}
function closeDetail(){switchPage(_prevPage&&_prevPage!=='detail'?_prevPage:'library');}

// ══════════════ 재독 기록 ══════════════
function addReread(){const nth=rereadData.length+1;rereadData.push({id:uid(),nth,date:localDate(),note:''});renderRereadList();}
function removeReread(id){rereadData=rereadData.filter(r=>r.id!==id);rereadData.forEach((r,i)=>{r.nth=i+1;});renderRereadList();}
function renderRereadList(){const el=document.getElementById('rereadList');if(!el)return;el.innerHTML=rereadData.map(r=>`<div class="reread-item"><span class="reread-num">제${r.nth}회독</span><input type="date" value="${r.date||''}" style="flex:0 0 120px;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px 7px;font-family:var(--font-body);font-size:12px;color:var(--txt)" oninput="rereadData.find(x=>x.id==='${r.id}').date=this.value"><input type="text" value="${escHtml(r.note||'')}" placeholder="메모" style="flex:1;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px 7px;font-family:var(--font-body);font-size:12px;color:var(--txt)" oninput="rereadData.find(x=>x.id==='${r.id}').note=this.value"><button class="reread-del" onclick="removeReread('${r.id}')">✕</button></div>`).join('');}

// ══════════════ 추가 구매 기록 ══════════════
function addPurchase(){purchasesData.push({id:uid(),date:localDate(),amount:'',memo:''});renderPurchaseList();}
function removePurchase(id){purchasesData=purchasesData.filter(p=>p.id!==id);renderPurchaseList();}
function syncPurchase(id,field,val){const p=purchasesData.find(x=>x.id===id);if(p)p[field]=val;}
function renderPurchaseList(){const el=document.getElementById('purchaseList');if(!el)return;el.innerHTML=purchasesData.map(p=>`<div class="reread-item"><input type="date" value="${p.date||''}" class="purchase-input" style="flex:0 0 130px" oninput="syncPurchase('${p.id}','date',this.value)"><input type="number" min="0" value="${p.amount||''}" placeholder="금액" class="purchase-input" style="flex:0 0 100px" oninput="syncPurchase('${p.id}','amount',this.value)"><input type="text" value="${escHtml(p.memo||'')}" placeholder="메모 (예: 외전 1~5화)" class="purchase-input" style="flex:1" oninput="syncPurchase('${p.id}','memo',this.value)"><button class="reread-del" onclick="removePurchase('${p.id}')">✕</button></div>`).join('');}
