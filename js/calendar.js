// ══════════════ 나의 서재 — Calendar ══════════════

let _calYear=new Date().getFullYear();
let _calMonth=new Date().getMonth();

function renderCalendar(){
  const todayStr=localDate();
  const year=_calYear,month=_calMonth;
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const monthStr=String(month+1).padStart(2,'0');

  const titleEl=document.getElementById('calNavTitle');
  if(titleEl) titleEl.textContent=year+'년 '+(month+1)+'월';
  const headerEl=document.getElementById('calDaysHeader');
  if(headerEl) headerEl.innerHTML=['일','월','화','수','목','금','토'].map((d,i)=>`<div class="cal-day-hdr${i===0?' sun':i===6?' sat':''}">${d}</div>`).join('');

  const monthBooks=books.filter(b=>b.status==='완독'&&b.dateend&&b.dateend.startsWith(`${year}-${monthStr}`)).sort((a,b)=>a.dateend.localeCompare(b.dateend));
  const dayMap={};
  monthBooks.forEach(b=>{const day=parseInt(b.dateend.slice(8,10));(dayMap[day]=dayMap[day]||[]).push(b);});
  const streakDates=calcStreaks().dateSet;

  let gridHtml='';
  for(let i=0;i<firstDay;i++) gridHtml+=`<div class="cal-day cal-empty"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=`${year}-${monthStr}-${String(d).padStart(2,'0')}`;
    const list=dayMap[d]||[];
    const dow=(firstDay+d-1)%7;
    const inStreak=streakDates.has(dateStr)&&(streakDates.has(localDate(new Date(year,month,d-1)))||streakDates.has(localDate(new Date(year,month,d+1))));
    let cls='cal-day';
    if(list.length) cls+=' has-book';
    if(inStreak) cls+=' streak';
    if(dateStr===todayStr) cls+=' today';
    if(dow===0) cls+=' sun';
    if(dow===6) cls+=' sat';
    const click=list.length===1?` onclick="openDetail('${list[0].id}')"`:list.length>1?` onclick="scrollToCalBooks()"`:'';
    const label=list.length?` title="${escHtml(list.map(b=>b.title).join(', '))}"`:'';
    const covers=list.length?`<div class="cal-covers">${list.slice(0,list.length>2?1:2).map(b=>coverHtml(b)).join('')}${list.length>2?`<span class="cal-more">+${list.length-1}</span>`:''}</div>`:'';
    gridHtml+=`<div class="${cls}"${click}${label}><span class="cal-num">${d}</span>${covers}</div>`;
  }
  const daysEl=document.getElementById('calDays');
  if(daysEl) daysEl.innerHTML=gridHtml;

  const booksListEl=document.getElementById('calBooksList');
  if(booksListEl) booksListEl.innerHTML=monthBooks.length?monthBooks.slice().reverse().map(b=>`<div class="cal-book-item" onclick="openDetail('${b.id}')"><span class="cal-book-date">${parseInt(b.dateend.slice(8,10))}일</span>${coverHtml(b)}<span class="cal-book-title">${escHtml(b.title)}</span>${b.rating?`<span class="cal-book-stars">${'★'.repeat(b.rating)}</span>`:''}</div>`).join(''):'<p class="hint">이 달에 완독한 책이 없어요.</p>';
  const sidebarTitle=document.querySelector('.cal-sidebar-title');
  if(sidebarTitle) sidebarTitle.textContent=`${month+1}월 완독 ${monthBooks.length}권`;

  renderGoal();
  renderStreak();
}

function calcStreaks(){
  const done=books.filter(b=>b.status==='완독'&&b.dateend);
  const dateSet=new Set();
  done.forEach(b=>{const d=b.dateend.slice(0,10);if(d)dateSet.add(d);});

  const today=new Date();
  today.setHours(0,0,0,0);
  const todayStr=localDate(today);

  let currentStreak=0;
  const d=new Date(today);
  if(!dateSet.has(todayStr)){
    d.setDate(d.getDate()-1);
    if(!dateSet.has(localDate(d))){
      currentStreak=0;
    }else{
      currentStreak=1;
      d.setDate(d.getDate()-1);
      while(dateSet.has(localDate(d))){currentStreak++;d.setDate(d.getDate()-1);}
    }
  }else{
    currentStreak=1;
    d.setDate(d.getDate()-1);
    while(dateSet.has(localDate(d))){currentStreak++;d.setDate(d.getDate()-1);}
  }

  const sorted=[...dateSet].sort();
  let longestStreak=0,tempStreak=1;
  for(let i=1;i<sorted.length;i++){
    const prev=new Date(sorted[i-1]);
    const curr=new Date(sorted[i]);
    const diff=(curr-prev)/86400000;
    if(diff===1){tempStreak++;}
    else{longestStreak=Math.max(longestStreak,tempStreak);tempStreak=1;}
  }
  longestStreak=Math.max(longestStreak,tempStreak);
  if(!sorted.length) longestStreak=0;

  const year=today.getFullYear();
  const month=today.getMonth();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const daysPassed=today.getDate();
  let monthReadDays=0;
  const monthStr=`${year}-${String(month+1).padStart(2,'0')}`;
  dateSet.forEach(ds=>{if(ds.startsWith(monthStr)) monthReadDays++;});

  return{currentStreak,longestStreak,monthReadDays,daysPassed,daysInMonth,dateSet};
}

function renderStreak(){
  const el=document.getElementById('streakCard');
  if(!el) return;
  const s=calcStreaks();
  const badges=[7,14,30,50,100].map(m=>`<span class="chip${s.longestStreak>=m?' got':''}">${m}일${s.longestStreak>=m?' 달성':''}</span>`).join('');
  el.innerHTML=`<span class="streak-label">연속 독서</span>
    <div class="streak-big">${s.currentStreak}<small>일째</small></div>
    <div class="streak-sub"><span>최장 ${s.longestStreak}일</span><span>이번 달 ${s.monthReadDays}일 완독</span></div>
    <div class="streak-badges">${badges}</div>
    ${s.currentStreak===0?'<span class="streak-sub">오늘 책을 완독하면 연속 기록이 시작돼요</span>':''}`;
}

function renderGoal(){
  const realYear=new Date().getFullYear();
  const doneThisYear=books.filter(b=>b.status==='완독'&&b.dateend&&b.dateend.startsWith(String(realYear))).length;
  const goal=appSettings.yearlyGoal||0;
  const doneNum=document.getElementById('goalDoneNum');
  const targetNum=document.getElementById('goalTargetNum');
  const bar=document.getElementById('goalBar');
  const track=document.getElementById('goalTrack');
  const pctEl=document.getElementById('goalPct');
  const msgEl=document.getElementById('goalMsg');
  if(doneNum) doneNum.textContent=doneThisYear;
  const pct=goal?Math.min(100,Math.round(doneThisYear/goal*100)):0;
  if(targetNum) targetNum.textContent=goal||'—';
  if(bar) bar.style.width=pct+'%';
  if(track) track.classList.toggle('done',pct>=100);
  if(pctEl) pctEl.textContent=goal?pct+'%':'목표를 정해보세요';
  if(msgEl) msgEl.textContent=goal&&pct>=100?'🎉 목표 달성!':'';
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
  if(display) display.style.display=isEditing?'flex':'none';
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
