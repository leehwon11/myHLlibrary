// ══════════════ CALENDAR ══════════════
let calYear=new Date().getFullYear(),calMonth=new Date().getMonth();
function calPrevMonth(){calMonth--;if(calMonth<0){calMonth=11;calYear--;}renderCalendar();}
function calNextMonth(){calMonth++;if(calMonth>11){calMonth=0;calYear++;}renderCalendar();}
function calGoToday(){const n=new Date();calYear=n.getFullYear();calMonth=n.getMonth();renderCalendar();}
function renderCalendar(){
  const MN=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],DOW=['일','월','화','수','목','금','토'];
  document.getElementById('calNavTitle').textContent=calYear+'년 '+MN[calMonth];
  const doneBooks=books.filter(b=>b.dateend&&b.status==='완독'),byDate={};
  doneBooks.forEach(b=>{const k=b.dateend.slice(0,10);if(!byDate[k])byDate[k]=[];byDate[k].push({title:b.title,id:b.id});});
  const today=new Date().toISOString().slice(0,10),firstDay=new Date(calYear,calMonth,1).getDay(),daysInMonth=new Date(calYear,calMonth+1,0).getDate();
  document.getElementById('calDaysHeader').innerHTML=DOW.map(d=>`<div class="cal-day-hdr">${d}</div>`).join('');
  let cells='';for(let i=0;i<firstDay;i++)cells+='<div class="cal-day cal-empty"></div>';
  for(let d=1;d<=daysInMonth;d++){const dk=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;const entries=byDate[dk];const isToday=dk===today;const dow=(firstDay+d-1)%7;const dc=dow===0?' sun':dow===6?' sat':'';if(entries){const tip=entries.map(e=>e.title).join(', ').replace(/'/g,"&#39;");cells+=`<div class="cal-day has-book${dc}${isToday?' today':''}" onmouseenter="showCalTip(event,'${tip}')" onmouseleave="hideCalTip()" onclick="showCalTip(event,'${tip}')"><span>${d}</span><span class="cal-dot"></span></div>`;}else{cells+=`<div class="cal-day${dc}${isToday?' today':''}">${d}</div>`;}}
  document.getElementById('calDays').innerHTML=cells;
  const mk=`${calYear}-${String(calMonth+1).padStart(2,'0')}`;
  const me=doneBooks.filter(b=>b.dateend.startsWith(mk)).sort((a,b)=>a.dateend.localeCompare(b.dateend));
  const listEl=document.getElementById('calBooksList');
  listEl.innerHTML=me.length?me.map(b=>`<div class="cal-book-item" onclick="openDetail('${b.id}')"><span class="cal-book-date">${b.dateend.slice(5)}</span><span class="cal-book-title">${escHtml(b.title)}</span>${b.rating?`<span style="font-size:11px;color:#e8a020">${'★'.repeat(b.rating)}</span>`:''}</div>`).join(''):'<p style="font-size:12px;color:var(--txt4)">이 달에 완독한 책이 없어요.</p>';
  renderGoal();
}
function showCalTip(e,text){const tip=document.getElementById('calTooltip');tip.textContent=text;tip.style.display='block';tip.style.left=(e.clientX+12)+'px';tip.style.top=(e.clientY-36)+'px';}
function hideCalTip(){document.getElementById('calTooltip').style.display='none';}

// ══════════════ 독서 목표 ══════════════
function renderGoal(){
  const year=new Date().getFullYear(),target=parseInt(localStorage.getItem('myLib_goal_'+year)||'0'),done=books.filter(b=>b.status==='완독'&&b.dateend&&b.dateend.startsWith(String(year))).length;
  document.getElementById('goalDoneNum').textContent=done;
  if(!target){document.getElementById('goalTargetNum').textContent='—';document.getElementById('goalBar').style.width='0%';document.getElementById('goalPct').textContent='목표를 설정해보세요!';document.getElementById('goalMsg').textContent='';return;}
  document.getElementById('goalTargetNum').textContent=target;
  const pct=Math.min(100,Math.round(done/target*100));document.getElementById('goalBar').style.width=pct+'%';document.getElementById('goalBar').className='goal-bar'+(pct>=100?' done-all':'');document.getElementById('goalPct').textContent=pct+'% 달성';
  document.getElementById('goalMsg').textContent=pct>=100?'🎉 목표 달성! 대단해요!':done===0?'📚 첫 번째 책을 읽어보세요!':pct>=80?'🔥 거의 다 왔어요! 파이팅!':pct>=50?'⚡ 절반을 넘었어요! 잘하고 있어요!':'';
}
function toggleGoalEdit(){const row=document.getElementById('goalEditRow'),btn=document.getElementById('goalEditBtn');const isOpen=row.style.display!=='none';row.style.display=isOpen?'none':'block';btn.textContent=isOpen?'수정':'취소';if(!isOpen){const year=new Date().getFullYear();document.getElementById('goalInput').value=localStorage.getItem('myLib_goal_'+year)||'';}}
function saveGoal(){const year=new Date().getFullYear(),v=parseInt(document.getElementById('goalInput').value);if(!v||v<1)return showToast('1 이상의 숫자를 입력해주세요.');localStorage.setItem('myLib_goal_'+year,v);document.getElementById('goalEditRow').style.display='none';document.getElementById('goalEditBtn').textContent='수정';renderGoal();showToast('목표가 저장됐어요! 화이팅! 🔥');}
function clearGoal(){const year=new Date().getFullYear();localStorage.removeItem('myLib_goal_'+year);document.getElementById('goalEditRow').style.display='none';document.getElementById('goalEditBtn').textContent='수정';renderGoal();}
// ══════════════ INIT ══════════════
(async()=>{
  initDark();initBgTheme();
  await loadFromDB();
  updateLogo();loadFilterState();render();
  const n=new Date();calYear=n.getFullYear();calMonth=n.getMonth();
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){['editOv','detailOv','jsonOv','shareOv','settingsOv','libNameOv','confirmOv','importChoiceOv'].forEach(id=>{document.getElementById(id)?.classList.remove('open');});}});
})();
