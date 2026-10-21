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

  const streakData=calcStreaks();
  const streakDates=streakData.dateSet;

  let gridHtml='';
  for(let i=0;i<firstDay;i++) gridHtml+=`<div class="cal-day cal-empty"></div>`;
  for(let d=1;d<=daysInMonth;d++){
    const dateStr=`${year}-${monthStr}-${String(d).padStart(2,'0')}`;
    const hasBook=dayMap[d];
    const isToday=dateStr===todayStr;
    const isStreakDay=streakDates.has(dateStr);
    const dow=(firstDay+d-1)%7;
    let cls='cal-day';
    if(hasBook) cls+=' has-book';
    if(isToday) cls+=' today';
    if(dow===0) cls+=' sun';
    if(dow===6) cls+=' sat';
    if(isStreakDay){
      const prevDate=new Date(year,month,d-1);
      const nextDate=new Date(year,month,d+1);
      const prevIn=streakDates.has(prevDate.toISOString().slice(0,10));
      const nextIn=streakDates.has(nextDate.toISOString().slice(0,10));
      if(prevIn&&nextIn) cls+=' streak-mid';
      else if(prevIn) cls+=' streak-end';
      else if(nextIn) cls+=' streak-start';
      else cls+=' streak-single';
    }
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
  renderStreak();
}

function calcStreaks(){
  const done=books.filter(b=>b.status==='완독'&&b.dateend);
  const dateSet=new Set();
  done.forEach(b=>{const d=b.dateend.slice(0,10);if(d)dateSet.add(d);});

  const today=new Date();
  today.setHours(0,0,0,0);
  const todayStr=today.toISOString().slice(0,10);

  let currentStreak=0;
  const d=new Date(today);
  if(!dateSet.has(todayStr)){
    d.setDate(d.getDate()-1);
    if(!dateSet.has(d.toISOString().slice(0,10))){
      currentStreak=0;
    }else{
      currentStreak=1;
      d.setDate(d.getDate()-1);
      while(dateSet.has(d.toISOString().slice(0,10))){currentStreak++;d.setDate(d.getDate()-1);}
    }
  }else{
    currentStreak=1;
    d.setDate(d.getDate()-1);
    while(dateSet.has(d.toISOString().slice(0,10))){currentStreak++;d.setDate(d.getDate()-1);}
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

  const milestones=[7,14,30,50,100];
  const milestonesHtml=milestones.map(m=>{
    const achieved=s.longestStreak>=m;
    return `<span class="streak-milestone${achieved?' achieved':''}">${achieved?'🏆':'🔒'} ${m}일</span>`;
  }).join('');

  const fireSize=Math.min(3,Math.floor(s.currentStreak/7)+1);
  const fires='🔥'.repeat(fireSize);

  el.innerHTML=`
    <div class="streak-header">
      <span class="streak-fire">${fires}</span>
      <span class="streak-count">${s.currentStreak}</span>
      <span class="streak-unit">일 연속 독서${s.currentStreak>0?'중!':''}</span>
    </div>
    <div class="streak-stats">
      <div class="streak-stat">
        <div class="streak-stat-num">${s.longestStreak}</div>
        <div class="streak-stat-label">최장 기록</div>
      </div>
      <div class="streak-stat">
        <div class="streak-stat-num">${s.monthReadDays}<span style="font-size:12px;color:var(--txt3)">/${s.daysPassed}</span></div>
        <div class="streak-stat-label">이번 달 독서일</div>
      </div>
    </div>
    <div class="streak-milestones">${milestonesHtml}</div>
    ${s.currentStreak===0?'<div class="streak-msg">오늘 책을 완독하면 스트릭이 시작돼요!</div>':''}
    ${s.currentStreak>=7?'<div class="streak-msg streak-msg-good">대단해요! 꾸준히 읽고 있어요 👏</div>':''}
  `;
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
