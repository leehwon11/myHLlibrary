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
    const mlArr=Array.isArray(b.ml)?b.ml:(b.ml&&b.ml.name?[b.ml]:[]);const fl=b.fl||{};
    const leadWords=[...mlArr.flatMap(m=>[m.name,...(m.typeTags||[])]),fl.name,...(b.flTypeTags||[]),...(fl.typeTags||[])];
    const qm=!q||[b.title,b.author,callNumber(b),...bG,...allTags,...leadWords,...(b.moods||[]),...excTags].filter(Boolean).join(' ').toLowerCase().includes(q);
    return gm&&sm&&fm&&qm;
  });
  if(sort==='newest')list.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  else if(sort==='oldest')list.sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  else if(sort==='rating-desc')list.sort((a,b)=>(b.rating||0)-(a.rating||0));
  else if(sort==='rating-asc')list.sort((a,b)=>(a.rating||0)-(b.rating||0));
  else if(sort==='callno')list.sort((a,b)=>callNumber(a).localeCompare(callNumber(b),'ko',{numeric:true}));
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
  const allTags=[...(b.genre||[]).slice(0,1),...(b.sojaiTags||b.tags||[]),...(b.relTags||b.themes||[])];
  const tags=allTags.slice(0,3).map(t=>tagBtn(t,'ctag ctag-click')).join('');
  const stLabel=b.status==='하차'&&b.dnfAt?'하차 · '+escHtml(b.dnfAt):(STATUS_LABEL[b.status]||escHtml(b.status||''));
  const st=b.status?`<span class="stamp st-${b.status}">${stLabel}</span>`:'';
  const fav=`<button class="fav-btn owner-only${b.fav?' on':''}" onclick="event.stopPropagation();toggleFav('${b.id}')" aria-label="${b.fav?'즐겨찾기 해제':'즐겨찾기'}"><span class="fav-star">★</span></button>`;
  const reread=(b.rereads&&b.rereads.length)?`<span class="bc-reread">${b.rereads.length}회 재독</span>`:'';
  const age=b.agerating&&b.agerating!=='전체'?`<span class="age-badge age-${b.agerating}">${parseInt(b.agerating)||escHtml(b.agerating)}</span>`:'';
  const titleHl=q?highlight(b.title,q):escHtml(b.title);
  const authorHl=q?highlight(b.author||'작가 미상',q):escHtml(b.author||'작가 미상');
  const mood=b.moods&&b.moods.length?`<span class="bc-mood">${escHtml(b.moods[0])}</span>`:'';
  const foot=[b.rating?`<span class="bc-stars" aria-label="별점 ${b.rating}점">${'★'.repeat(b.rating)}</span>`:'',reread,mood].filter(Boolean).join('');
  return`<div class="book-card" draggable="true" data-id="${b.id}" onclick="openDetail('${b.id}')" ondragstart="onDragStart(event,'${b.id}')" ondragover="onDragOver(event)" ondrop="onDrop(event,'${b.id}')" ondragleave="onDragLeave(event)" ondragend="onDragEnd(event)">${coverHtml(b)}<div class="bc-body"><div class="bc-top"><span class="bc-call">${q?highlight(callNumber(b),q):escHtml(callNumber(b))}</span>${age}</div><div class="bc-title">${titleHl}</div><div class="bc-meta">${authorHl}${b.platform?' · '+escHtml(b.platform):''}</div>${tags?`<div class="bc-tags">${tags}</div>`:''}${foot?`<div class="bc-foot">${foot}</div>`:''}</div>${fav}${st}</div>`;
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
function openAdd(){if(VIEW_MODE)return;editId=null;currentCover=null;currentStar=0;currentStatusVal='읽고싶어요';excerptsData=[];currentCtagsSojai=[];currentCtagsRel=[];currentFlTypeTags=[];currentGenreTags=[];currentMoods=[];mlData=[];rereadData=[];document.getElementById('editModalTitle').textContent='도서 등록부 · 새 책';document.getElementById('delBtn').style.display='none';clearForm();renderExcerpts();updateStatusUI();renderTagsSojai();renderTagsRel();renderFlTypeTags();renderMoodSelector();renderGenreTags();renderStarPicker();renderChoices();renderFlPhoto();updateCallnoHint();document.getElementById('editOv').classList.add('open');document.querySelector('#editOv .modal-body').scrollTop=0;}
function openEdit(id){
  if(VIEW_MODE)return;
  const b=books.find(x=>x.id===id);if(!b)return;
  editId=id;currentStar=b.rating||0;currentCover=b.cover||null;currentStatusVal=b.status||'완독';excerptsData=(b.excerpts||[]).map(e=>({...e,open:false}));currentMoods=b.moods?[...b.moods]:[];
  document.getElementById('editModalTitle').textContent='도서 등록부 · 수정';document.getElementById('delBtn').style.display='block';
  document.getElementById('f-title').value=b.title||'';document.getElementById('f-author').value=b.author||'';
  currentCtagsSojai=b.sojaiTags?[...b.sojaiTags]:[...(b.tags||[]),...(b.themes||[])];currentCtagsRel=b.relTags?[...b.relTags]:[];currentFlTypeTags=b.flTypeTags?[...b.flTypeTags]:(b.fl&&b.fl.typeTags?[...b.fl.typeTags]:[]);
  renderTagsSojai();renderTagsRel();renderFlTypeTags();renderMoodSelector();
  mlData=Array.isArray(b.ml)?b.ml.map(m=>({...m,id:m.id||uid(),typeTags:m.typeTags||[],open:false})):(b.ml&&b.ml.name?[{...b.ml,id:uid(),typeTags:[],open:false}]:[]);renderMlAcc();
  const fl=b.fl||{};currentFlPhoto=fl.photo||'';renderFlPhoto();document.getElementById('f-fl-name').value=fl.name||'';document.getElementById('f-fl-age').value=fl.age||'';const fliEl=document.getElementById('f-fl-intro');if(fliEl)fliEl.value=fl.intro||'';
  document.getElementById('f-summary').value=b.summary||'';document.getElementById('f-review').value=b.review||'';const memoEl=document.getElementById('f-memo');if(memoEl)memoEl.value=b.memo||'';document.getElementById('f-booktype').value=b.booktype||'';document.getElementById('f-agerating').value=b.agerating||'';
  document.getElementById('f-platform').value=b.platform||'';document.getElementById('f-callno').value=b.callNo||'';const pue=document.getElementById('f-platformurl');if(pue)pue.value=b.platformurl||'';
  rereadData=(b.rereads||[]).map(r=>({...r}));renderRereadList();
  purchasesData=(b.purchases||[]).map(p=>({...p}));renderPurchaseList();
  document.getElementById('f-price').value=b.price||'';document.getElementById('f-datebuy').value=b.datebuy||'';document.getElementById('f-datestart').value=b.datestart||'';document.getElementById('f-dateend').value=b.dateend||'';
  document.getElementById('f-dnf-at').value=b.dnfAt||'';document.getElementById('f-dnf-date').value=b.dnfDate||'';document.getElementById('f-dnf-reason').value=b.dnfReason||'';

  currentGenreTags=Array.isArray(b.genre)?[...b.genre]:(b.genre?[b.genre]:[]);renderGenreTags();
  document.getElementById('coverBox').innerHTML=currentCover?`<img src="${currentCover}" alt="">`:COVER_HINT;
  renderStarPicker();updateStatusUI();renderExcerpts();renderChoices();updateCallnoHint();
  ['f-summary','f-review','f-memo','f-fl-intro'].forEach(id=>autosizeEl(document.getElementById(id)));
  document.getElementById('editOv').classList.add('open');document.querySelector('#editOv .modal-body').scrollTop=0;
}
function clearForm(){currentFlPhoto='';['f-title','f-author','f-callno','f-summary','f-review','f-memo','f-platform','f-platformurl','f-price','f-datebuy','f-datestart','f-dateend','f-fl-name','f-fl-age','f-fl-intro','f-dnf-at','f-dnf-date','f-dnf-reason'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});rereadData=[];renderRereadList();purchasesData=[];renderPurchaseList();currentGenreTags=[];renderGenreTags();mlData=[];renderMlAcc();document.getElementById('f-booktype').value='';document.getElementById('f-agerating').value='';document.getElementById('coverBox').innerHTML=COVER_HINT;currentCtagsSojai=[];currentCtagsRel=[];currentFlTypeTags=[];renderTagsSojai();renderTagsRel();renderFlTypeTags();updateStarUI();['f-summary','f-review','f-memo','f-fl-intro'].forEach(id=>autosizeEl(document.getElementById(id)));}
function jumpEdit(id){const el=document.getElementById(id);if(el)el.scrollIntoView({block:'start',behavior:'smooth'});}
function closeEdit(){document.getElementById('editOv').classList.remove('open');}
function removeCover(){currentCover=null;document.getElementById('coverBox').innerHTML=COVER_HINT;}
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

