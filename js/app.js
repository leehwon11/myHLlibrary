// ══════════════ 나의 서재 — Core App ══════════════

// ── Constants ──
const DEFAULT_GENRES=[
  {id:'현대물',name:'현대물',color:'#3a8060'},{id:'실존역사물',name:'실존역사물',color:'#7a5030'},
  {id:'가상시대물',name:'가상시대물',color:'#5a4080'},{id:'판타지물',name:'판타지물',color:'#3a5fa0'},
  {id:'동양풍',name:'동양풍',color:'#c07820'},{id:'서양풍',name:'서양풍',color:'#9b4f6a'},
  {id:'신화물',name:'신화물',color:'#2a8090'},{id:'궁정로맨스',name:'궁정로맨스',color:'#b04060'},
  {id:'캠퍼스물',name:'캠퍼스물',color:'#3a9040'},{id:'학원물',name:'학원물',color:'#4a70c0'},
  {id:'무협물',name:'무협물',color:'#8a3020'},{id:'아카데미',name:'아카데미',color:'#6040a0'},
  {id:'헌터물',name:'헌터물',color:'#505050'}
];
const GENRE_COLOR_MAP=Object.fromEntries(DEFAULT_GENRES.map(g=>[g.name,g.color]));
const RIDI_GENRES=['현대물','실존역사물','가상시대물','판타지물','동양풍','서양풍','신화물','궁정로맨스','캠퍼스물','학원물','무협물','아카데미','헌터물'];
const RIDI_SOJAI=['차원이동','회귀/타임슬립','전생/환생','영혼체인지/빙의','초능력','초월적존재','왕족/귀족','외국인/혼혈','남장여자','바람둥이','역하렘','동거','맞선','속도위반','베이비메신저','조직/암흑가','법조계','메디컬','전문직','군대물','경찰/형사/수사관','연예인','스포츠물','기억상실','오해','복수','시월드','신데렐라','권선징악','천재','가이드버스','게임빙의','공포/괴담','인외존재','오메가버스'];
const RIDI_REL=['재회물','오래된연인','첫사랑','친구>연인','라이벌/앙숙','사제지간','나이차커플','키잡물','사내연애','비밀연애','삼각관계','갑을관계','신분차이','계약연애/결혼','정략결혼','선결혼후연애','원나잇','몸정>맘정','소유욕/독점욕/질투','여공남수','금단의관계','운명적사랑','애증'];
const RIDI_ML_TYPES=['츤데레남','조신남','평범남','뇌섹남','능력남','재벌남','사이다남','직진남','계략남','능글남','다정남','애교남','유혹남','절륜남','집착남','나쁜남자','후회남','상처남','짝사랑남','순정남','철벽남','동정남','순진남','까칠남','냉정남','무심남','오만남','카리스마남','존댓말남','대형견남','연하남','사차원남'];
const RIDI_FL_TYPES=['평범녀','뇌섹녀','능력녀','재벌녀','사이다녀','직진녀','계략녀','능글녀','다정녀','애교녀','유혹녀','절륜녀','집착녀','나쁜여자','후회녀','상처녀','짝사랑녀','순정녀','철벽녀','동정녀','순진녀','까칠녀','냉정녀','무심녀','도도녀','외유내강','우월녀','걸크러시','털털녀','엉뚱녀','쾌활발랄녀'];
const STAR_LABELS=['','★ 별로였어요','★★ 보통이에요','★★★ 괜찮았어요','★★★★ 좋았어요','★★★★★ 최고였어요!'];

// ── Supabase ──
const SUPABASE_URL='https://gnwdcjdmtrwnbjbpswuh.supabase.co';
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdud2RjamRtdHJ3bmJqYnBzd3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk4NDE3OTMsImV4cCI6MjEwNTQxNzc5M30.ruGk6emBXdz4PCif06ZGX8zx0vC6rrBdfSpHK_Rdz40';
const SUPABASE_TABLE='library_data';
const SUPABASE_ROW_ID='main';
const RIDI_PROXY_URL=SUPABASE_URL+'/functions/v1/ridifetch';

let sb=null;
function getSupabase(){
  if(sb) return sb;
  if(!window.supabase){console.error('Supabase not loaded');return null;}
  sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
  return sb;
}

// ── Global State ──
let books=[];
let appSettings={libraryName:'나의 서재',yearlyGoal:30,customFont:null};
let _saveTimer=null;

