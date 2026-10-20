// ══════════════ 상수 / 초기 데이터 ══════════════
const DEFAULT_GENRES=[
  {id:'현대물',name:'현대물',color:'#3a8060',locked:true},
  {id:'실존역사물',name:'실존역사물',color:'#7a5030',locked:true},
  {id:'가상시대물',name:'가상시대물',color:'#5a4080',locked:true},
  {id:'판타지물',name:'판타지물',color:'#3a5fa0',locked:true},
  {id:'동양풍',name:'동양풍',color:'#c07820',locked:true},
  {id:'서양풍',name:'서양풍',color:'#9b4f6a',locked:true},
  {id:'신화물',name:'신화물',color:'#2a8090',locked:true},
  {id:'궁정로맨스',name:'궁정로맨스',color:'#b04060',locked:true},
  {id:'캠퍼스물',name:'캠퍼스물',color:'#3a9040',locked:true},
  {id:'학원물',name:'학원물',color:'#4a70c0',locked:true},
  {id:'무협물',name:'무협물',color:'#8a3020',locked:true},
  {id:'아카데미',name:'아카데미',color:'#6040a0',locked:true},
  {id:'헌터물',name:'헌터물',color:'#505050',locked:true}
];
const MOOD_OPTIONS=[{emoji:'😭',label:'울었어요',color:'#4a7fc0',bg:'#e8f0fa'},{emoji:'🥰',label:'설렜어요',color:'#c05070',bg:'#fce8ef'},{emoji:'😤',label:'화났어요',color:'#b04040',bg:'#fdf0f0'},{emoji:'😳',label:'충격받았어요',color:'#9040b0',bg:'#f4e8fc'},{emoji:'🥺',label:'여운남아요',color:'#2e7d52',bg:'#edf7f2'},{emoji:'😂',label:'웃겼어요',color:'#b06a00',bg:'#fdf4e7'},{emoji:'😪',label:'아쉬웠어요',color:'#808080',bg:'#f0eeeb'},{emoji:'🤯',label:'스트레스받았어요',color:'#c04030',bg:'#fdf0f0'}];
const STAR_LABELS=['','★ 별로였어요','★★ 보통이에요','★★★ 괜찮았어요','★★★★ 좋았어요','★★★★★ 최고였어요!'];

// ══════════════ 리디북스 키워드 마스터 목록 (빠른 선택용) ══════════════
const RIDI_GENRES=['현대물','실존역사물','가상시대물','판타지물','동양풍','서양풍','신화물','궁정로맨스','캠퍼스물','학원물','무협물','아카데미','헌터물'];
const RIDI_SOJAI=['차원이동','회귀/타임슬립','전생/환생','영혼체인지/빙의','초능력','초월적존재','왕족/귀족','외국인/혼혈','남장여자','바람둥이','역하렘','동거','맞선','속도위반','베이비메신저','조직/암흑가','법조계','메디컬','전문직','군대물','경찰/형사/수사관','연예인','스포츠물','기억상실','오해','복수','시월드','신데렐라','권선징악','천재','가이드버스','게임빙의','공포/괴담','인외존재','오메가버스'];
const RIDI_REL=['재회물','오래된연인','첫사랑','친구>연인','라이벌/앙숙','사제지간','나이차커플','키잡물','사내연애','비밀연애','삼각관계','갑을관계','신분차이','계약연애/결혼','정략결혼','선결혼후연애','원나잇','몸정>맘정','소유욕/독점욕/질투','여공남수','금단의관계','운명적사랑','애증'];
const RIDI_ML_TYPES=['츤데레남','조신남','평범남','뇌섹남','능력남','재벌남','사이다남','직진남','계략남','능글남','다정남','애교남','유혹남','절륜남','집착남','나쁜남자','후회남','상처남','짝사랑남','순정남','철벽남','동정남','순진남','까칠남','냉정남','무심남','오만남','카리스마남','존댓말남','대형견남','연하남','사차원남'];
const RIDI_FL_TYPES=['평범녀','뇌섹녀','능력녀','재벌녀','사이다녀','직진녀','계략녀','능글녀','다정녀','애교녀','유혹녀','절륜녀','집착녀','나쁜여자','후회녀','상처녀','짝사랑녀','순정녀','철벽녀','동정녀','순진녀','까칠녀','냉정녀','무심녀','도도녀','외유내강','우월녀','걸크러시','털털녀','엉뚱녀','쾌활발랄녀'];
let books=[];
let appSettings={yearlyGoal:30};
// 장르 색상 조회용 고정 맵 (DEFAULT_GENRES 기반, 수정 불필요)
const GENRE_COLOR_MAP=Object.fromEntries(DEFAULT_GENRES.map(g=>[g.name,g.color]));

// ══════════════ Supabase 설정 ══════════════
// ⚠️ 아래 두 값을 본인의 Supabase 프로젝트 정보로 반드시 바꿔주세요.
// Supabase 대시보드 → Project Settings → API 에서 Project URL / anon public key 확인
const SUPABASE_URL='https://gnwdcjdmtrwnbjbpswuh.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RjamRtdHJ3bmJqYnBzd3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDE3OTMsImV4cCI6MjEwNTQxNzc5M30.ruGk6emBXdz4PCif06ZGX8zx0vC6rrBdfSpHK_Rdz40';
const SUPABASE_TABLE='library_data';
const SUPABASE_ROW_ID='main';
const RIDI_PROXY_URL=SUPABASE_URL+'/functions/v1/ridifetch';
let sb=null;
function getSupabase(){
  if(sb)return sb;
  if(!window.supabase){console.error('Supabase 라이브러리가 로드되지 않았어요.');return null;}
  if(SUPABASE_URL.includes('YOUR-PROJECT')||SUPABASE_ANON_KEY.includes('YOUR-ANON')){
    showToast('⚠️ Supabase URL/키가 설정되지 않았어요. 코드 상단 SUPABASE_URL/SUPABASE_ANON_KEY를 채워주세요.');
    return null;
  }
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
  return sb;
}

// ══════════════ 레거시 IndexedDB (1회성 마이그레이션 읽기 전용) ══════════════
const DB_NAME='myLibDB',DB_VERSION=1,STORE='kvStore';let _db=null;
function openDB(){return new Promise((res,rej)=>{if(_db){res(_db);return;}const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=e=>e.target.result.createObjectStore(STORE);req.onsuccess=e=>{_db=e.target.result;res(_db);};req.onerror=e=>rej(e.target.error);});}
function idbGet(key){return openDB().then(db=>new Promise((res,rej)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);})).catch(()=>null);}

