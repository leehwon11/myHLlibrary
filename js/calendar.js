// ══════════════ 나의 서재 — Calendar ══════════════

let _calYear=new Date().getFullYear();
let _calMonth=new Date().getMonth();

function renderCalendar(){
  const today=new Date();
  const todayStr=today.toISOString().slice(0,10);
  const year=_calYear;
  const month=_calMonth;
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const monthStr=String(month+1).padStart(2,'0');

  const titleEl=document.getElementById('calNavTitle');
  if(titleEl) titleEl.textContent=year+'년 '+(month+1)+'월';

  const dayHeaders=['일','월','화','수','목','금','토'];
  const headerEl=document.getElementById('calDaysHeader');
  if(headerEl) headerEl.innerHTML=dayHeaders.map((d,i)=>`<div class="cal-day-hdr"${i===0?' style="color:var(--warn)"':''}${i===6?' style="color:var(--acc2)"':''}>${d}</div>`).join('');

  const done=books.filter(b=>b.status==='완독'&&b.dateend);
  const monthBooks=done.filter(b=>b.dateend.startsWith(`${year}-${monthStr}`))
    .sort((a,b)=>a.dateend.localeCompare(b.dateend));

  const dayMap={};
  monthBooks.forEach(b=>{
    const day=parseInt(b.dateend.slice(8,10));
    if(!dayMap[day]) dayMap[day]=[];
    dayMap[day].push(b);
  });

  let gridHtml='';
  for(let i=0;i<firstDay;i++) gridHtml+=`<div class="cal-day cal-empty"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=`${year}-${monthStr}-${String(d).padStart(2,'0')}`;
    const hasBook=dayMap[d];
    const isToday=dateStr===todayStr;
    const dow=(firstDay+d-1)%7;
    let cls='cal-day';
    if(hasBook) cls+=' has-book';
    if(isToday) cls+=' today';
    if(dow===0) cls+=' sun';
    if(dow===6) cls+=' sat';
    const dot=hasBook?`<span class="cal-dot"></span>`:'';
    const onclick=hasBook?`onclick="scrollToCalBooks()"`:'';
    gridHtml+=`<div class="${cls}" ${onclick}>${d}${dot}</div>`;
  }
  const daysEl=document.getElementById('calDays');
  if(daysEl) daysEl.innerHTML=gridHtml;

  let booksListHtml='';
  if(monthBooks.length){
    booksListHtml=monthBooks.map(b=>{
      const day=b.dateend.slice(8,10);
      const starsHtml=b.rating?'★'.repeat(b.rating):'';
      return `<div class="cal-book-item" onclick="if(typeof openDetail==='function')openDetail('${b.id}')">
        <span class="cal-book-date">${day}일</span>
        <span class="cal-book-title">${escHtml(b.title)}</span>
        ${starsHtml?`<span style="font-size:11px;color:#e8a020">${starsHtml}</span>`:''}
      </div>`;
    }).join('');
  }else{
    booksListHtml=`<p style="font-size:12px;color:var(--txt4);text-align:center;padding:16px 0">이 달에 완독한 책이 없어요.</p>`;
  }
  const booksListEl=document.getElementById('calBooksList');
  if(booksListEl) booksListEl.innerHTML=booksListHtml;

  const sidebarTitle=document.querySelector('.cal-sidebar-title');
  if(sidebarTitle) sidebarTitle.textContent=(month+1)+'월 완독 ('+monthBooks.length+'권)';

  renderGoal();
}

function renderGoal(){
  const realYear=new Date().getFullYear();
  const done=books.filter(b=>b.status==='완독'&&b.dateend);
  const doneThisYear=done.filter(b=>b.dateend.startsWith(String(realYear)));
  const goal=appSettings.yearlyGoal||0;

  const doneNum=document.getElementById('goalDoneNum');
  const targetNum=document.getElementById('goalTargetNum');
  const bar=document.getElementById('goalBar');
  const pctEl=document.getElementById('goalPct');
  const msgEl=document.getElementById('goalMsg');
  const inputEl=document.getElementById('goalInput');

  if(doneNum) doneNum.textContent=doneThisYear.length;

  if(goal){
    if(targetNum) targetNum.textContent=goal;
    const pct=Math.min(100,Math.round(doneThisYear.length/goal*100));
    if(bar){bar.style.width=pct+'%';bar.className='goal-bar'+(pct>=100?' done-all':'');}
    if(pctEl) pctEl.textContent=pct+'% 달성';
    if(msgEl) msgEl.textContent=pct>=100?'🎉 목표 달성!':'';
    if(inputEl) inputEl.value=goal;
  }else{
    if(targetNum) targetNum.textContent='—';
    if(bar) bar.style.width='0%';
    if(pctEl) pctEl.textContent='목표를 설정해보세요';
    if(msgEl) msgEl.textContent='';
  }
}

function calPrevMonth(){
  _calMonth--;
  if(_calMonth<0){_calMonth=11;_calYear--;}
  renderCalendar();
}
function calNextMonth(){
  _calMonth++;
  if(_calMonth>11){_calMonth=0;_calYear++;}
  renderCalendar();
}
function calGoToday(){
  const n=new Date();
  _calYear=n.getFullYear();
  _calMonth=n.getMonth();
  renderCalendar();
}

function toggleGoalEdit(){
  const row=document.getElementById('goalEditRow');
  const display=document.getElementById('goalDisplay');
  if(!row) return;
  const isEditing=row.style.display!=='none';
  row.style.display=isEditing?'none':'block';
  if(display) display.style.display=isEditing?'block':'none';
  if(!isEditing){
    const inp=document.getElementById('goalInput');
    if(inp) inp.value=appSettings.yearlyGoal||'';
    inp?.focus();
  }
}

function saveGoal(){
  const inp=document.getElementById('goalInput');
  const v=parseInt(inp?.value)||0;
  appSettings.yearlyGoal=Math.max(0,Math.min(999,v));
  saveData();
  toggleGoalEdit();
  renderGoal();
  if(typeof renderStats==='function') renderStats();
  showToast('목표를 저장했어요!');
}

function clearGoal(){
  appSettings.yearlyGoal=0;
  saveData();
  toggleGoalEdit();
  renderGoal();
  if(typeof renderStats==='function') renderStats();
  showToast('목표가 삭제됐어요.');
}

function scrollToCalBooks(){
  const section=document.getElementById('calBooksList');
  if(section) section.scrollIntoView({behavior:'smooth',block:'start'});
}