// ── Utilities ──
function escHtml(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function hexToRgba(hex,a){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}
function generateId(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);}
function getGenreColor(name){return GENRE_COLOR_MAP[name]||'#808080';}
function getGenre(name){return DEFAULT_GENRES.find(g=>g.name===name)||{id:name,name,color:'#808080'};}

// ── Data Persistence ──
async function saveData(){
  clearTimeout(_saveTimer);
  _saveTimer=setTimeout(async()=>{
    const payload={books,settings:appSettings};
    try{localStorage.setItem('library_backup',JSON.stringify(payload));}catch(e){}
    const client=getSupabase();
    if(!client) return;
    const {error}=await client.from(SUPABASE_TABLE).upsert({id:SUPABASE_ROW_ID,data:payload},{onConflict:'id'});
    if(error) console.error('Save error:',error);
  },400);
}

function normalizeBook(b){
  if(!b||!b.id) return b;
  if(b.datestart!==undefined&&b.dateStart===undefined){b.dateStart=b.datestart;delete b.datestart;}
  if(b.dateend!==undefined&&b.dateEnd===undefined){b.dateEnd=b.dateend;delete b.dateend;}
  if(b.created!==undefined&&b.createdAt===undefined){b.createdAt=b.created;delete b.created;}
  if(b.genre!==undefined&&b.genres===undefined){b.genres=b.genre;delete b.genre;}
  if(b.sojaiTags!==undefined&&b.sojai===undefined){b.sojai=b.sojaiTags;delete b.sojaiTags;}
  if(b.relTags!==undefined&&b.rel===undefined){b.rel=b.relTags;delete b.relTags;}
  if(Array.isArray(b.rereads)&&b.reread===undefined){b.reread=b.rereads.length;delete b.rereads;}
  if(b.status==='읽고싶은') b.status='읽고싶어요';
  if(!b.createdAt) b.createdAt=Date.now();
  return b;
}

async function loadFromDB(){
  const client=getSupabase();
  if(client){
    try{
      const {data,error}=await client.from(SUPABASE_TABLE).select('data').eq('id',SUPABASE_ROW_ID).single();
      if(!error&&data&&data.data){
        books=(data.data.books||[]).map(normalizeBook);
        if(data.data.settings) appSettings={...appSettings,...data.data.settings};
        updateBookCount();
        return;
      }
    }catch(e){console.error('Load error:',e);}
  }
  try{
    const backup=localStorage.getItem('library_backup');
    if(backup){
      const d=JSON.parse(backup);
      books=(d.books||[]).map(normalizeBook);
      if(d.settings) appSettings={...appSettings,...d.settings};
    }
  }catch(e){}
  updateBookCount();
}

function updateBookCount(){
  const el=document.getElementById('bookCount');
  if(el) el.textContent=books.length+'권의 이야기';
}

// ── Toast ──
let _toastTimer;
function showToast(msg){
  const old=document.querySelector('.toast');
  if(old) old.remove();
  clearTimeout(_toastTimer);
  const el=document.createElement('div');
  el.className='toast';
  el.textContent=msg;
  document.body.appendChild(el);
  _toastTimer=setTimeout(()=>{el.remove();},2600);
}

// ── Page Switching ──
function switchPage(pageId){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.side-tab').forEach(t=>t.classList.remove('active'));
  const page=document.getElementById('page-'+pageId);
  if(page) page.classList.add('active');
  const tab=document.querySelector(`.side-tab[data-page="${pageId}"]`);
  if(tab) tab.classList.add('active');
  if(pageId==='stats'&&typeof renderStats==='function') renderStats();
  if(pageId==='calendar'&&typeof renderCalendar==='function') renderCalendar();
}

// ── Theme ──
function toggleTheme(){
  const root=document.documentElement;
  const current=root.getAttribute('data-theme');
  const next=current==='dark'?'light':'dark';
  root.setAttribute('data-theme',next);
  try{localStorage.setItem('theme',next);}catch(e){}
  const btn=document.getElementById('themeToggle');
  if(btn) btn.textContent=next==='dark'?'☀️':'🌙';
}

function loadTheme(){
  try{
    const saved=localStorage.getItem('theme');
    if(saved){
      document.documentElement.setAttribute('data-theme',saved);
      const btn=document.getElementById('themeToggle');
      if(btn) btn.textContent=saved==='dark'?'☀️':'🌙';
    }
  }catch(e){}
}

// ── Modals ──
function openModal(id){
  const el=document.getElementById(id);
  if(el) el.classList.add('open');
}
function closeModal(id){
  const el=document.getElementById(id);
  if(el) el.classList.remove('open');
}
function closeAllModals(){
  document.querySelectorAll('.ov.open').forEach(m=>m.classList.remove('open'));
}

