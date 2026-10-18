// ══════════════ 나의 서재 — Calendar ══════════════

let _calYear=new Date().getFullYear();
let _calMonth=new Date().getMonth();

function renderCalendar(){
  const c=document.getElementById('calendarContainer');
  if(!c) return;

  const year=_calYear;
  const month=_calMonth;
  const today=new Date();
  const todayStr=today.toISOString().slice(0,10);
  const realYear=today.getFullYear();

  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const monthStr=String(month+1).padStart(2,'0');

  const done=books.filter(b=>b.status==='완독'&&b.dateend);
  const monthBooks=done.filter(b=>{
    return b.dateend.startsWith(`${year}-${monthStr}`);
  }).sort((a,b)=>a.dateend.localeCompare(b.dateend));

  const dayMap={};
  monthBooks.forEach(b=>{
    const day=parseInt(b.dateend.slice(8,10));
    if(!dayMap[day]) dayMap[day]=[];
    dayMap[day].push(b);
  });

  const doneThisYear=done.filter(b=>b.dateend.startsWith(String(realYear)));
  const goal=appSettings.yearlyGoal||30;
  const goalPct=Math.min(100,Math.round(doneThisYear.length/goal*100));

  const dayHeaders=['일','월','화','수','목','금','토'];
  let gridHtml=dayHeaders.map((d,i)=>{
    let cls='cal-day-hdr';
    return `<div class="${cls}">${d}</div>`;
  }).join('');

  for(let i=0;i<firstDay;i++) gridHtml+=`<div class="cal-cell"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=`${year}-${monthStr}-${String(d).padStart(2,'0')}`;
    const hasBook=dayMap[d];
    const isToday=dateStr===todayStr;
    let cls='cal-cell';
    if(hasBook) cls+=' has-book';
    if(isToday) cls+=' today';
    const sticker=hasBook?`<div class="cal-sticker">📖${hasBook.length>1?hasBook.length:''}</div>`:'';
    const onclick=hasBook?`onclick="scrollToCalBooks(${d})"`:'';
    gridHtml+=`<div class="${cls}" ${onclick}>${d}${sticker}</div>`;
  }

  let booksListHtml='';
  if(monthBooks.length){
    booksListHtml=monthBooks.map(b=>{
      const day=b.dateend.slice(8,10);
      const stars='★'.repeat(b.rating||0);
      return `<div class="cal-book-entry" onclick="if(typeof openDetail==='function')openDetail('${b.id}')">
        <span class="cal-book-date-text">${day}일</span>
        <span class="cal-book-title-text">${escHtml(b.title)}</span>
        <span class="cal-book-stars">${stars}</span>
      </div>`;
    }).join('');
  }else{
    booksListHtml=`<div style="text-align:center;color:var(--ink-muted);font-family:var(--font-hand);font-size:17px;padding:20px 0;">이번 달 완독한 책이 없어요</div>`;
  }

  c.innerHTML=`
  <div class="cal-layout">
    <div>
      <div class="cal-header-row">
        <button class="cal-nav" id="calPrev">◀</button>
        <div class="cal-heading">${year}년 ${month+1}월</div>
        <button class="cal-nav" id="calNext">▶</button>
      </div>
      <div class="cal-grid">${gridHtml}</div>
    </div>
    <div>
      <div class="cal-goal-section">
        <div class="cal-goal-title">올해 독서 목표</div>
        <div class="cal-goal-nums">${doneThisYear.length} <span>/ ${goal}</span></div>
        <div class="cal-progress"><div class="cal-progress-fill" style="width:${goalPct}%"></div></div>
        <div class="cal-goal-pct">${goalPct}% 달성</div>
      </div>
      <div class="cal-books-section" id="calBooksList">
        <div class="cal-books-title">${month+1}월 완독 (${monthBooks.length}권)</div>
        ${booksListHtml}
      </div>
    </div>
  </div>`;

  document.getElementById('calPrev')?.addEventListener('click',()=>{
    _calMonth--;
    if(_calMonth<0){_calMonth=11;_calYear--;}
    renderCalendar();
  });
  document.getElementById('calNext')?.addEventListener('click',()=>{
    _calMonth++;
    if(_calMonth>11){_calMonth=0;_calYear++;}
    renderCalendar();
  });
}

function scrollToCalBooks(day){
  const section=document.getElementById('calBooksList');
  if(section) section.scrollIntoView({behavior:'smooth',block:'start'});
}
