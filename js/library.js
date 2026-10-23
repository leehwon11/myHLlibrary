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
  else if(sort==='tbr'){const to=appSettings.tbrOrder||[];const om=new Map(to.map((id,i)=>[id,i]));list.sort((a,b)=>(om.has(a.id)?om.get(a.id):9999)-(om.has(b.id)?om.get(b.id):9999));}
  return list;
}
function renderCard(b,q,isTbrNext){
  const gKey=(b.genre||[])[0]||'기타';const g=getGenre(gKey);
  const sb=b.status?({완독:'<span class="status-badge sb-완독">✅ 완독</span>',읽는중:'<span class="status-badge sb-읽는중">📖 읽는중</span>',읽고싶어요:'<span class="status-badge sb-읽고싶어요">🔖 읽고싶어요</span>',하차:'<span class="status-badge sb-하차">🚪 하차</span>'}[b.status]||''):'';
  const ageBadge=b.agerating?`<span class="age-badge age-${b.agerating}">${b.agerating}</span>`:'';
  const allTags=[...(b.sojaiTags||b.tags||[]),...(b.relTags||b.themes||[])];
  const tags=allTags.slice(0,3).map(t=>`<span class="ctag ctag-click" data-tag="${encodeURIComponent(t)}" onclick="event.stopPropagation();searchByTag(decodeURIComponent(this.dataset.tag))">${escHtml(t)}</span>`).join('');
  const dot=`<span class="genre-dot" style="background:${hexToRgba(g.color,.13)};color:${g.color}">${escHtml(g.name)}</span>`;
  const favBtn=`<button class="fav-btn${b.fav?' on':''}" onclick="event.stopPropagation();toggleFav('${b.id}')" title="즐겨찾기"><span class="fav-star">★</span></button>`;
  const titleHl=q?highlight(b.title,q):escHtml(b.title);
  const authorHl=q?highlight(b.author||'작가 미상',q):escHtml(b.author||'작가 미상');

  const moodHtml=b.moods&&b.moods.length?`<div class="mood-card-tag">${MOOD_OPTIONS.find(m=>m.label===b.moods[0])?.emoji||''} ${b.moods[0]}</div>`:'';
  const rereadBadge=(b.rereads&&b.rereads.length)?`<span class="card-reread-badge">🔄 ${b.rereads.length}회독</span>`:'';
  const tbrBadge=isTbrNext?'<span class="card-tbr-badge">📌 다음에 읽을 책</span>':'';
  const cover=b.cover?`<div class="card-cover"><img src="${b.cover}" alt="">${dot}${sb}${rereadBadge}${tbrBadge}${favBtn}</div>`:`<div class="card-cover"><div class="card-cover-ph" style="background:${hexToRgba(g.color,.06)}"><span class="ph-icon" style="color:${g.color};opacity:.3">📖</span><span class="ph-title">${escHtml(b.title)}</span></div>${dot}${sb}${rereadBadge}${tbrBadge}${favBtn}</div>`;
  return`<div class="book-card" draggable="true" data-id="${b.id}" onclick="openDetail('${b.id}')" ondragstart="onDragStart(event,'${b.id}')" ondragover="onDragOver(event)" ondrop="onDrop(event,'${b.id}')" ondragleave="onDragLeave(event)" ondragend="onDragEnd(event)">${cover}<div class="card-body"><div style="display:flex;align-items:flex-start;gap:5px;margin-bottom:3px"><div class="card-title" style="flex:1;margin-bottom:0">${titleHl}</div>${ageBadge}</div><div class="card-author">${authorHl}</div><div class="card-stars">${stars(b.rating||0)}</div><div class="card-tags">${tags}</div>${moodHtml}</div></div>`;
}
function render(){
  document.getElementById('bookChip').textContent=books.length+'권';updateLogo();
  const q=(document.getElementById('searchInput')?.value||'').toLowerCase();
  const filtered=getSortedFiltered();const grid=document.getElementById('bookGrid');
  if(!filtered.length){grid.innerHTML='<div class="empty"><div class="empty-ico">📚</div><p>등록된 책이 없어요.</p></div>';return;}
  grid.innerHTML='';
  const sort=document.getElementById('sortSelect')?.value||'';
  const tbrTop=(sort==='tbr'&&filtered.length)?filtered[0].id:null;
  filtered.forEach(b=>{grid.insertAdjacentHTML('beforeend',renderCard(b,q,b.id===tbrTop));});
}
function setStatusFilter(val){
  currentStatusFilter=val;
  document.querySelectorAll('.sp').forEach(p=>p.classList.toggle('sp-on',p.dataset.sv===val));
  if(val==='읽고싶어요'&&(appSettings.tbrOrder||[]).length){
    const sel=document.getElementById('sortSelect');if(sel)sel.value='tbr';
  }
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
  const sort=document.getElementById('sortSelect')?.value||'';
  if(sort==='tbr'){
    const wishIds=(appSettings.tbrOrder||[]).length?[...appSettings.tbrOrder]:books.filter(b=>b.status==='읽고싶어요').map(b=>b.id);
    const fi=wishIds.indexOf(_dragId),ti=wishIds.indexOf(targetId);
    if(fi!==-1&&ti!==-1){wishIds.splice(fi,1);wishIds.splice(ti,0,_dragId);}
    appSettings.tbrOrder=wishIds;saveData();
    _dragId=null;render();showToast('TBR 우선순위가 변경됐어요!');return;
  }
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
function openAdd(){editId=null;currentCover=null;currentStar=0;currentStatusVal='읽고싶어요';excerptsData=[];currentCtagsSojai=[];currentCtagsRel=[];currentFlTypeTags=[];currentGenreTags=[];currentMoods=[];mlData=[];rereadData=[];document.getElementById('editModalTitle').textContent='책 추가';document.getElementById('delBtn').style.display='none';clearForm();renderExcerpts();updateStatusUI();renderTagsSojai();renderTagsRel();renderFlTypeTags();renderMoodSelector();renderGenreTags();renderStarPicker();document.getElementById('editOv').classList.add('open');}
function openEdit(id){
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
  document.getElementById('f-price').value=b.price||'';document.getElementById('f-datebuy').value=b.datebuy||'';document.getElementById('f-datestart').value=b.datestart||'';document.getElementById('f-dateend').value=b.dateend||'';
  document.getElementById('f-dnf-at').value=b.dnfAt||'';document.getElementById('f-dnf-date').value=b.dnfDate||'';document.getElementById('f-dnf-reason').value=b.dnfReason||'';

  currentGenreTags=Array.isArray(b.genre)?[...b.genre]:(b.genre?[b.genre]:[]);renderGenreTags();
  document.getElementById('coverBox').innerHTML=currentCover?`<img src="${currentCover}" alt="">`:'<div class="cover-hint"><span class="ci">🔗</span>아래에<br>이미지 URL을 입력하세요</div>';
  renderStarPicker();updateStatusUI();renderExcerpts();
  ['f-summary','f-review','f-memo','f-fl-intro'].forEach(id=>autosizeEl(document.getElementById(id)));
  document.getElementById('editOv').classList.add('open');
}
function clearForm(){['f-title','f-author','f-summary','f-review','f-memo','f-platform','f-platformurl','f-price','f-datebuy','f-datestart','f-dateend','f-fl-name','f-fl-age','f-fl-intro','f-dnf-at','f-dnf-date','f-dnf-reason'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});rereadData=[];renderRereadList();currentGenreTags=[];renderGenreTags();mlData=[];renderMlAcc();document.getElementById('f-booktype').value='';document.getElementById('f-agerating').value='';document.getElementById('coverBox').innerHTML='<div class="cover-hint"><span class="ci">🔗</span>아래에<br>이미지 URL을 입력하세요</div>';currentCtagsSojai=[];currentCtagsRel=[];currentFlTypeTags=[];renderTagsSojai();renderTagsRel();renderFlTypeTags();updateStarUI();['f-summary','f-review','f-memo','f-fl-intro'].forEach(id=>autosizeEl(document.getElementById(id)));}
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
const EXC_QUICK_TAGS=['#명대사','#설렘','#고백','#후회','#집착','#눈물','#웃김','#명장면'];
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
  const quick=EXC_QUICK_TAGS.filter(t=>!tags.includes(t)).map(t=>`<button type="button" class="quick-tag-chip" data-tag="${encodeURIComponent(t)}" onclick="addExcerptTag('${e.id}',decodeURIComponent(this.dataset.tag))">+ ${escHtml(t)}</button>`).join('');
  return`<div class="fg"><label>누구의 대사?</label><div class="exc-speaker-row">${speakerBtns}</div></div><div class="fg"><label>발췌 태그</label><div class="ctag-wrap"><div class="ctag-input-row"><input type="text" placeholder="#명대사, #설렘 ..." onkeydown="if(event.key==='Enter'){event.preventDefault();addExcerptTag('${e.id}',this.value);}"><button class="ctag-add-btn" onclick="addExcerptTag('${e.id}',this.previousElementSibling.value)">+</button></div>${quick?`<div class="quick-tags"><span class="quick-tags-label">빠른 선택</span>${quick}</div>`:''}<div class="selected-tags">${selTags}</div></div></div>`;
}
function saveBook(){
  try{
    const title=document.getElementById('f-title').value.trim();if(!title){showToast('제목을 입력해주세요.');return;}
    const genreArr=currentGenreTags.map(t=>t.trim()).filter(Boolean);
    const clean=excerptsData.filter(e=>e.text.trim()).map(({id,text,location,reason,speaker,tags})=>({id,text:text.trim(),location:(location||'').trim(),reason:(reason||'').trim(),speaker:speaker||'',tags:tags||[]}));
    const bookData={id:editId||uid(),title,author:document.getElementById('f-author').value.trim(),genre:genreArr,booktype:document.getElementById('f-booktype').value,agerating:document.getElementById('f-agerating').value,platform:document.getElementById('f-platform').value.trim(),platformurl:document.getElementById('f-platformurl')?.value.trim()||'',rereads:rereadData.map(r=>({...r})),price:Number(document.getElementById('f-price').value)||0,status:currentStatusVal,sojaiTags:[...currentCtagsSojai],relTags:[...currentCtagsRel],flTypeTags:[...currentFlTypeTags],moods:[...currentMoods],rating:currentStar,summary:document.getElementById('f-summary').value.trim(),review:document.getElementById('f-review').value.trim(),memo:document.getElementById('f-memo')?.value.trim()||'',excerpts:clean,cover:currentCover,ml:mlData.filter(m=>m.name||m.age||(m.typeTags&&m.typeTags.length)||m.intro).map(m=>({name:m.name||'',age:m.age||'',typeTags:m.typeTags||[],intro:m.intro||'',sub:!!m.sub})),fl:{name:document.getElementById('f-fl-name').value.trim(),age:document.getElementById('f-fl-age').value.trim(),typeTags:[...currentFlTypeTags],intro:document.getElementById('f-fl-intro')?.value.trim()||''},datebuy:document.getElementById('f-datebuy').value,datestart:document.getElementById('f-datestart').value,dateend:document.getElementById('f-dateend').value,dnfAt:document.getElementById('f-dnf-at').value.trim(),dnfDate:document.getElementById('f-dnf-date').value,dnfReason:document.getElementById('f-dnf-reason').value.trim(),updatedAt:new Date().toISOString()};
    if(editId){const idx=books.findIndex(b=>b.id===editId);if(idx===-1){showToast('저장할 책을 찾을 수 없어요.');return;}bookData.createdAt=books[idx].createdAt||bookData.updatedAt;bookData.fav=books[idx].fav||false;books[idx]=bookData;}else{bookData.createdAt=bookData.updatedAt;books.unshift(bookData);}
    saveData().then(()=>{render();closeEdit();showToast(editId?'수정되었어요!':'책이 추가되었어요!');}).catch(e=>{console.error('saveBook catch:',e);showToast('저장 중 오류가 발생했어요: '+e.message);});
  }catch(e){
    console.error('saveBook error:',e);
    showToast('저장 중 예기치 않은 오류가 발생했어요: '+e.message);
  }
}
async function deleteBook(){const b=books.find(x=>x.id===editId);if(!b)return;const ok=await showConfirm('책 삭제','"'+b.title+'" 을(를) 삭제할까요? 이 작업은 되돌릴 수 없어요.','삭제');if(!ok)return;books=books.filter(x=>x.id!==editId);await saveData();render();closeEdit();showToast('삭제되었어요.');}