let _confirmCb=null;
function showConfirm(msg,cb){
  const el=document.getElementById('confirmMsg');
  if(el) el.textContent=msg;
  _confirmCb=cb;
  openModal('ov-confirm');
}

// ── JSON Export/Import ──
function exportJSON(){
  const payload=JSON.stringify({books,settings:appSettings},null,2);
  const blob=new Blob([payload],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='나의서재_'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('JSON 파일을 다운로드했어요');
  closeModal('ov-export');
}

function importJSON(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const d=JSON.parse(e.target.result);
      if(Array.isArray(d)){
        books=d;
      }else if(d.books){
        books=d.books;
        if(d.settings) appSettings={...appSettings,...d.settings};
      }else{
        showToast('올바른 JSON 형식이 아니에요');
        return;
      }
      saveData();
      if(typeof renderBooks==='function') renderBooks();
      updateBookCount();
      showToast(books.length+'권을 불러왔어요');
      closeModal('ov-import');
    }catch(err){
      showToast('JSON 파싱 실패: '+err.message);
    }
  };
  reader.readAsText(file);
}

// ── Init ──
document.addEventListener('DOMContentLoaded',async()=>{
  loadTheme();
  await loadFromDB();
  if(typeof renderBooks==='function') renderBooks();
  if(typeof renderCalendar==='function') renderCalendar();

  document.querySelectorAll('.side-tab').forEach(tab=>{
    tab.addEventListener('click',()=>switchPage(tab.dataset.page));
  });

  document.querySelectorAll('.ov').forEach(ov=>{
    ov.addEventListener('click',(e)=>{
      if(e.target===ov) ov.classList.remove('open');
    });
  });

  document.querySelectorAll('.btn-x').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const modal=btn.closest('.ov');
      if(modal) modal.classList.remove('open');
    });
  });

  const confirmYes=document.getElementById('confirmYes');
  if(confirmYes) confirmYes.addEventListener('click',()=>{
    closeModal('ov-confirm');
    if(_confirmCb) _confirmCb();
    _confirmCb=null;
  });
  const confirmNo=document.getElementById('confirmNo');
  if(confirmNo) confirmNo.addEventListener('click',()=>{
    closeModal('ov-confirm');
    _confirmCb=null;
  });

  const themeBtn=document.getElementById('themeToggle');
  if(themeBtn) themeBtn.addEventListener('click',toggleTheme);

  const exportBtn=document.getElementById('exportBtn');
  if(exportBtn) exportBtn.addEventListener('click',exportJSON);

  const importBtn=document.getElementById('importBtn');
  if(importBtn) importBtn.addEventListener('click',()=>{
    const fi=document.getElementById('importFileInput');
    if(fi&&fi.files[0]) importJSON(fi.files[0]);
  });

  const searchInput=document.getElementById('searchInput');
  if(searchInput) searchInput.addEventListener('input',()=>{if(typeof renderBooks==='function') renderBooks();});

  const sortSelect=document.getElementById('sortSelect');
  if(sortSelect) sortSelect.addEventListener('change',()=>{if(typeof renderBooks==='function') renderBooks();});

  document.querySelectorAll('.filter-pill').forEach(pill=>{
    pill.addEventListener('click',()=>{
      if(pill.dataset.filter==='all'){
        document.querySelectorAll('.filter-pill').forEach(p=>p.classList.remove('active'));
        pill.classList.add('active');
      }else{
        document.querySelector('.filter-pill[data-filter="all"]')?.classList.remove('active');
        pill.classList.toggle('active');
        if(!document.querySelector('.filter-pill.active'))
          document.querySelector('.filter-pill[data-filter="all"]')?.classList.add('active');
      }
      if(typeof renderBooks==='function') renderBooks();
    });
  });

  const addBtn=document.getElementById('addBookBtn');
  if(addBtn) addBtn.addEventListener('click',()=>{if(typeof openEditModal==='function') openEditModal(null);});

  const ridiBtn=document.getElementById('ridiImportBtn');
  if(ridiBtn) ridiBtn.addEventListener('click',()=>{if(typeof openRidiModal==='function') openRidiModal();});

  const randomBtn=document.getElementById('randomBookBtn');
  if(randomBtn) randomBtn.addEventListener('click',()=>{
    const done=books.filter(b=>b.status==='완독');
    if(!done.length){showToast('완독한 책이 없어요');return;}
    const pick=done[Math.floor(Math.random()*done.length)];
    showToast('🎲 오늘의 책: '+pick.title);
  });
});