const EXC_SPEAKERS=[{v:'남주',label:'남주'},{v:'여주',label:'여주'},{v:'서브남',label:'서브남'},{v:'기타',label:'기타'}];
function excSpeakerLabel(v){return(EXC_SPEAKERS.find(s=>s.v===v)||{}).label||'';}
function addExcerpt(){excerptsData.push({id:uid(),text:'',location:'',reason:'',speaker:'',tags:[],open:true});renderExcerpts();}
function setExcerptSpeaker(id,v){const e=excerptsData.find(x=>x.id===id);if(!e)return;e.speaker=e.speaker===v?'':v;renderExcerpts();}
function addExcerptTag(id,val){const e=excerptsData.find(x=>x.id===id);if(!e)return;let v=(val||'').trim();if(!v)return;if(!v.startsWith('#'))v='#'+v;e.tags=e.tags||[];if(!e.tags.includes(v))e.tags.push(v);renderExcerpts();document.querySelector(`[data-tagin="${id}"]`)?.focus();}
function removeExcerptTag(id,tag){const e=excerptsData.find(x=>x.id===id);if(!e)return;e.tags=(e.tags||[]).filter(t=>t!==tag);renderExcerpts();}
function removeExcerpt(id){excerptsData=excerptsData.filter(e=>e.id!==id);renderExcerpts();}
function toggleExcerpt(id){const e=excerptsData.find(x=>x.id===id);if(e)e.open=!e.open;renderExcerpts();}
function syncExcerpt(id,field,val){const e=excerptsData.find(x=>x.id===id);if(e)e[field]=val;}
function renderExcerpts(){
  const wrap=document.getElementById('excerptsWrap');if(!wrap)return;
  const lbl=document.getElementById('excCountLabel');if(lbl)lbl.textContent=excerptsData.length?`색인 카드 ${excerptsData.length}장`:'';
  wrap.innerHTML=excerptsData.map((e,idx)=>`<div class="exc-card"><div class="exc-card-head"><span class="exc-card-no">CARD ${String(idx+1).padStart(2,'0')}</span><label class="exc-loc">위치<input type="text" value="${escHtml(e.location||'')}" placeholder="87화" oninput="syncExcerpt('${e.id}','location',this.value)"></label><button type="button" class="exc-del" aria-label="발췌 ${idx+1} 삭제" onclick="removeExcerpt('${e.id}')">✕</button></div><textarea class="exc-text" rows="2" aria-label="발췌 문장 ${idx+1}" placeholder="마음에 남은 문장을 옮겨 적어요" oninput="syncExcerpt('${e.id}','text',this.value);autosizeEl(this)">${escHtml(e.text||'')}</textarea><div class="exc-card-foot">${renderExcerptMetaEditor(e)}</div></div>`).join('');
  wrap.querySelectorAll('textarea').forEach(autosizeEl);
}
function renderExcerptMetaEditor(e){
  const speakerBtns=EXC_SPEAKERS.map(s=>`<button type="button" class="exc-speaker-opt${e.speaker===s.v?' on':''}" aria-pressed="${e.speaker===s.v}" onclick="setExcerptSpeaker('${e.id}','${s.v}')">${s.label}</button>`).join('');
  const selTags=(e.tags||[]).map(t=>`<span class="stag">${escHtml(t)}<button type="button" class="stag-del" aria-label="${escHtml(t)} 태그 지우기" data-tag="${encodeURIComponent(t)}" onclick="removeExcerptTag('${e.id}',decodeURIComponent(this.dataset.tag))">✕</button></span>`).join('');
  return`<div class="exc-line"><span class="cap">화자</span><div class="exc-speaker-row" role="group" aria-label="화자">${speakerBtns}</div></div><div class="exc-line"><span class="cap">태그</span><div class="exc-tags">${selTags}<input type="text" data-tagin="${e.id}" placeholder="입력 후 Enter" aria-label="발췌 태그 입력" onkeydown="if(event.key==='Enter'){event.preventDefault();addExcerptTag('${e.id}',this.value);}"></div></div><div class="exc-line"><span class="cap">이유</span><input class="exc-reason" type="text" value="${escHtml(e.reason||'')}" placeholder="이 문장을 고른 이유 (선택)" aria-label="고른 이유" oninput="syncExcerpt('${e.id}','reason',this.value)"></div>`;
}
function saveBook(){
  try{
    const title=document.getElementById('f-title').value.trim();if(!title){showToast('제목을 입력해주세요.');return;}
    const genreArr=currentGenreTags.map(t=>t.trim()).filter(Boolean);
    const clean=excerptsData.filter(e=>e.text.trim()).map(({id,text,location,reason,speaker,tags})=>({id,text:text.trim(),location:(location||'').trim(),reason:(reason||'').trim(),speaker:speaker||'',tags:tags||[]}));
    const bookData={id:editId||uid(),title,author:document.getElementById('f-author').value.trim(),callNo:document.getElementById('f-callno').value.trim(),genre:genreArr,booktype:document.getElementById('f-booktype').value,agerating:document.getElementById('f-agerating').value,platform:document.getElementById('f-platform').value.trim(),platformurl:document.getElementById('f-platformurl')?.value.trim()||'',rereads:rereadData.map(r=>({...r})),purchases:purchasesData.filter(p=>Number(p.amount)>0).map(({id,date,amount,memo})=>({id,date:date||'',amount:Number(amount),memo:(memo||'').trim()})),price:Number(document.getElementById('f-price').value)||0,status:currentStatusVal,sojaiTags:[...currentCtagsSojai],relTags:[...currentCtagsRel],flTypeTags:[...currentFlTypeTags],moods:[...currentMoods],rating:currentStar,summary:document.getElementById('f-summary').value.trim(),review:document.getElementById('f-review').value.trim(),memo:document.getElementById('f-memo')?.value.trim()||'',excerpts:clean,cover:currentCover,ml:mlData.filter(m=>m.name||m.age||(m.typeTags&&m.typeTags.length)||m.intro||m.photo).map(m=>({name:m.name||'',age:m.age||'',typeTags:m.typeTags||[],intro:m.intro||'',sub:!!m.sub,photo:safePhoto(m.photo)})),fl:{photo:safePhoto(currentFlPhoto),name:document.getElementById('f-fl-name').value.trim(),age:document.getElementById('f-fl-age').value.trim(),typeTags:[...currentFlTypeTags],intro:document.getElementById('f-fl-intro')?.value.trim()||''},datebuy:document.getElementById('f-datebuy').value,datestart:document.getElementById('f-datestart').value,dateend:document.getElementById('f-dateend').value,dnfAt:document.getElementById('f-dnf-at').value.trim(),dnfDate:document.getElementById('f-dnf-date').value,dnfReason:document.getElementById('f-dnf-reason').value.trim(),updatedAt:new Date().toISOString()};
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
function quoteCardHtml(e,b,withSrc,i){
  const spkCls=e.speaker?' spk-'+escHtml(e.speaker):'';
  const spk=e.speaker?`<span class="q-speaker${spkCls}">${escHtml(e.speaker)}</span>`:'';
  const tags=(e.tags||[]).map(t=>`<button type="button" class="q-tag" data-tag="${encodeURIComponent(t)}" onclick="openExcerptTag(decodeURIComponent(this.dataset.tag))">${escHtml(t)}</button>`).join(' ');
  const tilt=withSrc?['-1deg','.8deg','-.4deg','1.2deg'][(i||0)%4]:'0deg';
  const src=withSrc?`<button type="button" class="quote-src" onclick="openDetail('${b.id}')">${escHtml(b.title)}</button>`:'<span></span>';
  return`<figure class="quote-card${spkCls}" style="--tilt:${tilt}"><div class="quote-top"><span>${withSrc&&i!=null?'No. '+String(i+1).padStart(3,'0'):''}</span><span>${escHtml(e.location||'')}</span></div><blockquote class="quote-text">${escHtml(e.text)}</blockquote>${e.reason?`<p class="quote-reason">고른 이유 · ${escHtml(e.reason)}</p>`:''}${spk||tags||withSrc?`<figcaption class="quote-foot"><div class="quote-foot-row">${src}${spk}</div>${tags?`<div class="quote-chips">${tags}</div>`:''}</figcaption>`:''}</figure>`;
}
function fmtMD(d){if(!d)return'';const[y,m,dd]=d.split('-');return`${y}.${m}.${dd}`;}
function personHtml(role,cls,p,tags){
  const img=safePhoto(p.photo);
  const name=(p.name||'').trim();
  return`<div class="person"><div class="person-photo">${img?`<img src="${escHtml(img)}" alt="${escHtml(name)} 사진">`:escHtml(name.charAt(0)||'?')}</div><div class="person-info"><div class="person-name"><span class="role ${cls}">${role}</span>${escHtml(name||'이름 미입력')}${p.age?`<small>${escHtml(p.age)}</small>`:''}</div>${tags.length?`<div class="person-tags">${role} 유형 · ${tags.map(t=>escHtml(t.replace(/^#/,''))).join(' · ')}</div>`:''}${p.intro?`<p class="person-intro">${escHtml(p.intro)}</p>`:''}</div></div>`;
}
function bookLog(b){
  const rows=[];
  if(b.datebuy||Number(b.price)>0)rows.push({d:b.datebuy||'',kind:'구입',note:'첫 구입',amt:Number(b.price)||0});
  (b.purchases||[]).forEach(p=>rows.push({d:p.date||'',kind:'구입',note:p.memo||'추가 구입',amt:Number(p.amount)||0}));
  if(b.datestart)rows.push({d:b.datestart,kind:'시작',note:'읽기 시작'});
  if(b.dateend){const n=daysBetween(b.datestart,b.dateend);rows.push({d:b.dateend,kind:'완독',note:n?`${n}일 만에 완독`:'완독'});}
  if(b.status==='하차'&&(b.dnfDate||b.dnfAt))rows.push({d:b.dnfDate||'',kind:'하차',note:b.dnfAt?`${b.dnfAt}에서 하차`:'하차'});
  (b.rereads||[]).forEach((r,i)=>rows.push({d:r.date||'',kind:'재독',note:`${r.nth||i+1}번째 재독${r.note?' · '+r.note:''}`}));
  return rows.sort((x,y)=>(x.d||'9999').localeCompare(y.d||'9999'));
}
function renderDetail(id){
  const el=document.getElementById('detailPage');
  const b=books.find(x=>x.id===id);if(!b||!el)return false;
  const url=safeUrl(b.platformurl);
  const where=[b.platform?escHtml(b.platform):'',url?`<a href="${escHtml(url)}" target="_blank" rel="noopener noreferrer">${b.platform?escHtml(b.platform)+'에서 ':''}보기</a>`:''].filter(Boolean).join(' · ')||'—';
  const shape=[b.booktype?escHtml(b.booktype):'',b.agerating?`<span class="age-badge age-${b.agerating}">${escHtml(b.agerating)}</span>`:''].filter(Boolean).join(' ')||'—';
  const order=books.slice().sort((x,y)=>new Date(x.createdAt)-new Date(y.createdAt));
  const no=String(order.indexOf(b)+1).padStart(4,'0');
  const stLabel=STATUS_LABEL[b.status]||'';
  const mlArr=Array.isArray(b.ml)?b.ml:(b.ml&&b.ml.name?[b.ml]:[]);
  const fl=b.fl||{};const flTags=[...new Set([...(b.flTypeTags||[]),...(fl.typeTags||[])])];
  const mlTags=[...new Set(mlArr.filter(m=>!m.sub).flatMap(m=>m.typeTags||[]))];
  const sojai=b.sojaiTags||b.tags||[],rel=b.relTags||b.themes||[];
  const classRow=(label,list)=>`<tr><th scope="row">${label}</th><td>${list.length?`<div class="tag-group">${list.map(t=>tagBtn(t,'ctag-detail')).join('')}</div>`:'<span class="hint">—</span>'}</td></tr>`;
  const people=[...mlArr.filter(m=>!m.sub).map(m=>personHtml('남주','ml',m,m.typeTags||[])),(fl.name||flTags.length||fl.intro||fl.photo)?personHtml('여주','fl',fl,flTags):'',...mlArr.filter(m=>m.sub).map(m=>personHtml('서브남','sub',m,m.typeTags||[]))].filter(Boolean).join('');
  const moods=(b.moods||[]).map(m=>`<span class="mood-stamp">${escHtml(m)}</span>`).join('');
  const exc=(b.excerpts||[]).filter(e=>e.text);
  const log=bookLog(b);
  const spend=bookSpend(b);
  const reads=(b.dateend?1:0)+((b.rereads||[]).length);
  const sim=getSimilarBooks(b);

  let h=`<div class="det-bar"><button class="det-back" onclick="closeDetail()">← 돌아가기</button><div class="det-actions"><button class="btn sm owner-only" onclick="toggleFav('${b.id}')">${b.fav?'★ 즐겨찾기 해제':'☆ 즐겨찾기'}</button><button class="btn sm" onclick="openShare('${b.id}')">추천 카드</button><button class="btn sm primary owner-only" onclick="openEdit('${b.id}')">수정</button></div></div>
  <div class="det-grid"><div class="det-col">
    <section class="loan-card" aria-label="도서 대출 카드">
      <div class="loan-head"><b>도서 대출 카드</b><span>No. ${no}</span></div>
      <div class="loan-body"><div class="loan-rows">
        <div class="loan-row"><span>청구기호</span><b>${escHtml(callNumber(b))}</b></div>
        <div class="loan-row"><span>서명</span><h1 class="loan-title">${escHtml(b.title)}</h1></div>
        <div class="loan-row"><span>저자</span><span>${escHtml(b.author||'작가 미상')}</span></div>
        <div class="loan-row"><span>소장처</span><span>${where}</span></div>
        <div class="loan-row"><span>형태</span><span>${shape}</span></div>
      </div><div class="loan-cover">${coverHtml(b)}</div></div>
      <div class="loan-foot">별점 ${b.rating?`<span class="loan-stars" aria-label="별점 5점 만점에 ${b.rating}점">${'★'.repeat(b.rating)}<span style="color:var(--line)">${'★'.repeat(5-b.rating)}</span></span>`:'<span>아직 없어요</span>'}</div>
      ${stLabel?`<span class="stamp big st-${b.status}">${stLabel}</span>`:''}
    </section>
    <section class="det-sec"><h2>분류</h2><table class="class-table"><tbody>${classRow('장르',b.genre||[])}${classRow('소재',sojai)}${classRow('관계',rel)}${classRow('남주 유형',mlTags)}${classRow('여주 유형',flTags)}</tbody></table></section>
    ${people?`<section class="det-sec"><h2>등장인물</h2><div style="display:flex;flex-direction:column;gap:10px">${people}</div></section>`:''}
  </div><div class="det-col wide">`;
  if(b.status==='하차'&&(b.dnfAt||b.dnfDate||b.dnfReason))h+=`<section class="det-sec"><h2>하차 기록</h2><div class="dnf-detail"><span class="dnf-meta">${[b.dnfAt?escHtml(b.dnfAt)+'에서 하차':'',b.dnfDate?fmtMD(b.dnfDate):''].filter(Boolean).join(' · ')}</span>${b.dnfReason?`<p>${escHtml(b.dnfReason)}</p>`:''}</div></section>`;
  if(b.summary)h+=`<section class="det-sec"><h2>줄거리</h2><p class="det-text">${escHtml(b.summary)}</p></section>`;
  if(b.review||moods)h+=`<section class="det-sec"><h2>후기</h2><div class="review-box">${moods?`<div class="review-moods"><span class="hint">감정</span>${moods}</div>`:''}${b.review?`<p class="review-text">${escHtml(b.review)}</p>`:''}</div></section>`;
  if(exc.length){
    const SHOW=4,rest=exc.length-SHOW;
    h+=`<section class="det-sec"><div class="sec-head"><h2>발췌<small>${exc.length}장</small></h2><button class="link-btn" onclick="openExcerptBook('${b.id}')">발췌함에서 이 책만 보기</button></div><div class="det-quotes">${exc.slice(0,SHOW).map(e=>quoteCardHtml(e,b,false)).join('')}</div>${rest>0?`<div class="det-quotes" id="detExcMore" hidden>${exc.slice(SHOW).map(e=>quoteCardHtml(e,b,false)).join('')}</div><button type="button" class="more-btn-wide" aria-expanded="false" aria-controls="detExcMore" onclick="const m=document.getElementById('detExcMore');m.hidden=!m.hidden;this.setAttribute('aria-expanded',!m.hidden);this.textContent=m.hidden?'나머지 ${rest}장 펼치기':'접기'">나머지 ${rest}장 펼치기</button>`:''}</section>`;
  }
  if(b.memo)h+=`<section class="det-sec"><h2>메모<small>스포일러 포함</small></h2><button class="memo-hidden" onclick="this.hidden=true;this.nextElementSibling.hidden=false">봉인된 메모 · 눌러서 보기</button><div class="memo-box" hidden>${escHtml(b.memo)}</div></section>`;
  h+=`</div></div>`;
  h+=`<section class="det-sec"><div class="sec-head"><h2>대출·구입 기록</h2><button class="link-btn owner-only" onclick="openEdit('${b.id}');setTimeout(()=>jumpEdit('sec-log'),60)">기록 추가</button></div>${log.length?`<div class="log-wrap"><table class="log-table"><thead><tr><th scope="col">날짜</th><th scope="col">구분</th><th scope="col">내용</th><th scope="col" class="num">금액</th></tr></thead><tbody>${log.map(r=>`<tr><td class="nowrap">${r.d?fmtMD(r.d).slice(2):'—'}</td><td><span class="log-kind k-${r.kind}">${r.kind}</span></td><td>${escHtml(r.note)}</td><td class="num">${r.amt?fmtPrice(r.amt):''}</td></tr>`).join('')}<tr class="log-total"><th scope="row" colspan="3">읽은 횟수 ${reads}회${spend?' · 구입 합계':''}</th><td class="num">${spend?`<span class="dbl">${fmtPrice(spend)}</span>`:''}</td></tr></tbody></table></div>`:'<p class="hint">아직 기록이 없어요. 시작일, 완독일, 구입 기록을 넣으면 여기에 쌓여요.</p>'}</section>`;
  if(sim.length)h+=`<section class="det-sec"><h2>비슷한 책</h2><div class="similar-grid">${sim.map(({book:s,why})=>`<button type="button" class="similar-item" onclick="openDetail('${s.id}')">${coverHtml(s)}<span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span class="similar-call">${escHtml(callNumber(s))}</span><span class="similar-title">${escHtml(s.title)}</span>${why?`<span class="similar-reason">${escHtml(why)}</span>`:''}</span></button>`).join('')}</div></section>`;
  el.innerHTML=h;
  return true;
}
function openDetail(id){
  if(_currentPage!=='detail')_prevPage=_currentPage;
  _detailId=id;
  if(renderDetail(id))switchPage('detail');
}
function closeDetail(){if(_navDepth>0)history.back();else switchPage(_prevPage&&_prevPage!=='detail'?_prevPage:'library');}

// ══════════════ 재독 기록 ══════════════
function addReread(){const nth=rereadData.length+1;rereadData.push({id:uid(),nth,date:localDate(),note:''});renderRereadList();}
function removeReread(id){rereadData=rereadData.filter(r=>r.id!==id);rereadData.forEach((r,i)=>{r.nth=i+1;});renderRereadList();}
function renderRereadList(){const el=document.getElementById('rereadList');if(!el)return;el.innerHTML=rereadData.map(r=>`<div class="reread-item"><span class="reread-num">${r.nth}번째</span><input type="date" class="purchase-input" aria-label="${r.nth}번째 재독 날짜" value="${r.date||''}" oninput="rereadData.find(x=>x.id==='${r.id}').date=this.value"><input type="text" class="purchase-input" style="flex:1" aria-label="${r.nth}번째 재독 메모" value="${escHtml(r.note||'')}" placeholder="메모" oninput="rereadData.find(x=>x.id==='${r.id}').note=this.value"><button type="button" class="reread-del" aria-label="${r.nth}번째 재독 지우기" onclick="removeReread('${r.id}')">✕</button></div>`).join('');}
// ══════════════ 추가 구매 기록 ══════════════
function addPurchase(){purchasesData.push({id:uid(),date:localDate(),amount:'',memo:''});renderPurchaseList();}
function removePurchase(id){purchasesData=purchasesData.filter(p=>p.id!==id);renderPurchaseList();}
function syncPurchase(id,field,val){const p=purchasesData.find(x=>x.id===id);if(p)p[field]=val;}
function renderPurchaseList(){const el=document.getElementById('purchaseList');if(!el)return;el.innerHTML=purchasesData.map(p=>`<div class="reread-item"><input type="date" class="purchase-input" aria-label="구입일" value="${p.date||''}" oninput="syncPurchase('${p.id}','date',this.value)"><input type="number" min="0" inputmode="numeric" class="purchase-input" style="width:110px" aria-label="금액" value="${p.amount||''}" placeholder="금액" oninput="syncPurchase('${p.id}','amount',this.value)"><input type="text" class="purchase-input" style="flex:1" aria-label="메모" value="${escHtml(p.memo||'')}" placeholder="메모 (예: 외전 1~5화)" oninput="syncPurchase('${p.id}','memo',this.value)"><button type="button" class="reread-del" aria-label="구입 기록 지우기" onclick="removePurchase('${p.id}')">✕</button></div>`).join('');}

// ══════════════ 청구기호 ══════════════
// 813(한국 소설) + 첫 장르 번호, 저자 성 + 이름 둘째 글자로 만든 두 자리 수, 제목 첫 자음
const CALL_GENRE={서양풍:1,동양풍:2,현대물:3,판타지물:4,가상시대물:5,실존역사물:6,궁정로맨스:7,신화물:8,캠퍼스물:9,학원물:9,아카데미:9,무협물:2,헌터물:4};
const CHO_LIST='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
function hangulParts(ch){const c=(ch||'').charCodeAt(0)-0xAC00;if(!(c>=0&&c<=11171))return null;return{cho:Math.floor(c/588),jung:Math.floor((c%588)/28)};}
function autoCallNumber(title,author,genres){
  const gs=(genres||[]).map(x=>String(x).trim()).filter(Boolean);
  const g=gs.find(x=>CALL_GENRE[x]!=null);
  const cls='813.'+(g?CALL_GENRE[g]:(gs.length?0:9));
  const a=String(author||'').replace(/\s+/g,'');
  let code='미상';
  if(a){
    const sec=a[1]||a[0];const hp=hangulParts(sec);
    const num=hp?11+Math.floor((hp.cho*21+hp.jung)*88/399):11+(sec.toUpperCase().charCodeAt(0)%88);
    code=a[0].toUpperCase()+num;
  }
  const t=String(title||'').replace(/^[\s\[\(「『<《"'“‘]+/,'');
  const hp=hangulParts(t[0]);
  return`${cls} ${code}${hp?CHO_LIST[hp.cho]:(t[0]||'').toUpperCase()}`;
}
function callNumber(b){return String(b.callNo||'').trim()||autoCallNumber(b.title,b.author,b.genre);}
function updateCallnoHint(){const el=document.getElementById('f-callno');if(!el)return;el.placeholder=autoCallNumber(document.getElementById('f-title')?.value,document.getElementById('f-author')?.value,currentGenreTags)+' (자동)';}

// ══════════════ 형태 · 이용가 · 소장처 ══════════════
const BOOKTYPE_OPTS=['단행본','웹소설','전자책','기타'],AGE_OPTS=['전체','15세','19세'];
function renderChoices(){
  const mk=(opts,inputId,wrapId,cls)=>{
    const inp=document.getElementById(inputId),wrap=document.getElementById(wrapId);if(!inp||!wrap)return;
    const list=[...new Set([...opts,inp.value].filter(Boolean))];
    wrap.innerHTML=list.map(o=>`<button type="button" class="choice${cls}${inp.value===o?' on':''}" aria-pressed="${inp.value===o}" data-v="${escHtml(o)}">${escHtml(o)}</button>`).join('');
    wrap.querySelectorAll('button').forEach(btn=>{btn.onclick=()=>{inp.value=inp.value===btn.dataset.v?'':btn.dataset.v;renderChoices();};});
  };
  mk(BOOKTYPE_OPTS,'f-booktype','booktypeChoices','');
  mk(AGE_OPTS,'f-agerating','ageChoices',' age');
}
function setPlatform(v){const el=document.getElementById('f-platform');if(el)el.value=v;}

// ══════════════ 등장인물 사진 (1:1 자르기) ══════════════
let currentFlPhoto='';
const COVER_HINT='<div class="cover-hint">표지</div>';
function safePhoto(u){u=String(u||'');return u.startsWith('data:image/')||/^https?:\/\//i.test(u)?u:'';}
function photoSlotHtml(target,photo){
  const img=safePhoto(photo);
  return`<label class="photo-slot${img?' has':''}">${img?`<img src="${escHtml(img)}" alt="인물 사진">`:'<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 3v12M3 9h12"></path></svg><span>사진</span>'}<input type="file" accept="image/*" aria-label="인물 사진 고르기" onchange="pickPhoto(event,'${target}')"></label><div class="photo-acts">${img?`<span>사진을 누르면 다시 고를 수 있어요</span><button type="button" class="btn sm danger" onclick="clearPhoto('${target}')">사진 지우기</button>`:'<span>사진을 고르면 1:1로 잘라서 넣어요</span>'}</div>`;
}
function renderFlPhoto(){const el=document.getElementById('flPhotoRow');if(el)el.innerHTML=photoSlotHtml('fl',currentFlPhoto);}
function setPhoto(target,data){
  if(target==='fl'){currentFlPhoto=data;renderFlPhoto();return;}
  const m=mlData.find(x=>x.id===target);if(m){m.photo=data;renderMlAcc();}
}
function clearPhoto(target){setPhoto(target,'');}
function pickPhoto(ev,target){
  const file=ev.target.files&&ev.target.files[0];ev.target.value='';
  if(!file)return;
  if(!file.type.startsWith('image/')){showToast('이미지 파일만 넣을 수 있어요.');return;}
  const r=new FileReader();r.onload=()=>openCrop(r.result,target);r.readAsDataURL(file);
}
let _crop=null;
function cropApply(){
  if(!_crop)return;
  const c=_crop,S=c.S,w=c.w*c.scale,h=c.h*c.scale;
  c.x=Math.min(0,Math.max(S-w,c.x));c.y=Math.min(0,Math.max(S-h,c.y));
  const img=document.getElementById('cropImg');
  img.style.width=w+'px';img.style.height=h+'px';img.style.transform=`translate(${c.x}px,${c.y}px)`;
}
function openCrop(src,target){
  const ov=document.getElementById('cropOv'),img=document.getElementById('cropImg'),zoom=document.getElementById('cropZoom');
  ov.classList.add('open');zoom.value=1;
  img.onload=()=>{
    const S=document.getElementById('cropStage').clientWidth;
    const w=img.naturalWidth,h=img.naturalHeight,base=Math.max(S/w,S/h);
    _crop={target,S,w,h,base,scale:base,x:(S-w*base)/2,y:(S-h*base)/2};
    cropApply();
  };
  img.onerror=()=>{showToast('사진을 읽지 못했어요. 다른 사진으로 해보세요.');closeCrop();};
  img.src=src;
  initCropDrag();
}
function setCropZoom(v){
  if(!_crop)return;
  const c=_crop,cx=(c.S/2-c.x)/c.scale,cy=(c.S/2-c.y)/c.scale;
  c.scale=c.base*Number(v);c.x=c.S/2-cx*c.scale;c.y=c.S/2-cy*c.scale;cropApply();
}
let _cropDragReady=false;
function initCropDrag(){
  if(_cropDragReady)return;_cropDragReady=true;
  const stage=document.getElementById('cropStage');let drag=null;
  stage.addEventListener('pointerdown',e=>{if(!_crop)return;drag={px:e.clientX,py:e.clientY,x:_crop.x,y:_crop.y};stage.setPointerCapture(e.pointerId);});
  stage.addEventListener('pointermove',e=>{if(!drag||!_crop)return;_crop.x=drag.x+(e.clientX-drag.px);_crop.y=drag.y+(e.clientY-drag.py);cropApply();});
  const end=()=>{drag=null;};stage.addEventListener('pointerup',end);stage.addEventListener('pointercancel',end);
  stage.addEventListener('wheel',e=>{if(!_crop)return;e.preventDefault();const z=document.getElementById('cropZoom');z.value=Math.min(4,Math.max(1,Number(z.value)-e.deltaY*0.002));setCropZoom(z.value);},{passive:false});
}
function closeCrop(){document.getElementById('cropOv').classList.remove('open');_crop=null;const img=document.getElementById('cropImg');img.removeAttribute('src');img.style.width='';img.style.height='';img.style.transform='';}
function confirmCrop(){
  if(!_crop)return;
  const c=_crop,img=document.getElementById('cropImg');
  const out=document.createElement('canvas');out.width=out.height=320;
  out.getContext('2d').drawImage(img,-c.x/c.scale,-c.y/c.scale,c.S/c.scale,c.S/c.scale,0,0,320,320);
  setPhoto(c.target,out.toDataURL('image/jpeg',0.85));
  closeCrop();
}