function normalizeBook(b){
  if(!b) return b;
  if(b.genres!==undefined&&b.genre===undefined){b.genre=b.genres;delete b.genres;}
  if(b.dateStart!==undefined&&b.datestart===undefined){b.datestart=b.dateStart;delete b.dateStart;}
  if(b.dateEnd!==undefined&&b.dateend===undefined){b.dateend=b.dateEnd;delete b.dateEnd;}
  if(b.sojai!==undefined&&b.sojaiTags===undefined){b.sojaiTags=b.sojai.map(t=>t.startsWith('#')?t:'#'+t);delete b.sojai;}
  if(b.rel!==undefined&&b.relTags===undefined){b.relTags=b.rel.map(t=>t.startsWith('#')?t:'#'+t);delete b.rel;}
  if(!b.genre) b.genre=[];
  else if(typeof b.genre==='string') b.genre=b.genre?[b.genre]:[];
  if(!b.createdAt) b.createdAt=b.created||new Date().toISOString();
  if(b.created){delete b.created;}
  if(b.status==='읽고싶은') b.status='읽고싶어요';
  return b;
}

async function saveData(){
  const payload={books,appSettings};
  try{localStorage.setItem('library_backup',JSON.stringify(payload));}catch(e){}
  const client=getSupabase();if(!client)return;
  try{
    const{error}=await client.from(SUPABASE_TABLE).upsert({id:SUPABASE_ROW_ID,value:payload,updated_at:new Date().toISOString()});
    if(error)throw error;
  }catch(e){console.error('saveData(Supabase) 오류:',e);showToast('저장 중 오류가 발생했어요. Supabase 연결/테이블 설정을 확인해주세요.');}
}

async function tryMigrateFromIndexedDB(){
  try{
    const legacyBooks=await idbGet('myLib_books');
    if(legacyBooks&&legacyBooks.length){
      books=legacyBooks;
      showToast('기존 로컬(IndexedDB) 데이터를 Supabase로 옮겼어요 ✅');
      return true;
    }
  }catch(e){console.warn('마이그레이션 확인 실패:',e);}
  return false;
}

async function loadFromDB(){
  const client=getSupabase();
  if(!client){books=[];return;}
  try{
    const{data,error}=await client.from(SUPABASE_TABLE).select('value').eq('id',SUPABASE_ROW_ID).maybeSingle();
    if(error)throw error;
    if(data&&data.value){
      books=(data.value.books||[]).map(normalizeBook);
      if(data.value.appSettings) appSettings={...appSettings,...data.value.appSettings};
    }else{
      const migrated=await tryMigrateFromIndexedDB();
      if(!migrated)books=[];
      await saveData();
    }
  }catch(e){
    console.error('loadFromDB(Supabase) 오류:',e);
    try{
      const backup=localStorage.getItem('library_backup');
      if(backup){
        const d=JSON.parse(backup);
        books=(d.books||[]).map(normalizeBook);
        if(d.appSettings) appSettings={...appSettings,...d.appSettings};
        showToast('로컬 백업에서 데이터를 불러왔어요.');
        return;
      }
    }catch(e2){}
    showToast('⚠️ Supabase에서 데이터를 불러오지 못했어요. URL/키/테이블 설정을 확인해주세요.');
    books=[];
  }
}

// ══════════════ 상태 ══════════════
let currentFilter='전체',currentStatusFilter='',editId=null,currentCover=null,currentStar=0,currentStatusVal='완독';
let excerptsData=[],currentShareId=null,shareTheme='cream',showFavOnly=false;
let currentCtagsSojai=[],currentCtagsRel=[],currentFlTypeTags=[],currentGenreTags=[],currentMoods=[];
let mlData=[],rereadData=[];
let customOrder=null;
try{customOrder=JSON.parse(sessionStorage.getItem('myLib_customOrder')||'null');}catch(e){}

// ── sessionStorage 필터 복원 ──
function saveFilterState(){try{sessionStorage.setItem('myLib_filter',JSON.stringify({q:document.getElementById('searchInput')?.value||'',status:currentStatusFilter,sort:document.getElementById('sortSelect')?.value||'newest',fav:showFavOnly}));}catch(e){}}
function loadFilterState(){try{const s=JSON.parse(sessionStorage.getItem('myLib_filter')||'null');if(!s)return;if(s.q){const el=document.getElementById('searchInput');if(el)el.value=s.q;}if(s.status!==undefined){currentStatusFilter=s.status;document.querySelectorAll('.sp').forEach(p=>p.classList.toggle('sp-on',p.dataset.sv===s.status));}if(s.sort){const el=document.getElementById('sortSelect');if(el)el.value=s.sort;}if(s.fav){showFavOnly=true;document.getElementById('favPill')?.classList.add('active');}}catch(e){}}

// ── 다크모드 ──
function initDark(){const dark=localStorage.getItem('myLib_dark')==='1';document.body.classList.toggle('dark',dark);const btn=document.getElementById('themeBtn');if(btn)btn.textContent=dark?'☀️':'🌙';}
function toggleDark(){const isDark=document.body.classList.toggle('dark');localStorage.setItem('myLib_dark',isDark?'1':'0');const btn=document.getElementById('themeBtn');if(btn)btn.textContent=isDark?'☀️':'🌙';}
async function toggleFav(id){const b=books.find(x=>x.id===id);if(!b)return;b.fav=!b.fav;await saveData();render();}
function toggleFavFilter(){showFavOnly=!showFavOnly;document.getElementById('favPill')?.classList.toggle('active',showFavOnly);render();}

// ══════════════ roundRect 폴리필 ══════════════
function canvasRoundRect(ctx,x,y,w,h,r){
  if(typeof ctx.roundRect==='function'){ctx.roundRect(x,y,w,h,r);return;}
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();
}

// ══════════════ 유틸 ══════════════
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2);}
function getGenre(name){const color=GENRE_COLOR_MAP[name]||'#808080';return{name:name||'기타',color};}
function hexToRgba(hex,a){if(!hex||hex.length<7)return`rgba(128,128,128,${a})`;return`rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${a})`;}
function fmtPrice(n){return n?Number(n).toLocaleString('ko-KR')+'원':'-';}
function daysBetween(a,b){if(!a||!b)return null;const diff=new Date(b)-new Date(a);return diff>0?Math.round(diff/86400000):null;}
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function highlight(text,q){if(!q||!text)return escHtml(text||'');const esc=q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return escHtml(text).replace(new RegExp(esc,'gi'),m=>`<mark class="search-hl">${escHtml(m)}</mark>`);}