// ══════════════ DETAIL MODAL ══════════════
function getSimilarBooks(b){
  const bG=new Set(b.genre||[]);
  const allTags=[...(b.sojaiTags||b.tags||[]),...(b.relTags||b.themes||[])];
  const bT=new Set(allTags);
  const scored=books.filter(x=>x.id!==b.id).map(x=>{
    const xG=x.genre||[];const xAllTags=[...(x.sojaiTags||x.tags||[]),...(x.relTags||x.themes||[])];
    let score=0;xG.forEach(g=>{if(bG.has(g))score+=3;});xAllTags.forEach(t=>{if(bT.has(t))score+=1;});return{book:x,score};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,4);
  return scored;
}
function openDetail(id){
  const b=books.find(x=>x.id===id);if(!b)return;
  const g=getGenre((b.genre||[])[0]);
  const statusLabels={완독:'✅ 완독',읽는중:'📖 읽는 중',읽고싶어요:'🔖 읽고 싶어요',하차:'🚪 하차'};
  const sbl=statusLabels[b.status]||b.status||'';
  const ageBadge=b.agerating?`<span class="age-badge age-${b.agerating}">${b.agerating}</span>`:'';
  const statusStyle={완독:'background:var(--green-bg);color:var(--green)',읽는중:'background:var(--amber-bg);color:var(--amber)',읽고싶어요:'background:var(--blue-bg);color:var(--blue)',하차:'background:var(--warn-bg);color:var(--warn)'}[b.status]||'background:var(--bg2);color:var(--txt3)';
  const allTags=[...(b.sojaiTags||b.tags||[]),...(b.relTags||b.themes||[])];
  // TOP
  const coverHtml=b.cover?`<img src="${b.cover}" alt="" style="width:100%;height:100%;object-fit:cover;display:block">`:`<div class="det-cover-ph"><span class="ico">📖</span><span style="font-size:14px;font-weight:600;text-align:center">${escHtml(b.title)}</span></div>`;
  const dateHtml=[b.datebuy?`<div class="det-date-item">🛒 <span>${b.datebuy}</span></div>`:'',b.datestart?`<div class="det-date-item">📖 <span>${b.datestart}</span></div>`:'',b.dateend?`<div class="det-date-item">✅ <span>${b.dateend}</span></div>`:''].filter(Boolean).join('');
  const readDays=daysBetween(b.datestart,b.dateend);const readDaysHtml=readDays?`<span class="mchip">⏱ ${readDays}일 만에 완독</span>`:'';
  const metaChips=[b.platform&&b.platformurl?`<a href="${escHtml(b.platformurl)}" target="_blank" rel="noopener noreferrer" class="mchip" style="color:var(--acc);text-decoration:none">${escHtml(b.platform)} 🔗</a>`:b.platform?`<span class="mchip">📱 ${escHtml(b.platform)}</span>`:'',b.price?`<span class="mchip">💰 ${fmtPrice(b.price)}</span>`:'',readDaysHtml,b.booktype?`<span class="mchip">${escHtml(b.booktype)}</span>`:'',(b.rereads&&b.rereads.length)?`<span class="mchip">🔄 ${b.rereads.length}회 재독</span>`:''].filter(Boolean).join('');
  const moodHtml=(b.moods&&b.moods.length)?b.moods.map(m=>{const mo=MOOD_OPTIONS.find(x=>x.label===m);return mo?`<span class="mood-tag" style="background:${mo.bg};color:${mo.color};border-color:${mo.color+'40'}">${mo.emoji} ${m}</span>`:''}).join(''):'';
  const tagHtml=allTags.map(t=>`<span class="ctag-detail ctag-click" data-tag="${encodeURIComponent(t)}" onclick="const tg=decodeURIComponent(this.dataset.tag);closeDetail();setTimeout(()=>searchByTag(tg),50)">${escHtml(t)}</span>`).join('');
  const genreBadges=(b.genre||[]).map(gn=>{const gi=getGenre(gn);return`<span class="det-genre-badge" style="background:${hexToRgba(gi.color,.13)};color:${gi.color}">${escHtml(gi.name)}</span>`;}).join('');
  document.getElementById('detailTop').innerHTML=`<div class="det-cover">${coverHtml}</div><div class="det-info"><div class="det-badge-row">${genreBadges}<span class="det-status-badge" style="${statusStyle}">${sbl}</span>${ageBadge}</div><div class="det-title">${escHtml(b.title)}</div><div class="det-author">${escHtml(b.author||'작가 미상')}</div>${b.rating?`<div class="det-stars">${stars(b.rating)}</div>`:''}<div class="det-meta">${metaChips}</div>${moodHtml?`<div style="display:flex;flex-wrap:wrap;gap:5px">${moodHtml}</div>`:''}<div class="det-tags">${tagHtml}</div>${dateHtml?`<div class="det-dates">${dateHtml}</div>`:''}<div class="det-actions"><button class="btn" onclick="openEdit('${b.id}');closeDetail()">✏️ 수정</button><button class="btn" onclick="openShare('${b.id}');closeDetail()">💌 추천 카드</button>${b.fav?`<button class="btn" onclick="toggleFav('${b.id}');openDetail('${b.id}')" style="color:#c8a000">⭐ 즐겨찾기</button>`:`<button class="btn" onclick="toggleFav('${b.id}');openDetail('${b.id}')">☆ 즐겨찾기</button>`}</div></div>`;
  // CONTENT
  let contentHtml='';
  // 남주/여주
  const mlArr=Array.isArray(b.ml)?b.ml:(b.ml&&b.ml.name?[b.ml]:[]);
  const mainMl=mlArr.filter(m=>!m.sub),subMl=mlArr.filter(m=>m.sub);
  const fl=b.fl;
  if(mlArr.length||(fl&&fl.name)){
    const mlCards=mainMl.map(m=>`<div class="lead-detail-card"><div class="lead-detail-label ml">💙 남주</div><div class="lead-detail-name">${escHtml(m.name||'이름 미입력')}</div>${m.age?`<div class="lead-detail-age">${escHtml(m.age)}</div>`:''}${m.typeTags&&m.typeTags.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">${m.typeTags.map(t=>`<span class="ctag-detail" style="font-size:11px">${escHtml(t)}</span>`).join('')}</div>`:''}${m.intro?`<p style="font-size:12px;color:var(--txt2);margin-top:8px;line-height:1.7">${escHtml(m.intro)}</p>`:''}</div>`).join('');
    const flCard=fl&&fl.name?`<div class="lead-detail-card"><div class="lead-detail-label fl">🩷 여주</div><div class="lead-detail-name">${escHtml(fl.name)}</div>${fl.age?`<div class="lead-detail-age">${escHtml(fl.age)}</div>`:''}${fl.typeTags&&fl.typeTags.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">${fl.typeTags.map(t=>`<span class="ctag-detail" style="font-size:11px">${escHtml(t)}</span>`).join('')}</div>`:''}${fl.intro?`<p style="font-size:12px;color:var(--txt2);margin-top:8px;line-height:1.7">${escHtml(fl.intro)}</p>`:''}</div>`:'';
    const subMlHtml=subMl.length?`<div class="lead-sub-section"><div class="lead-sub-title">🩵 서브남</div>${subMl.map(m=>`<div class="lead-sub-acc"><div class="lead-sub-head" onclick="this.nextElementSibling.classList.toggle('open');this.querySelector('.lead-sub-arrow').classList.toggle('open')"><span class="lead-sub-arrow">▶</span><span style="font-size:12px;font-weight:600;color:var(--acc2)">${escHtml(m.name||'이름 미입력')}</span>${m.age?`<span style="font-size:11px;color:var(--txt4);">${escHtml(m.age)}</span>`:''}</div><div class="lead-sub-body">${m.typeTags&&m.typeTags.length?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">${m.typeTags.map(t=>`<span class="ctag-detail" style="font-size:11px">${escHtml(t)}</span>`).join('')}</div>`:''}${m.intro?`<p style="font-size:12px;color:var(--txt2);line-height:1.7">${escHtml(m.intro)}</p>`:''}</div></div>`).join('')}</div>`:'';
    contentHtml+=`<div class="det-section"><h3>주인공 정보</h3><div class="lead-detail-grid">${mlCards}${flCard}</div>${subMlHtml}</div>`;
  }
  if(b.status==='하차'&&(b.dnfAt||b.dnfDate||b.dnfReason)){
    const meta=[b.dnfAt?`<span class="mchip">📍 ${escHtml(b.dnfAt)}에서 하차</span>`:'',b.dnfDate?`<span class="mchip">🗓 ${b.dnfDate}</span>`:''].filter(Boolean).join('');
    contentHtml+=`<div class="det-section"><h3>🚪 하차 기록</h3><div class="dnf-detail">${meta?`<div class="det-meta">${meta}</div>`:''}${b.dnfReason?`<p style="white-space:pre-wrap">${escHtml(b.dnfReason)}</p>`:''}</div></div>`;
  }
  // 줄거리/총평 (주인공 다음)
  if(b.summary)contentHtml+=`<div class="det-section"><h3>줄거리</h3><p style="white-space:pre-wrap">${escHtml(b.summary)}</p></div>`;
  if(b.review)contentHtml+=`<div class="det-section"><h3>총평</h3><p style="white-space:pre-wrap">${escHtml(b.review)}</p></div>`;
  if(b.memo)contentHtml+=`<div class="det-section"><h3>📝 메모 <span style="font-size:10px;color:var(--txt4);font-weight:400">(비공개)</span></h3><p style="white-space:pre-wrap;background:var(--amber-bg);border:1px solid rgba(176,106,0,.15);border-radius:8px;padding:10px 14px;font-size:13px;color:var(--txt2);line-height:1.8">${escHtml(b.memo)}</p></div>`;
  // 발췌
  if(b.excerpts&&b.excerpts.length){const excHtml=b.excerpts.map((e,i)=>{const spk=e.speaker?`<span class="exc-q-speaker">${excSpeakerLabel(e.speaker)}</span>`:'';const tg=(e.tags||[]).map(t=>`<span class="ctag-detail ctag-click" style="font-size:11px" data-tag="${encodeURIComponent(t)}" onclick="const tg=decodeURIComponent(this.dataset.tag);closeDetail();setTimeout(()=>searchByTag(tg),50)">${escHtml(t)}</span>`).join('');return`<div class="exc-quote-block"><div class="exc-quote-head" onclick="this.nextElementSibling.classList.toggle('open')"><span class="exc-q-label">발췌 ${i+1}</span>${spk}<span class="exc-q-preview">${escHtml(e.text.slice(0,50))}${e.text.length>50?'…':''}</span></div><div class="exc-quote-body"><div class="exc-q-loc">${e.location?'📍 '+escHtml(e.location):''}</div><div class="exc-q-text">${escHtml(e.text)}</div>${e.reason?`<div class="exc-q-reason">💭 ${escHtml(e.reason)}</div>`:''}${tg?`<div style="display:flex;flex-wrap:wrap;gap:4px">${tg}</div>`:''}</div></div>`;}).join('');contentHtml+=`<div class="det-section"><h3>발췌</h3>${excHtml}</div>`;}
  // 재독 기록
  if(b.rereads&&b.rereads.length){const rHtml=b.rereads.map(r=>`<div class="reread-item"><span class="reread-num">제${r.nth||1}회독</span><span style="color:var(--txt3)">${r.date||''}</span>${r.note?`<span style="font-size:12px;color:var(--txt2)">${escHtml(r.note)}</span>`:''}</div>`).join('');contentHtml+=`<div class="det-section"><h3>재독 기록</h3><div class="reread-list">${rHtml}</div></div>`;}
  // 비슷한 책 추천
  const similar=getSimilarBooks(b);
  if(similar.length){
    const sItems=similar.map(({book:sb,score})=>{const sg=getGenre((sb.genre||[])[0]);const reasonParts=[];const sharedG=(sb.genre||[]).filter(g=>(b.genre||[]).includes(g));const sharedT=[...(sb.sojaiTags||[]),(sb.relTags||[])].filter(t=>[...(b.sojaiTags||[]),...(b.relTags||[])].includes(t)).slice(0,2);if(sharedG.length)reasonParts.push(sharedG[0]+' 장르');if(sharedT.length)reasonParts.push(sharedT[0]);const coverEl=sb.cover?`<img src="${sb.cover}" class="similar-cover" alt="">`:`<div class="similar-cover-ph">📖</div>`;return`<div class="similar-item" onclick="closeDetail();setTimeout(()=>openDetail('${sb.id}'),100)">${coverEl}<div class="similar-info"><div class="similar-title">${escHtml(sb.title)}</div><div class="similar-author">${escHtml(sb.author||'')}</div>${reasonParts.length?`<div class="similar-reason">🔗 ${escHtml(reasonParts.join(', '))} 기반</div>`:''}</div></div>`;}).join('');
    contentHtml+=`<div class="det-section"><h3>📖 비슷한 책</h3><div class="similar-list">${sItems}</div></div>`;
  }
  document.getElementById('detailContent').innerHTML=contentHtml||'<p style="font-size:13px;color:var(--txt4);padding:8px 0">내용이 없어요.</p>';
  document.getElementById('detailScroll').scrollTop=0;
  document.getElementById('detailOv').classList.add('open');
}
function closeDetail(){document.getElementById('detailOv').classList.remove('open');}

// ══════════════ 재독 기록 ══════════════
function addReread(){const nth=rereadData.length+1;rereadData.push({id:uid(),nth,date:localDate(),note:''});renderRereadList();}
function removeReread(id){rereadData=rereadData.filter(r=>r.id!==id);rereadData.forEach((r,i)=>{r.nth=i+1;});renderRereadList();}
function renderRereadList(){const el=document.getElementById('rereadList');if(!el)return;el.innerHTML=rereadData.map(r=>`<div class="reread-item"><span class="reread-num">제${r.nth}회독</span><input type="date" value="${r.date||''}" style="flex:0 0 120px;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px 7px;font-family:var(--font-body);font-size:12px;color:var(--txt)" oninput="rereadData.find(x=>x.id==='${r.id}').date=this.value"><input type="text" value="${escHtml(r.note||'')}" placeholder="메모" style="flex:1;background:var(--bg);border:1px solid var(--line);border-radius:6px;padding:4px 7px;font-family:var(--font-body);font-size:12px;color:var(--txt)" oninput="rereadData.find(x=>x.id==='${r.id}').note=this.value"><button class="reread-del" onclick="removeReread('${r.id}')">✕</button></div>`).join('');}