// ══════════════ 태그 자동완성 ══════════════
function getTagsByType(type){
  const set=new Set();
  books.forEach(b=>{
    if(type==='sojai')(b.sojaiTags||b.tags||[]).forEach(t=>set.add(t));
    else if(type==='rel')(b.relTags||b.themes||[]).forEach(t=>set.add(t));
    else if(type==='ml'){const mlArr=Array.isArray(b.ml)?b.ml:(b.ml&&b.ml.name?[b.ml]:[]);mlArr.forEach(m=>(m.typeTags||[]).forEach(t=>set.add(t)));}
    else if(type==='fl'){if(b.fl)(b.fl.typeTags||[]).forEach(t=>set.add(t));if(b.flTypeTags)b.flTypeTags.forEach(t=>set.add(t));}
    else if(type==='genre')(b.genre||[]).forEach(t=>set.add(t));
  });
  return [...set].sort();
}
let _acDropdown=null,_acTarget=null;
function showTagAC(inp,addFn,type){
  hideTagAC();
  const q=inp.value.trim().replace(/^#/,'');
  if(!q)return;
  const all=getTagsByType(type||'sojai');
  const matches=all.filter(t=>t.replace(/^#/,'').toLowerCase().includes(q.toLowerCase())).slice(0,8);
  if(!matches.length)return;
  const dd=document.createElement('div');
  dd.className='tag-autocomplete';
  matches.forEach(tag=>{
    const item=document.createElement('div');
    item.className='tag-ac-item';
    item.textContent=tag;
    item.onmousedown=e=>{e.preventDefault();inp.value=tag.replace(/^#/,'');hideTagAC();addFn();};
    dd.appendChild(item);
  });
  inp.parentNode.appendChild(dd);
  _acDropdown=dd;_acTarget=inp;
}
function hideTagAC(){if(_acDropdown){_acDropdown.remove();_acDropdown=null;_acTarget=null;}}
document.addEventListener('click',e=>{if(_acDropdown&&!_acDropdown.contains(e.target)&&e.target!==_acTarget)hideTagAC();});
// ══════════════ 태그 헬퍼 ══════════════
function _renderTagsToWrap(arr,wrapId,removeFn){const wrap=document.getElementById(wrapId);if(!wrap)return;wrap.innerHTML='';arr.forEach(tag=>{const span=document.createElement('span');span.className='stag';const txt=document.createTextNode(tag+' ');const del=document.createElement('button');del.className='stag-del';del.textContent='✕';del.onclick=(t=>()=>removeFn(t))(tag);span.appendChild(txt);span.appendChild(del);wrap.appendChild(span);});}
function renderTagsSojai(){_renderTagsToWrap(currentCtagsSojai,'selectedTagsSojai',t=>{currentCtagsSojai=currentCtagsSojai.filter(x=>x!==t);renderTagsSojai();});renderQuickTagsSojai();}
function renderTagsRel(){_renderTagsToWrap(currentCtagsRel,'selectedTagsRel',t=>{currentCtagsRel=currentCtagsRel.filter(x=>x!==t);renderTagsRel();});renderQuickTagsRel();}
function renderFlTypeTags(){_renderTagsToWrap(currentFlTypeTags,'selectedFlTypeTags',t=>{currentFlTypeTags=currentFlTypeTags.filter(x=>x!==t);renderFlTypeTags();});renderQuickTagsFlType();}
function addCtagFromInputSojai(directVal){const inp=document.getElementById('ctagInputSojai');let v=directVal!==undefined?directVal:(inp?inp.value.trim():'');if(!v)return;if(!v.startsWith('#'))v='#'+v;if(!currentCtagsSojai.includes(v)){currentCtagsSojai.push(v);renderTagsSojai();}if(inp&&directVal===undefined)inp.value='';}
function addCtagFromInputRel(directVal){const inp=document.getElementById('ctagInputRel');let v=directVal!==undefined?directVal:(inp?inp.value.trim():'');if(!v)return;if(!v.startsWith('#'))v='#'+v;if(!currentCtagsRel.includes(v)){currentCtagsRel.push(v);renderTagsRel();}if(inp&&directVal===undefined)inp.value='';}
function addCtagFlType(directVal){const inp=document.getElementById('ctagInputFlType');let v=directVal!==undefined?directVal:(inp?inp.value.trim():'');if(!v)return;if(!v.startsWith('#'))v='#'+v;if(!currentFlTypeTags.includes(v)){currentFlTypeTags.push(v);renderFlTypeTags();}if(inp&&directVal===undefined)inp.value='';}
function renderGenreTags(){_renderTagsToWrap(currentGenreTags,'selectedGenreTags',t=>{currentGenreTags=currentGenreTags.filter(x=>x!==t);renderGenreTags();});renderQuickTagsGenre();}
async function addGenreTag(directVal){const inp=document.getElementById('genreInput');const val=directVal!==undefined?directVal:(inp?inp.value.trim():'');if(!val)return;if(!currentGenreTags.includes(val)){currentGenreTags.push(val);renderGenreTags();}if(inp&&directVal===undefined)inp.value='';}

// ══════════════ 자주 쓰는 태그(quick-pick) ══════════════
function renderQuickTagRow(wrapId,allTop,selectedArr,onClickFn){
  const wrap=document.getElementById(wrapId);if(!wrap)return;
  const avail=allTop.filter(t=>!selectedArr.includes(t));
  if(!avail.length){wrap.innerHTML='';return;}
  wrap.innerHTML='<span class="quick-tags-label">빠른 선택</span>'+avail.map(t=>`<button type="button" class="quick-tag-chip" data-tag="${encodeURIComponent(t)}">+ ${escHtml(t)}</button>`).join('');
  wrap.querySelectorAll('.quick-tag-chip').forEach(btn=>{btn.onclick=()=>onClickFn(decodeURIComponent(btn.dataset.tag));});
}
function renderQuickTagsGenre(){renderQuickTagRow('quickTagsGenre',RIDI_GENRES,currentGenreTags,tag=>addGenreTag(tag));}
function renderQuickTagsSojai(){renderQuickTagRow('quickTagsSojai',RIDI_SOJAI,currentCtagsSojai.map(t=>t.replace(/^#/,'')),tag=>addCtagFromInputSojai(tag));}
function renderQuickTagsRel(){renderQuickTagRow('quickTagsRel',RIDI_REL,currentCtagsRel.map(t=>t.replace(/^#/,'')),tag=>addCtagFromInputRel(tag));}
function renderQuickTagsFlType(){renderQuickTagRow('quickTagsFlType',RIDI_FL_TYPES,currentFlTypeTags.map(t=>t.replace(/^#/,'')),tag=>addCtagFlType(tag));}
function renderQuickTagsMl(mid,typeTagsWrap){
  const quickWrap=document.getElementById('mlQuickTags-'+mid);if(!quickWrap)return;
  const m=mlData.find(x=>x.id===mid);if(!m)return;
  const selected=(m.typeTags||[]).map(t=>t.replace(/^#/,''));
  const top=RIDI_ML_TYPES.filter(t=>!selected.includes(t));
  if(!top.length){quickWrap.innerHTML='';return;}
  quickWrap.innerHTML='<span class="quick-tags-label">빠른 선택</span>'+top.map(t=>`<button type="button" class="quick-tag-chip" data-tag="${encodeURIComponent(t)}">+ ${escHtml(t)}</button>`).join('');
  quickWrap.querySelectorAll('.quick-tag-chip').forEach(btn=>{
    btn.onclick=()=>{
      const tag=decodeURIComponent(btn.dataset.tag);
      let val=tag.startsWith('#')?tag:'#'+tag;
      if(!m.typeTags)m.typeTags=[];
      if(!m.typeTags.includes(val)){m.typeTags.push(val);_renderMlTypeTag(mid,val,typeTagsWrap);renderQuickTagsMl(mid,typeTagsWrap);}
    };
  });
}

// ══════════════ 감정 태그 ══════════════
function renderMoodSelector(){const wrap=document.getElementById('moodSelector');if(!wrap)return;wrap.innerHTML='';MOOD_OPTIONS.forEach(m=>{const btn=document.createElement('button');btn.className='mood-opt'+(currentMoods.includes(m.label)?' mood-on':'');btn.textContent=m.emoji+' '+m.label;if(currentMoods.includes(m.label)){btn.style.background=m.bg;btn.style.color=m.color;btn.style.borderColor=m.color+'60';}btn.onclick=()=>toggleMood(m.label);wrap.appendChild(btn);});}
function toggleMood(label){if(currentMoods.includes(label))currentMoods=currentMoods.filter(m=>m!==label);else currentMoods.push(label);renderMoodSelector();}

// ══════════════ 남주 아코디언 ══════════════
function addMlEntry(){mlData.push({id:uid(),name:'',age:'',typeTags:[],intro:'',sub:false,open:true});renderMlAcc();}
function removeMlEntry(id){mlData=mlData.filter(m=>m.id!==id);renderMlAcc();}
function toggleMlEntry(id){const m=mlData.find(x=>x.id===id);if(m)m.open=!m.open;renderMlAcc();}
function syncMl(id,field,val){const m=mlData.find(x=>x.id===id);if(m)m[field]=val;}
function renderMlAcc(){
  const wrap=document.getElementById('mlAccWrap');if(!wrap)return;wrap.innerHTML='';
  mlData.forEach(m=>{
    const isSub=!!m.sub;const item=document.createElement('div');item.className='ml-acc-item';
    const head=document.createElement('div');head.className='ml-acc-head';head.onclick=()=>toggleMlEntry(m.id);
    const arrow=document.createElement('span');arrow.className='ml-acc-arrow'+(m.open?' open':'');arrow.innerHTML='&#9654;';
    const lbl=document.createElement('span');lbl.className='ml-acc-label'+(isSub?' sub':'');lbl.textContent=(isSub?'🩵':'💙')+' '+(isSub?'서브남':'남주');
    const smry=document.createElement('span');smry.className='ml-acc-summary';smry.textContent=m.name||'(이름 없음)';
    const del=document.createElement('button');del.className='ml-acc-del';del.textContent='✕';del.onclick=e=>{e.stopPropagation();removeMlEntry(m.id);};
    head.appendChild(arrow);head.appendChild(lbl);head.appendChild(smry);head.appendChild(del);
    const body=document.createElement('div');body.className='ml-acc-body'+(m.open?' open':'');
    const inner=document.createElement('div');inner.style.cssText='display:flex;flex-direction:column;gap:8px';
    const checkRow=document.createElement('label');checkRow.className='ml-sub-check-row';checkRow.innerHTML=`<input type="checkbox" ${isSub?'checked':''} onchange="syncMl('${m.id}','sub',this.checked);renderMlAcc()"> <span>서브남</span>`;
    const fields=document.createElement('div');fields.className='row2';
    const mkFg=(lbl,val,field)=>{const d=document.createElement('div');d.className='fg';const l=document.createElement('label');l.textContent=lbl;const i=document.createElement('input');i.type='text';i.value=val||'';i.oninput=(function(mid,f){return function(){syncMl(mid,f,this.value);};})(m.id,field);d.appendChild(l);d.appendChild(i);return d;};
    fields.appendChild(mkFg('이름',m.name,'name'));fields.appendChild(mkFg('나이',m.age,'age'));
    const typeWrap=document.createElement('div');typeWrap.className='fg';typeWrap.innerHTML='<label>유형 태그</label>';
    const typeCtag=document.createElement('div');typeCtag.className='ctag-wrap';
    const typeInputRow=document.createElement('div');typeInputRow.className='ctag-input-row';
    const typeInput=document.createElement('input');typeInput.type='text';typeInput.placeholder='#연하남, #집착남 ...';
    const typeTagsWrap=document.createElement('div');typeTagsWrap.className='selected-tags';typeTagsWrap.id='mlTypeTags-'+m.id;
    const mlQuickWrap=document.createElement('div');mlQuickWrap.className='quick-tags';mlQuickWrap.id='mlQuickTags-'+m.id;
    const addFn=(function(mid,inp,wrap){return function(){let val=inp.value.trim();if(!val)return;if(!val.startsWith('#'))val='#'+val;const m=mlData.find(x=>x.id===mid);if(!m)return;if(!m.typeTags)m.typeTags=[];if(!m.typeTags.includes(val)){m.typeTags.push(val);_renderMlTypeTag(mid,val,wrap);renderQuickTagsMl(mid,wrap);}inp.value='';};})(m.id,typeInput,typeTagsWrap);
    typeInput.oninput=function(){showTagAC(this,addFn,'ml');};typeInput.onblur=function(){setTimeout(hideTagAC,150);};typeInput.onkeydown=function(ev){if(ev.key==='Enter'){ev.preventDefault();addFn();hideTagAC();}};
    const typeAddBtn=document.createElement('button');typeAddBtn.className='ctag-add-btn';typeAddBtn.textContent='+';typeAddBtn.onclick=addFn;
    typeInputRow.appendChild(typeInput);typeInputRow.appendChild(typeAddBtn);typeCtag.appendChild(typeInputRow);typeCtag.appendChild(mlQuickWrap);typeCtag.appendChild(typeTagsWrap);typeWrap.appendChild(typeCtag);
    (m.typeTags||[]).forEach(tag=>_renderMlTypeTag(m.id,tag,typeTagsWrap));
    const introWrap=document.createElement('div');introWrap.className='fg';const introLabel=document.createElement('label');introLabel.textContent='소개';const introTa=document.createElement('textarea');introTa.rows=2;introTa.style.cssText='resize:none;overflow:hidden;min-height:54px';introTa.value=m.intro||'';introTa.oninput=(function(mid){return function(){syncMl(mid,'intro',this.value);autosizeEl(this);};})(m.id);introWrap.appendChild(introLabel);introWrap.appendChild(introTa);
    inner.appendChild(checkRow);inner.appendChild(fields);inner.appendChild(typeWrap);inner.appendChild(introWrap);
    body.appendChild(inner);item.appendChild(head);item.appendChild(body);wrap.appendChild(item);
    autosizeEl(introTa);
    renderQuickTagsMl(m.id,typeTagsWrap);
  });
}
function _renderMlTypeTag(id,tag,wrap){const span=document.createElement('span');span.className='stag';const txt=document.createTextNode(tag+' ');const del=document.createElement('button');del.className='stag-del';del.textContent='✕';del.onclick=(t=>()=>{const m=mlData.find(x=>x.id===id);if(m)m.typeTags=(m.typeTags||[]).filter(x=>x!==t);span.remove();renderQuickTagsMl(id,wrap);})(tag);span.appendChild(txt);span.appendChild(del);wrap.appendChild(span);}

// ══════════════ PAGE SWITCH ══════════════
function switchPage(id,el){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));document.getElementById('page-'+id).classList.add('active');el.classList.add('active');if(id==='stats')renderStats();if(id==='calendar')renderCalendar();updateLogo();}

// ══════════════ SHARE CARD ══════════════
const SHARE_THEMES={cream:{bg:'#fdf6ee',bg2:'#f0e8d8',accent:'#8a5a36',text:'#2a1a0a',star:'#c09050',line:'#e0d0b8'},navy:{bg:'#1a2440',bg2:'#233060',accent:'#c0d0f0',text:'#e8eeff',star:'#f5c518',line:'#3a4a70'},rose:{bg:'#fdf0f4',bg2:'#f0d8e4',accent:'#9b4f6a',text:'#2a1020',star:'#c06080',line:'#e8c8d4'},dark:{bg:'#13121a',bg2:'#1e1c28',accent:'#9ab5e0',text:'#f0eef8',star:'#f5c518',line:'#2e2c3e'}};
function openShare(id){currentShareId=id;shareTheme='cream';document.getElementById('shareMsg').value='';document.getElementById('shareOv').classList.add('open');setTimeout(()=>drawCard(id),50);}
function closeShare(){document.getElementById('shareOv').classList.remove('open');}
function setShareTheme(t){shareTheme=t;['cream','navy','rose','dark'].forEach(n=>{const btn=document.getElementById('thm-'+n);if(btn)btn.style.fontWeight=n===t?'700':'400';});drawCard(currentShareId);}
function downloadCard(){
  const c=document.getElementById('shareCanvas');
  try{
    const url=c.toDataURL('image/png');
    const a=document.createElement('a');a.download='book-card.png';a.href=url;a.click();
  }catch(err){
    showToast('이미지 저장에 실패했어요. 외부 URL 표지는 브라우저 보안 정책으로 저장이 막힐 수 있어요 — 표지를 파일로 업로드해서 다시 시도해보세요.');
  }
}
function drawCard(id){
  const b=books.find(x=>x.id===id);if(!b)return;
  const canvas=document.getElementById('shareCanvas');const ctx=canvas.getContext('2d');
  const W=720,H=960,P=48;ctx.clearRect(0,0,W,H);
  const th=SHARE_THEMES[shareTheme]||SHARE_THEMES.cream;
  // 배경 그라디언트
  const grad=ctx.createLinearGradient(0,0,0,H);grad.addColorStop(0,th.bg);grad.addColorStop(1,th.bg2);ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  // 표지 영역
  const cW=260,cH=390,cX=(W-cW)/2,cY=P+20;
  ctx.shadowColor='rgba(0,0,0,.2)';ctx.shadowBlur=24;ctx.shadowOffsetY=8;
  canvasRoundRect(ctx,cX,cY,cW,cH,10);ctx.fillStyle=th.bg2;ctx.fill();ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  if(b.cover){const coverImg=new Image();
    // 주의: crossOrigin을 설정하면 CORS 헤더가 없는 외부 이미지 URL은 로드 자체가 막혀 표지가 아예 안 보였음.
    // crossOrigin 없이 로드하면 화면 표시는 정상적으로 되고, 다운로드(toDataURL) 시에만 캔버스가 오염되어 실패할 수 있음 (downloadCard의 try/catch로 안내).
    if(b.cover.startsWith('data:'))coverImg.crossOrigin=null;
    coverImg.onload=()=>{ctx.save();canvasRoundRect(ctx,cX,cY,cW,cH,10);ctx.clip();ctx.drawImage(coverImg,cX,cY,cW,cH);ctx.restore();_drawCardText(ctx,b,th,W,H,P,cY,cH);};coverImg.onerror=()=>{_drawCardText(ctx,b,th,W,H,P,cY,cH);};coverImg.src=b.cover;}else{_drawCardText(ctx,b,th,W,H,P,cY,cH);}
}
function _drawCardText(ctx,b,th,W,H,P,cY,cH){
  const textY=cY+cH+36;
  const genreTxt=(b.genre||[]).join(' · ')||'';
  ctx.font='bold 18px "Noto Sans KR",sans-serif';ctx.fillStyle=th.accent;ctx.textAlign='center';if(genreTxt)ctx.fillText(genreTxt,W/2,textY);
  ctx.font='bold 36px "DM Serif Display",serif';ctx.fillStyle=th.text;ctx.textAlign='center';const title=b.title||'';if(title.length>16){ctx.font='bold 28px "DM Serif Display",serif';}ctx.fillText(title,W/2,textY+44);
  if(b.author){ctx.font='400 20px "Noto Sans KR",sans-serif';ctx.fillStyle=th.accent;ctx.fillText(b.author,W/2,textY+82);}
  if(b.rating){const starX=W/2-(b.rating*22)/2;ctx.font='24px serif';ctx.fillStyle=th.star;ctx.textAlign='left';for(let i=0;i<b.rating;i++)ctx.fillText('★',starX+i*22,textY+118);}
  const msg=document.getElementById('shareMsg')?.value.trim()||'';
  if(msg){ctx.font='italic 22px "Noto Serif KR",serif';ctx.fillStyle=th.text;ctx.globalAlpha=.75;ctx.textAlign='center';ctx.fillText('"'+msg+'"',W/2,textY+160);ctx.globalAlpha=1;}
  ctx.strokeStyle=th.line;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(P*2,H-56);ctx.lineTo(W-P*2,H-56);ctx.stroke();
  ctx.font='500 15px "Noto Sans KR",sans-serif';ctx.fillStyle=th.accent;ctx.globalAlpha=.5;ctx.textAlign='center';ctx.fillText('나의 서재',W/2,H-30);ctx.globalAlpha=1;
}


// ══════════════ JSON ══════════════
function exportJSON(){const data={exportVersion:6,exportedAt:new Date().toISOString(),libName:localStorage.getItem('myLib_libName')||'나의 서재',libEmoji:localStorage.getItem('myLib_libEmoji')||'📚',books};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`mylibrary-v6-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);showToast('내보내기 완료! ✅');}
function openJsonMenu(){document.getElementById('jsonOv').classList.add('open');}
function closeJsonMenu(){document.getElementById('jsonOv').classList.remove('open');}
let _pendingImportData=null;
function importJSON(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    try{
      const data=JSON.parse(ev.target.result);
      if(!data.books||!Array.isArray(data.books))throw new Error('books 배열 없음');
      data.books=data.books.map(normalizeBook);
      _pendingImportData=data;
      document.getElementById('importChoiceInfo').textContent=`불러올 파일에 책 ${data.books.length}권이 들어있어요. 현재 서재에는 ${books.length}권이 있어요.`;
      document.getElementById('importChoiceOv').classList.add('open');
    }catch(err){showToast('JSON 파일 오류: '+err.message);}
  };
  reader.readAsText(file);e.target.value='';
}
function cancelImportChoice(){_pendingImportData=null;document.getElementById('importChoiceOv').classList.remove('open');}
async function confirmImportChoice(mode){
  const data=_pendingImportData;if(!data)return;
  document.getElementById('importChoiceOv').classList.remove('open');
  if(mode==='overwrite'){
    books=data.books;
    if(data.libName)localStorage.setItem('myLib_libName',data.libName);
    if(data.libEmoji)localStorage.setItem('myLib_libEmoji',data.libEmoji);
    await saveData();updateLogo();render();closeJsonMenu();showToast('덮어쓰기 완료! ✅ '+books.length+'권');
  }else{
    const existingIds=new Set(books.map(b=>b.id));
    const newBooks=data.books.filter(b=>!existingIds.has(b.id));
    const skipped=data.books.length-newBooks.length;
    books=books.concat(newBooks);
    await saveData();render();closeJsonMenu();
    showToast(`병합 완료! ✅ 새 책 ${newBooks.length}권 추가${skipped?` (중복 ${skipped}권 건너뜀)`:''}`);
  }
  _pendingImportData=null;
}

// ══════════════ 랜덤 책 ══════════════
function openRandomBook(){const wishBooks=books.filter(b=>b.status==='읽고싶어요');const list=wishBooks.length?wishBooks:books;if(!list.length)return showToast('책이 없어요!');const b=list[Math.floor(Math.random()*list.length)];openDetail(b.id);showToast('🎲 오늘의 책: '+b.title);}

// ══════════════ 리디북스 자동 입력 ══════════════
function decodeHtmlEntities(str){
  return str.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'").replace(/&nbsp;/g,' ');
}
async function fetchRidiBook(){
  const inp=document.getElementById('ridiUrlInput');
  const btn=document.getElementById('ridiUrlBtn');
  const url=(inp?.value||'').trim();
  if(!url||!url.includes('ridibooks.com/books/')){showToast('올바른 리디북스 URL을 입력해주세요.');return;}
  if(btn){btn.textContent='불러오는 중...';btn.disabled=true;}
  let html='';
  try{
    const resp=await fetch(RIDI_PROXY_URL+'?url='+encodeURIComponent(url),{
      headers:{'Authorization':'Bearer '+SUPABASE_ANON_KEY}
    });
    if(!resp.ok) throw new Error('프록시 오류: '+resp.status);
    html=await resp.text();
    if(!html||!html.includes('og:title')) throw new Error('페이지를 불러오지 못했어요');

    // ── 메타 태그 파싱: 따옴표 혼재 대응 ──
    const getMeta=p=>{
      const esc=p.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      // property/name 앞에 오는 경우
      const patterns=[
        new RegExp(`<meta[^>]+(?:property|name)=["']${esc}["'][^>]+content="([^"]*)"`, 'i'),
        new RegExp(`<meta[^>]+(?:property|name)=["']${esc}["'][^>]+content='([^']*)'`, 'i'),
        // content가 앞에 오는 경우
        new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)=["']${esc}["']`, 'i'),
        new RegExp(`<meta[^>]+content='([^']*)'[^>]+(?:property|name)=["']${esc}["']`, 'i'),
      ];
      for(const re of patterns){const m=html.match(re);if(m&&m[1])return decodeHtmlEntities(m[1]);}
      return'';
    };

    // ── JSON-LD에서 저자 추출 ──
    let authorFromLd='';
    const ldMatch=html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if(ldMatch){try{const ld=JSON.parse(ldMatch[1]);if(ld.author){const a=ld.author;authorFromLd=Array.isArray(a)?a.map(x=>x.name||x).join(', '):(a.name||a);}if(!authorFromLd&&ld.creator)authorFromLd=Array.isArray(ld.creator)?ld.creator.map(x=>x.name||x).join(', '):(ld.creator.name||ld.creator);}catch(e){}}

    // ── 정보 추출 ──
    const ogTitle=getMeta('og:title');
    const ogImage=getMeta('og:image');
    const ogDesc=getMeta('og:description')||getMeta('description');
    const kwRaw=getMeta('keywords');
    let title=ogTitle.replace(/\s*-\s*(최신권.*|완결.*|독점.*|\d+권.*|무료.*|리디에만.*)/gi,'').trim()||ogTitle;
    const kws=kwRaw.split(',').map(k=>k.trim()).filter(Boolean);
    const genreMatches=kws.filter(k=>RIDI_GENRES.includes(k));
    const sojaiMatches=kws.filter(k=>RIDI_SOJAI.includes(k));
    const relMatches=kws.filter(k=>RIDI_REL.includes(k));
    const mlMatches=kws.filter(k=>RIDI_ML_TYPES.includes(k));
    const flMatches=kws.filter(k=>RIDI_FL_TYPES.includes(k));
    const ageRating=kws.includes('19+')?'19세':kws.includes('15+')?'15세':'';
    const bookType=kws.includes('단행본')?'단행본':kws.includes('웹소설')?'웹소설':'';
    const isAdultPlaceholder=ogImage.includes('cover_adult')||ogImage.includes('adult');

    // ── 폼 채우기 ──
    if(title&&!document.getElementById('f-title').value)document.getElementById('f-title').value=title;
    if(authorFromLd&&!document.getElementById('f-author').value)document.getElementById('f-author').value=authorFromLd;
    if(ogDesc){const s=document.getElementById('f-summary');if(s&&!s.value){s.value=ogDesc.replace(/\s*\.\.\.\s*$/,'').trim();autosizeEl(s);}}
    if(!document.getElementById('f-platform').value)document.getElementById('f-platform').value='리디';
    document.getElementById('f-platformurl').value=url;
    if(ageRating)document.getElementById('f-agerating').value=ageRating;
    if(bookType)document.getElementById('f-booktype').value=bookType;
    if(ogImage&&!isAdultPlaceholder&&!currentCover){currentCover=ogImage;document.getElementById('coverBox').innerHTML=`<img src="${currentCover}" alt="">`;}
    genreMatches.forEach(g=>{if(!currentGenreTags.includes(g))currentGenreTags.push(g);});renderGenreTags();
    sojaiMatches.forEach(t=>{const tag='#'+t;if(!currentCtagsSojai.includes(tag))currentCtagsSojai.push(tag);});renderTagsSojai();
    relMatches.forEach(t=>{const tag='#'+t;if(!currentCtagsRel.includes(tag))currentCtagsRel.push(tag);});renderTagsRel();
    if(mlMatches.length){if(!mlData.length)mlData.push({id:uid(),name:'',age:'',typeTags:[],intro:'',sub:false,open:true});mlMatches.forEach(t=>{const tag='#'+t;if(!mlData[0].typeTags.includes(tag))mlData[0].typeTags.push(tag);});renderMlAcc();}
    if(flMatches.length){flMatches.forEach(t=>{const tag='#'+t;if(!currentFlTypeTags.includes(tag))currentFlTypeTags.push(tag);});renderFlTypeTags();}

    const filled=[];
    if(title)filled.push('제목');
    if(authorFromLd)filled.push('저자');
    if(!isAdultPlaceholder&&ogImage)filled.push('표지');
    if(genreMatches.length)filled.push('장르');
    if(ageRating)filled.push('이용가');
    if(bookType)filled.push('책 종류');
    if(ogDesc)filled.push('줄거리');
    const tagCnt=sojaiMatches.length+relMatches.length+mlMatches.length+flMatches.length;
    if(tagCnt)filled.push(`태그 ${tagCnt}개`);
    showToast(`✅ ${filled.join(', ')} 자동 입력!${isAdultPlaceholder?' (19+ 표지는 직접 입력해주세요)':''}`);
    if(inp)inp.value='';
  }catch(e){
    console.error('Ridi fetch 오류:',e);
    showToast('불러오기 실패. 잠시 후 다시 시도해주세요.');
  }finally{
    if(btn){btn.textContent='불러오기';btn.disabled=false;}
  }
}
function searchByTag(tag){closeDetail();const inp=document.getElementById('searchInput');if(inp)inp.value=tag;currentStatusFilter='';showFavOnly=false;document.querySelectorAll('.sp').forEach(p=>p.classList.toggle('sp-on',p.dataset.sv===''));document.getElementById('favPill')?.classList.remove('active');switchPage('library',document.querySelector('[onclick*="switchPage(\'library\'"]')||document.querySelectorAll('.nav-tab')[0]);render();}

// ══════════════ 설정 (테마/폰트) ══════════════
const BG_THEMES=[{id:'default',name:'기본',colors:['#f7f6f4','#f0eeeb']},{id:'cream',name:'크림',colors:['#fdf6ee','#f5ead8']},{id:'rose',name:'로즈',colors:['#fdf0f4','#f5e0e8']},{id:'mint',name:'민트',colors:['#f0f8f4','#e0f0e8']},{id:'lavender',name:'라벤더',colors:['#f4f0fd','#e8e0f8']},{id:'sky',name:'하늘',colors:['#f0f6fd','#e0eef8']}];
const BUILTIN_FONTS=[{id:'noto-sans',name:'Noto Sans KR',css:"'Noto Sans KR',sans-serif",sample:'나의 서재 — 독서 기록',builtin:true},{id:'noto-serif',name:'Noto Serif KR',css:"'Noto Serif KR',serif",sample:'나의 서재 — 독서 기록',builtin:true},{id:'dm-serif',name:'DM Serif Display',css:"'DM Serif Display',serif",sample:'My Library — Book Log',builtin:true}];
let currentBgTheme=localStorage.getItem('myLib_bgTheme')||'default',currentFont=localStorage.getItem('myLib_font')||'noto-sans',userFonts=[];
function initBgTheme(){
  try{userFonts=JSON.parse(localStorage.getItem('myLib_userFonts')||'[]');}catch(e){userFonts=[];}
  // 저장된 폰트 FontFace 재등록 (새로고침 후 복원)
  userFonts.forEach(f=>{
    if(f.src){
      try{const ff=new FontFace(f.name,f.src);ff.load().then(loaded=>document.fonts.add(loaded)).catch(()=>{});}catch(e){}
    }
  });
  applyBgTheme(currentBgTheme);applyFont(currentFont);
}
function applyBgTheme(id){document.body.className=document.body.className.replace(/theme-\S+/g,'').trim();if(id!=='default')document.body.classList.add('theme-'+id);}
function applyFont(id){const all=[...BUILTIN_FONTS,...userFonts];const f=all.find(x=>x.id===id)||BUILTIN_FONTS[0];document.body.style.setProperty('--font-body',f.css);}
function openSettings(){renderThemeGrid();renderFontList();document.getElementById('settingsOv').classList.add('open');}
function closeSettings(){document.getElementById('settingsOv').classList.remove('open');}
function renderThemeGrid(){const el=document.getElementById('themeGrid');el.innerHTML=BG_THEMES.map(t=>`<div class="theme-swatch${t.id===currentBgTheme?' active':''}" onclick="selectBgTheme('${t.id}')"><div class="theme-circle" style="background:linear-gradient(135deg,${t.colors[0]},${t.colors[1]})"></div><span class="theme-name">${t.name}</span></div>`).join('');}
function selectBgTheme(id){currentBgTheme=id;localStorage.setItem('myLib_bgTheme',id);applyBgTheme(id);renderThemeGrid();}
function renderFontList(){const el=document.getElementById('fontList');const all=[...BUILTIN_FONTS,...userFonts];el.innerHTML=all.map(f=>`<div class="font-item${f.id===currentFont?' active':''}" onclick="selectFont('${f.id}')"><div style="flex:1"><div class="font-item-name" style="font-family:${f.css}">${f.name}</div><div class="font-item-sample" style="font-family:${f.css}">${f.sample||'나의 서재'}</div></div>${!f.builtin?`<button class="font-del" onclick="event.stopPropagation();deleteUserFont('${f.id}')">✕</button>`:''}</div>`).join('');}
function selectFont(id){currentFont=id;localStorage.setItem('myLib_font',id);applyFont(id);renderFontList();}
async function handleFontUpload(e){
  const files=Array.from(e.target.files);
  let added=0;
  for(const file of files){
    const name=file.name.replace(/\.[^.]+$/,'');
    const id='uf-'+uid();
    const ext=file.name.split('.').pop().toLowerCase();
    const mime={ttf:'font/truetype',otf:'font/opentype',woff:'font/woff',woff2:'font/woff2'}[ext]||'font/truetype';
    const fmt=ext==='woff2'?'woff2':ext==='woff'?'woff':'truetype';
    try{
      const ab=await file.arrayBuffer();
      // 큰 파일도 안전한 base64 변환 (스택오버플로우 방지)
      const bytes=new Uint8Array(ab);
      let b64='';
      const chunk=8192;
      for(let i=0;i<bytes.length;i+=chunk){
        b64+=String.fromCharCode(...bytes.subarray(i,i+chunk));
      }
      const base64=btoa(b64);
      const src=`url('data:${mime};base64,${base64}') format('${fmt}')`;
      const fontFace=new FontFace(name,src);
      await fontFace.load();
      document.fonts.add(fontFace);
      userFonts.push({id,name,css:`'${name}',sans-serif`,sample:'가나다라마바사 ABC 123',src});
      added++;
    }catch(err){showToast('폰트 로드 실패: '+name+' ('+err.message+')');continue;}
  }
  if(!added){e.target.value='';return;}
  // localStorage에 src(base64)까지 저장해서 새로고침 후 복원 가능
  try{
    localStorage.setItem('myLib_userFonts',JSON.stringify(userFonts));
  }catch(err){
    // 용량 초과 시 src 없이 저장 (새로고침 후 폰트 이름만 남음)
    try{
      localStorage.setItem('myLib_userFonts',JSON.stringify(userFonts.map(f=>({id:f.id,name:f.name,css:f.css,sample:f.sample}))));
      showToast('폰트 데이터가 너무 커서 새로고침 후 재업로드가 필요할 수 있어요.');
    }catch(e2){}
  }
  renderFontList();showToast(added+'개 폰트가 추가됐어요!');
  e.target.value='';
}
function deleteUserFont(id){userFonts=userFonts.filter(f=>f.id!==id);if(currentFont===id){currentFont='noto-sans';applyFont(currentFont);localStorage.setItem('myLib_font',currentFont);}try{localStorage.setItem('myLib_userFonts',JSON.stringify(userFonts));}catch(e){}renderFontList();showToast('폰트가 삭제됐어요.');}


// ══════════════ 서재 이름 ══════════════
const LIB_EMOJIS=['📚','🔖','📖','✨','💫','🌸','🌷','🌺','💐','🍀','🌿','☘️','🦋','🌙','⭐','💖','💜','💙','🩷','🍵','☕','🕯️','🎀'];
let selectedLibEmoji=localStorage.getItem('myLib_libEmoji')||'📚';
function openLibName(){
  selectedLibEmoji=localStorage.getItem('myLib_libEmoji')||'📚';
  document.getElementById('libNameInput').value=localStorage.getItem('myLib_libName')||'나의 서재';
  const grid=document.getElementById('emojiGrid');
  grid.innerHTML=LIB_EMOJIS.map(e=>`<button class="emoji-btn${e===selectedLibEmoji?' sel':''}" onclick="selectLibEmoji('${e}')">${e}</button>`).join('');
  updateLibPreview();document.getElementById('libNameOv').classList.add('open');
}
function closeLibName(){document.getElementById('libNameOv').classList.remove('open');}
function selectLibEmoji(e){selectedLibEmoji=e;document.querySelectorAll('.emoji-btn').forEach(btn=>btn.classList.toggle('sel',btn.textContent===e));updateLibPreview();}
function updateLibPreview(){document.getElementById('libNamePreviewEmoji').textContent=selectedLibEmoji;document.getElementById('libNamePreviewText').textContent=document.getElementById('libNameInput').value||'나의 서재';}
function saveLibName(){const name=document.getElementById('libNameInput').value.trim()||'나의 서재';localStorage.setItem('myLib_libName',name);localStorage.setItem('myLib_libEmoji',selectedLibEmoji);updateLogo();closeLibName();showToast('서재 이름이 바뀌었어요!');}
function updateLogo(){const emoji=localStorage.getItem('myLib_libEmoji')||'📚',name=localStorage.getItem('myLib_libName')||'나의 서재';const eEl=document.getElementById('logoEmoji'),nEl=document.getElementById('logoName');if(eEl)eEl.textContent=emoji;if(nEl){const parts=name.split(' ');if(parts.length>1){nEl.innerHTML=escHtml(parts.slice(0,-1).join(' '))+' <em>'+escHtml(parts[parts.length-1])+'</em>';}else nEl.innerHTML='<em>'+escHtml(name)+'</em>';}}

// ══════════════ 공통 ══════════════
function ovClick(e,ovId,closeFn){if(e.target.id===ovId)closeFn();}
let _toastTimer=null;
function showToast(msg){const existing=document.querySelector('.toast');if(existing)existing.remove();if(_toastTimer)clearTimeout(_toastTimer);const el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.appendChild(el);_toastTimer=setTimeout(()=>{el.remove();_toastTimer=null;},2600);}

// ══════════════ 커스텀 확인 모달 (native confirm 대체) ══════════════
let _confirmResolve=null;
function showConfirm(title,message,confirmLabel){
  return new Promise(resolve=>{
    document.getElementById('confirmTitle').textContent=title||'확인';
    document.getElementById('confirmMsg').textContent=message||'';
    document.getElementById('confirmOkBtn').textContent=confirmLabel||'확인';
    _confirmResolve=resolve;
    document.getElementById('confirmOv').classList.add('open');
  });
}
function confirmOk(){document.getElementById('confirmOv').classList.remove('open');if(_confirmResolve)_confirmResolve(true);_confirmResolve=null;}
function confirmCancel(){document.getElementById('confirmOv').classList.remove('open');if(_confirmResolve)_confirmResolve(false);_confirmResolve=null;}

// ══════════════ 자동 높이 조절 textarea ══════════════
function autosizeEl(el){if(!el)return;el.style.height='auto';el.style.height=el.scrollHeight+'px';}

// ══════════════ 헤더 더보기 메뉴 (모바일) ══════════════
function toggleMoreMenu(){document.getElementById('moreMenu')?.classList.toggle('open');}
function closeMoreMenu(){document.getElementById('moreMenu')?.classList.remove('open');}
document.addEventListener('click',e=>{
  const menu=document.getElementById('moreMenu'),btn=document.getElementById('moreBtn');
  if(menu&&menu.classList.contains('open')&&!menu.contains(e.target)&&e.target!==btn&&!btn?.contains(e.target)){closeMoreMenu();}
});
