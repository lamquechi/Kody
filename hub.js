/* ═══════════════════════════════════════════════════════════
   THE STUDIO · writer hub logic (hub.js)
   Reads the unified piece view from wm.js; every surface — pieces,
   calendar, characters, motifs, SEO — agrees on what a piece is.
   ═══════════════════════════════════════════════════════════ */
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => (window.WM ? WM.escapeHtml(s || '') : String(s || ''));
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MO_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const EV = {
    deadline: { label:'Deadline',       color:'var(--scarlet)', ico:'⚑' },
    session:  { label:'Writing session', color:'var(--blue)',    ico:'✎' },
    publish:  { label:'Planned publish', color:'var(--green)',   ico:'✦' },
    note:     { label:'Note',            color:'var(--gold)',     ico:'•' }
  };
  const CHAR_COLORS = ['#B8472E','#3A6B5C','#43677A','#8A6D2E','#7AAEC4','#8A82B5','#824E63','#6A8C7B'];

  function toast(m){ const t=$('toast'); t.textContent=m; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2200); }
  function timeAgo(ts){ if(!ts) return ''; const s=(Date.now()-ts)/1000; if(s<60)return 'just now'; if(s<3600)return Math.floor(s/60)+'m ago'; if(s<86400)return Math.floor(s/3600)+'h ago'; const d=Math.floor(s/86400); return d===1?'yesterday':d+'d ago'; }
  function pad(n){ return String(n).padStart(2,'0'); }
  function ymd(d){ d=(d instanceof Date)?d:new Date(d); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function parseYmd(s){ const a=String(s).split('-').map(Number); return new Date(a[0],(a[1]||1)-1,a[2]||1); }
  function todayYmd(){ return ymd(new Date()); }

  const FORM = () => WM.FORM_LABEL;
  const PROG = () => WM.PROGRESS;
  const PORDER = () => WM.PROGRESS_ORDER;
  function progPct(k){ return (PROG()[k]||{}).pct || 0; }
  function progColor(k){ return (PROG()[k]||{}).color || 'var(--ink-faint)'; }
  function progLabel(k){ return (PROG()[k]||{}).label || '— stage —'; }
  function stageOf(p){ return p.progress || (p.status==='published' ? 'done' : 'idea'); }
  const isAdmin = () => !!(window.WM && WM.isAdmin);
  function canManage(p){ return isAdmin() || p.isDraft; }

  /* ════ OVERVIEW ════ */
  function renderOverview(){
    const items = WM.pieces.list();
    const pub = items.filter(p=>p.status==='published');
    const inProg = items.filter(p=>['outline','drafting','revising'].includes(stageOf(p)) && p.status!=='published');
    const reads = items.reduce((a,p)=>a+(p.reads||0),0);
    $('sPub').textContent = pub.length;
    const en = pub.filter(p=>p.lang!=='vi').length, vi = pub.length-en;
    $('sPubD').textContent = en+' EN · '+vi+' VI';
    $('sProg').textContent = inProg.length;
    $('sProgD').textContent = inProg.length ? 'drafting & revising' : 'nothing on the bench';
    $('sMarks').textContent = WM.marks.unreadCount();
    $('sReads').textContent = reads>=1000 ? (reads/1000).toFixed(1)+'K' : reads;

    const hour = new Date().getHours();
    $('ovSub').textContent = hour<5?'The small hours. The page is patient.':hour<12?'Morning light on the desk.':hour<18?'The afternoon is yours.':'Lamps on. A good hour to write.';

    // stage distribution
    const order = PORDER();
    const counts = {}; order.forEach(k=>counts[k]=0);
    items.forEach(p=>{ counts[stageOf(p)] = (counts[stageOf(p)]||0)+1; });
    const total = items.length || 1;
    $('stageTotal').textContent = items.length+' pieces';
    $('stageBar').innerHTML = order.map(k=>{
      const w = (counts[k]/total)*100;
      return w>0 ? `<span title="${progLabel(k)}: ${counts[k]}" style="width:${w}%;background:${progColor(k)}"></span>` : '';
    }).join('');
    $('stageKey').innerHTML = order.map(k=>`<span class="it"><span class="dot" style="background:${progColor(k)}"></span>${progLabel(k)} <b>${counts[k]}</b></span>`).join('');

    renderRooms(items);
    renderStrip();
    renderActivity(items);

    const marks = WM.marks.all();
    $('ovMarks').innerHTML = marks.length ? marks.slice(0,4).map(m=>
      `<div class="mini" data-mread="${esc(m.id)}" style="flex-direction:column;align-items:stretch;gap:5px"><span class="mq">"${esc((m.text||'').slice(0,90))}${(m.text||'').length>90?'…':''}"</span><span class="mm">${esc(m.storyTitle||'a piece')} · ${timeAgo(m.createdAt)}${m.read?'':' · <b style="color:var(--scarlet)">new</b>'}</span></div>`).join('')
      : '<div class="empty">No marks yet — they arrive as readers leave them.</div>';
  }

  const IC = {
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 6 9 17l-5-5"/></svg>',
    pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    mark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"/></svg>'
  };
  function firstLine(b){ if(!b) return ''; const arr=String(b).split('\n').map(s=>s.replace(/^[#>*\-\s]+/,'').trim()); return arr.find(s=>s.length>0)||''; }
  function renderRooms(items){
    const rooms=items.filter(p=>p.status!=='published').sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).slice(0,3);
    const el=$('ovRooms');
    if(!rooms.length){ el.innerHTML='<div class="empty" style="grid-column:1/-1">No rooms in progress — <a style="color:var(--scarlet);cursor:pointer" data-go="pieces">start a new piece →</a></div>'; return; }
    el.innerHTML=rooms.map(p=>{
      const st=stageOf(p), pct=p.wordGoal>0?Math.min(100,Math.round(p.words/p.wordGoal*100)):progPct(st);
      const exc=(p.synopsis||p.excerpt||firstLine(p.body)||'—');
      let note=timeAgo(p.updatedAt)?('edited '+timeAgo(p.updatedAt)):'just started', nd='';
      if(p.dueAt){ const days=Math.ceil((p.dueAt-Date.now())/86400000); if(days<0){note='overdue';nd='nd';} else if(days<=30){note='due in '+days+'d';nd='nd';} }
      return `<div class="room" data-edit="${esc(p.id)}">
        <div class="rk"><span class="d" style="background:${progColor(st)}"></span>${esc(p.status||'draft')} · ${pct}% · ${progLabel(st)}</div>
        <div class="rt">${esc(p.title)}</div>
        <div class="rq">"${esc(exc.slice(0,120))}${exc.length>120?'…':''}"</div>
        <div class="rbar"><span style="width:${pct}%;background:${progColor(st)}"></span></div>
        <div class="rf"><span>${p.words}${p.wordGoal>0?' / '+p.wordGoal:''} ${p.lang==='vi'?'từ':'words'}</span><span class="${nd}">${note}</span></div>
      </div>`;
    }).join('');
  }
  function renderStrip(){
    const el=$('ovStrip'); const by=eventsByDate();
    const today=new Date(); today.setHours(0,0,0,0);
    let cells='', sched=0, pencil=0;
    for(let i=0;i<14;i++){ const d=new Date(today); d.setDate(today.getDate()+i); const ds=ymd(d);
      const evs=by[ds]||[];
      evs.forEach(e=>{ if(e.type==='publish'||e.type==='deadline') sched++; else pencil++; });
      const top=evs[0], col=top?(EV[top.type]||EV.note).color:'';
      const dots=evs.slice(0,3).map(()=>'<span class="dot2"></span>').join('');
      cells+=`<div class="dcell${i===0?' today':''}${evs.length?' has':''}" data-day="${ds}"${evs.length?` style="background:${col};border-color:${col}"`:''}>
        <span class="dw">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}</span>
        <span class="dd">${d.getDate()}</span>${evs.length?`<span class="dots">${dots}</span>`:''}</div>`;
    }
    el.innerHTML=cells;
    const end=new Date(today); end.setDate(today.getDate()+13);
    $('ovStripSub').textContent=`${MO_SHORT[today.getMonth()]} ${today.getDate()} → ${MO_SHORT[end.getMonth()]} ${end.getDate()} · ${sched} scheduled, ${pencil} penciled`;
  }
  function renderActivity(items){
    const acts=[];
    items.forEach(p=>{
      if(p.status==='published' && p.publishedAt){ const ts=(typeof p.publishedAt==='number')?p.publishedAt:(Date.parse(p.publishedAt)||0); if(ts) acts.push({ts, ic:IC.check, html:`<b>${esc(p.title)}</b> is published.`}); }
      else if(p.isDraft && p.updatedAt){ acts.push({ts:p.updatedAt, ic:IC.pen, html:`You worked on <span class="pc">"${esc(p.title)}"</span> — ${p.words} words.`}); }
    });
    WM.marks.all().forEach(m=>{ acts.push({ts:m.createdAt||0, ic:IC.mark, html:`New mark on <span class="pc">${esc(m.storyTitle||'a piece')}</span>${m.read?'':' — <em>unread</em>'}.`}); });
    acts.sort((a,b)=>b.ts-a.ts);
    $('ovActivity').innerHTML = acts.length ? `<div class="feed">${acts.slice(0,7).map(a=>`<div class="feed-row"><span class="feed-ic">${a.ic}</span><span class="feed-tx">${a.html}</span><span class="feed-ago">${timeAgo(a.ts)||''}</span></div>`).join('')}</div>` : '<div class="empty">Quiet so far — publish a piece or jot a plan and it appears here.</div>';
  }

  /* ════ PIECES ════ */
  let pieceWf='all', pieceSearch='';
  function progSelect(p){
    const cur = p.progress || '';
    const opts = ['<option value="">— stage —</option>'].concat(PORDER().map(k=>
      `<option value="${k}"${k===cur?' selected':''}>${progLabel(k)}</option>`)).join('');
    const st = stageOf(p), pct = progPct(st);
    return `<div class="prog">
      <div class="prog-top"><span class="prog-dot" style="background:${progColor(st)}"></span>
        <select class="prog-sel" data-prog="${esc(p.id)}">${opts}</select></div>
      <div class="prog-bar"><span style="width:${pct}%;background:${progColor(st)}"></span></div>
    </div>`;
  }
  function renderPieces(){
    const items = WM.pieces.list();
    const C = {
      all: items.length,
      idea: items.filter(p=>stageOf(p)==='idea').length,
      outline: items.filter(p=>stageOf(p)==='outline').length,
      drafting: items.filter(p=>stageOf(p)==='drafting').length,
      revising: items.filter(p=>stageOf(p)==='revising').length,
      done: items.filter(p=>stageOf(p)==='done').length,
      published: items.filter(p=>p.status==='published').length,
      draft: items.filter(p=>p.status!=='published').length
    };
    setC('cAll',C.all);setC('cIdea',C.idea);setC('cOutline',C.outline);setC('cDrafting',C.drafting);
    setC('cRevising',C.revising);setC('cDone',C.done);setC('cPub2',C.published);setC('cDraft',C.draft);
    const b=$('bPieces'); if(C.draft>0){b.style.display='inline-block';b.textContent=C.draft;} else b.style.display='none';

    let shown = items;
    if(pieceWf==='published') shown = items.filter(p=>p.status==='published');
    else if(pieceWf==='draft') shown = items.filter(p=>p.status!=='published');
    else if(pieceWf!=='all') shown = items.filter(p=>stageOf(p)===pieceWf);
    if(pieceSearch) shown = shown.filter(p=>(p.title||'').toLowerCase().includes(pieceSearch));

    $('pieceRows').innerHTML = shown.length ? shown.map(p=>{
      const manage = canManage(p);
      const viewable = p.status==='published';   // drafts preview live in the editor
      const goalMet = p.wordGoal>0 && p.words>=p.wordGoal;
      return `<tr>
        <td><span class="t-title ${p.lang==='vi'?'vi':''}" data-edit="${esc(p.id)}">${esc(p.title)}</span></td>
        <td class="meta-mono">${FORM()[p.form]||p.form||'—'} · ${(p.lang||'en').toUpperCase()}</td>
        <td>${progSelect(p)}</td>
        <td><span class="pill ${p.status}">${p.status}</span></td>
        <td class="r"><span class="wgoal ${goalMet?'met':''}"><b>${p.words}</b>${p.wordGoal>0?' / '+p.wordGoal:''}</span></td>
        <td class="r meta-mono">${p.reads||0}</td>
        <td class="r meta-mono">${p.marks||0}</td>
        <td class="r"><div class="row-actions">
          <a class="ra" href="editor.html?id=${encodeURIComponent(p.id)}">Edit</a>
          ${viewable?`<a class="ra" href="reader.html?id=${encodeURIComponent(p.id)}" target="_blank">View</a>`:''}
          ${manage?`<button class="ra" data-pub="${esc(p.id)}">${p.status==='published'?'Unpublish':'Publish'}</button>`:''}
          ${manage?`<button class="ra danger" data-del="${esc(p.id)}">Delete</button>`:''}
        </div></td></tr>`;
    }).join('') : `<tr><td colspan="8"><div class="empty">No pieces here. ${pieceWf!=='all'||pieceSearch?'Try another filter.':'Write your first.'}</div></td></tr>`;
  }
  function setC(id,n){ const e=$(id); if(e) e.textContent=n; }

  function setProgress(id,val){ WM.pieceMeta.set(id,{progress:val}); renderPieces(); renderOverview(); }
  function togglePublish(id){
    const p=WM.pieces.get(id); if(!p) return;
    const next=(p.status==='published')?'draft':'published';
    const d=WM.drafts.get(id)||{ title:p.title, body:p.body, form:p.form, lang:p.lang, motif:p.motif };
    WM.drafts.save(id,{...d,status:next});
    toast(next==='published'?'Published to the library.':'Moved back to drafts.');
    renderPieces(); renderOverview(); updateBadges();
  }
  function removePiece(id){
    const p=WM.pieces.get(id); const title=(p&&p.title)||id;
    if(!confirm('Delete "'+title+'"? This removes the piece everywhere. This cannot be undone.')) return;
    try{ WM.drafts.delete(id); }catch(e){}
    WM.pieceMeta.delete(id); WM.removed.add(id);
    toast('Deleted.'); renderPieces(); renderOverview(); updateBadges();
  }

  /* ════ CALENDAR ════ */
  let calYear, calMonth;
  function allEvents(){
    const out=[];
    (WM.schedule.all()||[]).forEach(e=>{ if(e.date) out.push({ date:e.date, type:e.type||'note', title:e.title||(EV[e.type]||{}).label||'Event', id:e.id, source:'schedule', pieceId:e.pieceId||null, note:e.note||'', done:!!e.done }); });
    WM.pieces.list().forEach(p=>{
      if(p.dueAt) out.push({ date:ymd(new Date(p.dueAt)), type:'deadline', title:p.title, pieceId:p.id, source:'piece-due' });
      if(p.scheduledAt) out.push({ date:ymd(new Date(p.scheduledAt)), type:'publish', title:p.title, pieceId:p.id, source:'piece-pub' });
    });
    return out;
  }
  function eventsByDate(){ const m={}; allEvents().forEach(e=>{ (m[e.date]=m[e.date]||[]).push(e); }); return m; }
  function upcomingEvents(fromStr, withinDays){
    const from=parseYmd(fromStr).getTime();
    const to = withinDays!=null ? from + withinDays*86400000 : Infinity;
    return allEvents().filter(e=>{ const t=parseYmd(e.date).getTime(); return t>=from && t<=to; })
      .sort((a,b)=>parseYmd(a.date)-parseYmd(b.date));
  }
  function agendaRow(e){
    const d=parseYmd(e.date), meta=EV[e.type]||EV.note;
    const target = e.source==='schedule' ? `data-evopen="${esc(e.id)}"` : `data-edit="${esc(e.pieceId)}"`;
    return `<div class="ag-row" ${target}>
      <div class="ad"><div class="d" style="color:${meta.color}">${d.getDate()}</div><div class="mo">${MO_SHORT[d.getMonth()]}</div></div>
      <div class="ax"><div class="at">${esc(e.title)}</div><div class="ak" style="color:${meta.color}">${meta.ico} ${meta.label}</div></div>
    </div>`;
  }
  function renderCalendar(){
    if(calYear==null){ const n=new Date(); calYear=n.getFullYear(); calMonth=n.getMonth(); }
    $('calLabel').innerHTML = `${MONTHS[calMonth]} <em>${calYear}</em>`;
    const byDate = eventsByDate();
    const first = new Date(calYear, calMonth, 1);
    const startDow = (first.getDay()+6)%7;          // Monday-first
    const daysIn = new Date(calYear, calMonth+1, 0).getDate();
    const prevDaysIn = new Date(calYear, calMonth, 0).getDate();
    const tStr = todayYmd();
    let cells='';
    for(let i=0;i<42;i++){
      const dayNum = i-startDow+1;
      if(dayNum<1){ const d=prevDaysIn+dayNum; cells+=`<div class="cal-day out"><span class="dn">${d}</span></div>`; continue; }
      if(dayNum>daysIn){ const d=dayNum-daysIn; cells+=`<div class="cal-day out"><span class="dn">${d}</span></div>`; continue; }
      const ds = calYear+'-'+pad(calMonth+1)+'-'+pad(dayNum);
      const evs = byDate[ds]||[];
      const chips = evs.slice(0,3).map(e=>{ const meta=EV[e.type]||EV.note;
        return `<span class="ev-chip" style="background:${meta.color}" data-chip="${esc(ds)}" data-cidx="${evs.indexOf(e)}">${meta.ico} ${esc(e.title)}</span>`; }).join('');
      const more = evs.length>3 ? `<span class="ev-chip ghost" data-chip="${esc(ds)}">+${evs.length-3} more</span>` : '';
      cells+=`<div class="cal-day${ds===tStr?' today':''}" data-day="${ds}"><span class="dn">${dayNum}</span>${chips}${more}</div>`;
    }
    $('calDays').innerHTML = cells;
    renderAgenda();
  }
  function renderAgenda(){
    const up = upcomingEvents(todayYmd()).slice(0,8);
    $('calAgenda').innerHTML = up.length ? `<div class="agenda">${up.map(agendaRow).join('')}</div>` : '<div class="empty">Nothing scheduled. Click a day to plan.</div>';
  }

  function openEventModal(dateStr, existing){
    const pieces = WM.pieces.list();
    const ev = existing || { type:'session', title:'', date:dateStr||todayYmd(), pieceId:'', note:'' };
    const typeOpts = Object.keys(EV).map(k=>`<option value="${k}"${ev.type===k?' selected':''}>${EV[k].label}</option>`).join('');
    const pieceOpts = ['<option value="">— none —</option>'].concat(pieces.map(p=>
      `<option value="${esc(p.id)}"${ev.pieceId===p.id?' selected':''}>${esc(p.title)}</option>`)).join('');
    openModal(`
      <div class="modal-head"><h2>${existing?'Edit':'Add to'} <em>calendar</em></h2><button class="x" data-mclose>×</button></div>
      <div class="modal-body">
        <div class="field"><label>Type</label><select id="evType">${typeOpts}</select></div>
        <div class="field"><label>Date</label><input type="date" id="evDate" value="${esc(ev.date)}"></div>
        <div class="field full"><label>Title</label><input id="evTitle" value="${esc(ev.title)}" placeholder="What is this day for?"></div>
        <div class="field full"><label>Link to a piece <span style="text-transform:none;letter-spacing:0;color:var(--ink-faint)">— for a deadline or publish, this sets that piece's date</span></label><select id="evPiece">${pieceOpts}</select></div>
        <div class="field full"><label>Note</label><textarea id="evNote" rows="2" placeholder="optional">${esc(ev.note||'')}</textarea></div>
      </div>
      <div class="modal-foot">
        ${existing?'<button class="btn btn-danger" id="evDelete">Delete</button>':''}
        <span class="sp"></span>
        <button class="btn btn-ghost" data-mclose>Cancel</button>
        <button class="btn btn-ink" id="evSave">${existing?'Save':'Add'}</button>
      </div>`);
    $('evSave').addEventListener('click',()=>{
      const type=$('evType').value, date=$('evDate').value, title=$('evTitle').value.trim(),
            pieceId=$('evPiece').value||null, note=$('evNote').value.trim();
      if(!date){ toast('Pick a date.'); return; }
      if((type==='deadline'||type==='publish') && pieceId){
        WM.pieceMeta.set(pieceId, type==='deadline' ? {dueAt:parseYmd(date).getTime()} : {scheduledAt:parseYmd(date).getTime()});
        if(existing && existing.source==='schedule') WM.schedule.delete(existing.id);
      } else {
        WM.schedule.save({ id: existing&&existing.source==='schedule'?existing.id:undefined,
          type, title:title||EV[type].label, date, pieceId, note });
      }
      closeModal(); renderCalendar(); renderOverview(); updateBadges(); toast('Calendar updated.');
    });
    if(existing){ const del=$('evDelete'); if(del) del.addEventListener('click',()=>{
      if(existing.source==='schedule') WM.schedule.delete(existing.id);
      else if(existing.pieceId) WM.pieceMeta.set(existing.pieceId, existing.type==='deadline'?{dueAt:null}:{scheduledAt:null});
      closeModal(); renderCalendar(); renderOverview(); updateBadges(); toast('Removed.');
    }); }
  }

  /* ════ CHARACTERS ════ */
  function piecesForChar(cid){ return WM.pieces.list().filter(p=>(WM.pieceMeta.get(p.id).characters||[]).includes(cid)); }
  function renderCharacters(){
    const chars = WM.characters.all();
    if(!chars.length){ $('charGrid').innerHTML = `<div class="empty" style="grid-column:1/-1">No characters yet. Add the first person who walks through your rooms — <a style="color:var(--scarlet);cursor:pointer" id="charEmptyAdd">new character →</a></div>`;
      const a=$('charEmptyAdd'); if(a) a.addEventListener('click',()=>openCharModal()); return; }
    $('charGrid').innerHTML = chars.map(c=>{
      const inPieces=piecesForChar(c.id); const col=c.color||'var(--scarlet)';
      const tags = inPieces.slice(0,3).map(p=>`<span class="char-tag">${esc(p.title)}</span>`).join('') + (inPieces.length>3?`<span class="char-tag">+${inPieces.length-3}</span>`:'') || '<span class="char-tag">no pieces yet</span>';
      return `<div class="char-card" data-char="${esc(c.id)}" style="--cc:${col}">
        <div class="char-head"><div class="char-av" style="--cc:${col}">${esc((c.name||'?').trim().charAt(0))}</div>
          <div><div class="char-name">${esc(c.name||'Unnamed')}</div><div class="char-role">${esc(c.role||'—')}${c.age?' · '+esc(c.age):''}</div></div></div>
        <div class="char-line">${esc(c.oneLine||'—')}</div>
        <div class="char-foot">${tags}</div></div>`;
    }).join('');
  }
  function openCharModal(id){
    const c = id ? (WM.characters.get(id)||{}) : {};
    const pieces = WM.pieces.list();
    const linked = new Set(pieces.filter(p=>(WM.pieceMeta.get(p.id).characters||[]).includes(id)).map(p=>p.id));
    const col = c.color || CHAR_COLORS[0];
    const sw = CHAR_COLORS.map(x=>`<span class="sw${x===col?' on':''}" data-sw="${x}" style="background:${x}"></span>`).join('');
    const picks = pieces.map(p=>`<label class="pick"><input type="checkbox" value="${esc(p.id)}"${linked.has(p.id)?' checked':''}> ${esc(p.title)} <span class="pm">${(p.lang||'en').toUpperCase()}</span></label>`).join('') || '<div class="empty" style="padding:8px">No pieces to link yet.</div>';
    openModal(`
      <div class="modal-head"><h2>${id?'Edit':'New'} <em>character</em></h2><button class="x" data-mclose>×</button></div>
      <div class="modal-body">
        <div class="field"><label>Name</label><input id="chName" value="${esc(c.name||'')}" placeholder="e.g. The woman under the awning"></div>
        <div class="field"><label>Role</label><input id="chRole" value="${esc(c.role||'')}" placeholder="protagonist · foil · the city"></div>
        <div class="field"><label>Age / era</label><input id="chAge" value="${esc(c.age||'')}" placeholder="late 20s"></div>
        <div class="field"><label>Colour</label><div class="swatches" id="chSwatches">${sw}</div><input type="hidden" id="chColor" value="${col}"></div>
        <div class="field full"><label>One line</label><input id="chOne" value="${esc(c.oneLine||'')}" placeholder="The single sentence that holds them."></div>
        <div class="field full"><label>Description</label><textarea id="chDesc" rows="3" placeholder="Who they are. What they carry.">${esc(c.description||'')}</textarea></div>
        <div class="field full"><label>Arc / notes</label><textarea id="chArc" rows="3" placeholder="Where they begin, where they break, where they land.">${esc(c.arc||'')}</textarea></div>
        <div class="field full"><label>Appears in</label><div class="pick-list" id="chPieces">${picks}</div></div>
      </div>
      <div class="modal-foot">
        ${id?'<button class="btn btn-danger" id="chDelete">Delete</button>':''}
        <span class="sp"></span>
        <button class="btn btn-ghost" data-mclose>Cancel</button>
        <button class="btn btn-ink" id="chSave">Save character</button>
      </div>`);
    document.querySelectorAll('#chSwatches .sw').forEach(s=>s.addEventListener('click',()=>{
      document.querySelectorAll('#chSwatches .sw').forEach(x=>x.classList.remove('on')); s.classList.add('on'); $('chColor').value=s.dataset.sw;
    }));
    $('chSave').addEventListener('click',()=>{
      const name=$('chName').value.trim(); if(!name){ toast('Give them a name.'); return; }
      const cid = WM.characters.save({ id, name, role:$('chRole').value.trim(), age:$('chAge').value.trim(),
        color:$('chColor').value, oneLine:$('chOne').value.trim(), description:$('chDesc').value.trim(), arc:$('chArc').value.trim() });
      // sync piece links — only write pieces whose membership changed
      const checked = new Set(Array.from(document.querySelectorAll('#chPieces input:checked')).map(i=>i.value));
      WM.pieces.list().forEach(p=>{
        const cur = WM.pieceMeta.get(p.id).characters||[];
        const had = cur.includes(cid), want = checked.has(p.id);
        if(had===want) return;
        const arr = new Set(cur); if(want) arr.add(cid); else arr.delete(cid);
        WM.pieceMeta.set(p.id,{characters:Array.from(arr)});
      });
      closeModal(); renderCharacters(); toast('Character saved.');
    });
    const del=$('chDelete'); if(del) del.addEventListener('click',()=>{
      if(!confirm('Delete this character?')) return;
      WM.pieces.list().forEach(p=>{ const cur=WM.pieceMeta.get(p.id).characters||[]; if(cur.includes(id)) WM.pieceMeta.set(p.id,{characters:cur.filter(x=>x!==id)}); });
      WM.characters.delete(id); closeModal(); renderCharacters(); toast('Character removed.');
    });
  }

  /* ════ MOTIFS ════ */
  function renderMotifs(){
    const motifs = WM.motifs||{}; const items=WM.pieces.list();
    const order = ['rain','water','window','silence','night','city','draft'];
    const keys = order.filter(k=>motifs[k]).concat(Object.keys(motifs).filter(k=>!order.includes(k)));
    $('motifGrid').innerHTML = keys.map(k=>{
      const m=motifs[k]; const list=items.filter(p=>p.motif===k);
      const reads=list.reduce((a,p)=>a+(p.reads||0),0);
      const meta=WM.motifMeta.get(k); const col=m.color||'var(--scarlet)';
      return `<div class="motif-c" style="--mc:${col}">
        <div class="mh"><span class="orb"></span><span class="mn">${esc(m.name||k)}</span></div>
        <div class="ms">— ${esc((m.subtitle||'').toUpperCase())} —</div>
        <div class="mstat">
          <div><div class="v" style="color:${col}">${list.length}</div><div class="l">pieces</div></div>
          <div><div class="v">${reads>=1000?(reads/1000).toFixed(1)+'K':reads}</div><div class="l">reads</div></div>
        </div>
        <div class="mlab">Private intention</div>
        <textarea data-motif="${esc(k)}" rows="2" placeholder="Why do you keep returning to ${esc(m.name||k)}?">${esc(meta.note||'')}</textarea>
      </div>`;
    }).join('');
  }

  /* ════ SEO ════ */
  function seoColor(score){ return score>=85?'var(--green)':score>=65?'var(--gold)':score>=40?'var(--scarlet)':'var(--scarlet)'; }
  function renderSeo(){
    const items = WM.pieces.list();
    const analyzed = items.map(p=>({ p, a:WM.seo.analyze(p) })).sort((x,y)=>x.a.score-y.a.score);
    if(!analyzed.length){ $('seoList').innerHTML='<div class="empty">No pieces to analyse yet.</div>'; $('seoAvg').textContent='—'; return; }
    const avg = Math.round(analyzed.reduce((a,o)=>a+o.a.score,0)/analyzed.length);
    $('seoAvg').textContent=avg; $('seoRing').style.setProperty('--p',avg);
    $('seoRing').style.background = `radial-gradient(closest-side,var(--paper-2) 78%,transparent 79% 100%),conic-gradient(${seoColor(avg)} ${avg}%,var(--rule) 0)`;
    $('seoStrong').textContent = analyzed.filter(o=>o.a.score>=85).length;
    $('seoWork').textContent = analyzed.filter(o=>o.a.score<65).length;
    $('seoNoDesc').textContent = analyzed.filter(o=>!o.a.hasDescription).length;
    $('seoNoKw').textContent = analyzed.filter(o=>!o.a.hasKeyword).length;
    $('seoList').innerHTML = analyzed.map(({p,a})=>{
      const meta=WM.pieceMeta.get(p.id); const col=seoColor(a.score);
      const checks=a.checks.map(c=>`<div class="chk"><span class="ck ${c.ok?'ok':'no'}">${c.ok?'✓':'!'}</span><span class="cl"><b>${esc(c.label)}</b><span class="ch">${esc(c.hint)}</span></span></div>`).join('');
      return `<div class="seo-row" data-seo="${esc(p.id)}">
        <div class="seo-rh" data-seotoggle="${esc(p.id)}">
          <div class="seo-score" style="--p:${a.score};--sc:${col}">${a.score}</div>
          <div class="st"><div class="t">${esc(p.title)}</div><div class="g">${a.grade} · ${a.words} words · ${(p.lang||'en').toUpperCase()}</div></div>
          <span class="chev">›</span>
        </div>
        <div class="seo-body">
          <div class="seo-edit">
            <div class="field"><label>Focus phrase</label><input data-seokw="${esc(p.id)}" value="${esc(meta.focusKeyword||'')}" placeholder="rain, memory…"></div>
            <div class="field"><label>Meta description <span class="count" data-deskcount="${esc(p.id)}">${(meta.metaDescription||'').length}/160</span></label><textarea data-seodesc="${esc(p.id)}" rows="2" placeholder="The 1–2 sentence summary readers see in search results.">${esc(meta.metaDescription||'')}</textarea></div>
          </div>
          ${checks}
        </div></div>`;
    }).join('');
  }

  /* ════ MARKS ════ */
  function renderMarks(){
    const marks=WM.marks.all();
    const unread=marks.filter(m=>!m.read).length;
    $('marksSub').textContent = marks.length ? (unread+' unread · '+marks.length+' total') : 'Nothing yet.';
    $('markList').innerHTML = marks.length ? marks.map(m=>
      `<div class="mark ${m.read?'':'unread'}">
        <div class="mhead"><span class="mfrom">on <b>${esc(m.storyTitle||'a piece')}</b></span><span class="mfrom">${timeAgo(m.createdAt)}</span></div>
        <div class="mbody">"${esc(m.text||'')}"</div>
        <div class="mact">${m.read?'':`<button class="ra" data-mread="${esc(m.id)}">Mark read</button>`}${m.storyId?`<a class="ra" href="reader.html?id=${encodeURIComponent(m.storyId)}" target="_blank">Open piece</a>`:''}</div>
      </div>`).join('') : '<div class="empty">No marks yet. When a reader underlines a line and leaves a note, it lands here.</div>';
  }

  /* ════ READERS ════ */
  let subsCache=[];
  async function renderReaders(){
    let shelf=0; try{ shelf=(WM.shelf.all()||[]).length; }catch(e){}
    $('shelfCount').textContent=shelf;
    if(!(window.WM && WM.supabase && WM.isAdmin)){
      $('subsWrap').innerHTML='<div class="note"><b>Offline / not admin</b> &nbsp;The subscriber list loads from the live backend when you\'re signed in as the author.</div>';
      return;
    }
    $('subsWrap').innerHTML='<div class="empty">Loading subscribers…</div>';
    try{
      const { data, error } = await WM.supabase.from('subscribers').select('email, subscribed_at, source, confirmed').order('subscribed_at',{ascending:false});
      if(error) throw error;
      subsCache=data||[];
      $('subCount').textContent=subsCache.length;
      const now=new Date(), m0=new Date(now.getFullYear(),now.getMonth(),1).getTime();
      $('subMonth').textContent=subsCache.filter(s=>new Date(s.subscribed_at).getTime()>=m0).length;
      $('subsWrap').innerHTML = subsCache.length ? `<table><thead><tr><th>Email</th><th>Source</th><th class="r">Subscribed</th></tr></thead><tbody>${
        subsCache.map(s=>`<tr><td class="t-title" style="font-size:16px;cursor:default">${esc(s.email)}</td><td class="meta-mono">${esc(s.source||'—')}</td><td class="r meta-mono">${new Date(s.subscribed_at).toLocaleDateString()}</td></tr>`).join('')
      }</tbody></table>` : '<div class="empty">No subscribers yet — the signup on the home page feeds this list.</div>';
    }catch(e){
      $('subsWrap').innerHTML='<div class="note"><b>Couldn\'t load</b> &nbsp;'+esc(e.message||'subscriber query failed')+'</div>';
    }
  }
  function exportSubs(){
    if(!subsCache.length){ toast('No subscribers to export.'); return; }
    const rows=[['email','source','subscribed_at','confirmed'],...subsCache.map(s=>[s.email,s.source||'',s.subscribed_at||'',s.confirmed?'yes':'no'])];
    const csv=rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
    dl(new Blob([csv],{type:'text/csv'}), 'subscribers-'+new Date().toISOString().slice(0,10)+'.csv');
  }

  /* ════ SETTINGS ════ */
  function fillSettings(){
    const id=WM.identity.get();
    $('idPen').value=id.penName||''; $('idCall').value=id.callName||''; $('idInit').value=id.initial||'';
    $('idEmail').value=id.email||''; $('idTag').value=id.tagline||''; $('idBio').value=id.bio||'';
    const s=WM.site.get();
    $('stName').value=s.siteName||''; $('stMark').value=s.siteMark||''; $('stTag').value=s.siteTagline||''; $('stFoot').value=s.siteFooterLine||'';
  }
  function saveIdentity(){
    WM.identity.set({ penName:$('idPen').value.trim(), callName:$('idCall').value.trim(), initial:$('idInit').value.trim(),
      email:$('idEmail').value.trim(), tagline:$('idTag').value.trim(), bio:$('idBio').value.trim() });
    flag('idSaved'); renderOverview(); toast('Identity saved.');
  }
  function saveSite(){
    WM.site.set({ siteName:$('stName').value.trim()||'Kody Lâm', siteMark:$('stMark').value.trim()||'✦',
      siteTagline:$('stTag').value.trim(), siteFooterLine:$('stFoot').value.trim() });
    flag('stSaved'); toast('Site settings saved.');
  }
  function flag(id){ const f=$(id); f.classList.add('show'); setTimeout(()=>f.classList.remove('show'),1600); }
  function dl(blob,name){ const u=URL.createObjectURL(blob),a=document.createElement('a'); a.href=u;a.download=name;a.click(); setTimeout(()=>URL.revokeObjectURL(u),1000); }
  function exportBackup(){
    const data={ identity:WM.identity.get(), site:WM.site.get(), drafts:WM.drafts.all(),
      pieceMeta:WM.pieceMeta.all(), characters:WM.characters.all(), schedule:WM.schedule.all(),
      motifMeta:WM.motifMeta.all(), removed:WM.removed.all(), marks:WM.marks.all(), shelf:WM.shelf.all(),
      exportedAt:new Date().toISOString() };
    dl(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}), 'kody-studio-backup-'+new Date().toISOString().slice(0,10)+'.json');
    toast('Backup downloaded.');
  }
  function importBackup(file){
    const r=new FileReader();
    r.onload=()=>{ try{ const d=JSON.parse(r.result);
      const map={ identity:'wm.identity', site:'wm.site', drafts:'wm.drafts', pieceMeta:'wm.pieceMeta',
        characters:'wm.characters', schedule:'wm.schedule', motifMeta:'wm.motifMeta', removed:'wm.removed',
        marks:'wm.marks', shelf:'wm.shelf' };
      Object.keys(map).forEach(k=>{ if(d[k]!==undefined) localStorage.setItem(map[k], JSON.stringify(d[k])); });
      toast('Restored. Reloading…'); setTimeout(()=>location.reload(),900);
    }catch(e){ toast('That file could not be read.'); } };
    r.readAsText(file);
  }

  /* ════ MODAL ════ */
  function openModal(html){ $('modal').innerHTML=html; $('modalBg').classList.add('show');
    $('modal').querySelectorAll('[data-mclose]').forEach(b=>b.addEventListener('click',closeModal)); }
  function closeModal(){ $('modalBg').classList.remove('show'); $('modal').innerHTML=''; }

  /* ════ NAV ════ */
  function go(target){
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.target===target));
    document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===target));
    if(target==='overview')renderOverview();
    if(target==='pieces')renderPieces();
    if(target==='calendar')renderCalendar();
    if(target==='characters')renderCharacters();
    if(target==='motifs')renderMotifs();
    if(target==='seo')renderSeo();
    if(target==='marks')renderMarks();
    if(target==='readers')renderReaders();
    if(target==='settings')fillSettings();
    closeSide();
  }
  function openSide(){ $('side').classList.add('open'); $('backdrop').classList.add('show'); }
  function closeSide(){ $('side').classList.remove('open'); $('backdrop').classList.remove('show'); }

  function updateBadges(){
    const unread=WM.marks.unreadCount(); const bm=$('bMarks');
    if(unread>0){bm.style.display='inline-block';bm.textContent=unread;} else bm.style.display='none';
    const cDraft=WM.pieces.list().filter(p=>p.status!=='published').length; const bp=$('bPieces');
    if(cDraft>0){bp.style.display='inline-block';bp.textContent=cDraft;} else bp.style.display='none';
    const dueSoon=upcomingEvents(todayYmd(),7).length; const bc=$('bCal');
    if(dueSoon>0){bc.style.display='inline-block';bc.textContent=dueSoon;} else bc.style.display='none';
  }

  /* ════ WIRE ════ */
  function initApp(){
    fillSettings(); renderOverview();
    if(WM.user) $('whoami').textContent=(WM.user.email||'').slice(0,22);

    document.querySelectorAll('.nav-item').forEach(n=>n.addEventListener('click',()=>go(n.dataset.target)));
    $('newPiece').addEventListener('click',()=>location.href='editor.html');
    $('newPiece2').addEventListener('click',()=>location.href='editor.html');
    $('ham').addEventListener('click',openSide); $('backdrop').addEventListener('click',closeSide);
    $('addEvent').addEventListener('click',()=>openEventModal());
    $('addChar').addEventListener('click',()=>openCharModal());

    // piece tabs + search
    document.querySelectorAll('#pieceTabs .tab').forEach(t=>t.addEventListener('click',()=>{
      document.querySelectorAll('#pieceTabs .tab').forEach(x=>x.classList.remove('active')); t.classList.add('active');
      pieceWf=t.dataset.wf; renderPieces();
    }));
    $('pieceSearch').addEventListener('input',e=>{ pieceSearch=e.target.value.trim().toLowerCase(); renderPieces(); });

    // calendar nav
    $('calPrev').addEventListener('click',()=>{ calMonth--; if(calMonth<0){calMonth=11;calYear--;} renderCalendar(); });
    $('calNext').addEventListener('click',()=>{ calMonth++; if(calMonth>11){calMonth=0;calYear++;} renderCalendar(); });
    $('calToday').addEventListener('click',()=>{ const n=new Date(); calYear=n.getFullYear(); calMonth=n.getMonth(); renderCalendar(); });

    // delegated clicks
    document.addEventListener('click',e=>{
      const close=e.target.closest('[data-go]'); if(close){ e.preventDefault(); go(close.dataset.go); return; }
      const ed=e.target.closest('[data-edit]'); if(ed && ed.dataset.edit){ location.href='editor.html?id='+encodeURIComponent(ed.dataset.edit); return; }
      const pub=e.target.closest('[data-pub]'); if(pub){ togglePublish(pub.dataset.pub); return; }
      const del=e.target.closest('[data-del]'); if(del){ removePiece(del.dataset.del); return; }
      const mr=e.target.closest('[data-mread]'); if(mr){ WM.marks.markRead(mr.dataset.mread); renderMarks(); renderOverview(); updateBadges(); return; }
      const ch=e.target.closest('[data-char]'); if(ch){ openCharModal(ch.dataset.char); return; }
      const evo=e.target.closest('[data-evopen]'); if(evo){ const ev=allEvents().find(x=>x.id===evo.dataset.evopen); if(ev) openEventModal(ev.date,ev); return; }
      const chip=e.target.closest('[data-chip]'); if(chip){
        const evs=eventsByDate()[chip.dataset.chip]||[]; const idx=chip.dataset.cidx!=null?+chip.dataset.cidx:-1;
        if(idx>=0 && evs[idx]){ const ev=evs[idx]; if(ev.source==='schedule') openEventModal(ev.date,ev); else location.href='editor.html?id='+encodeURIComponent(ev.pieceId); }
        else openEventModal(chip.dataset.chip);
        e.stopPropagation(); return;
      }
      const seot=e.target.closest('[data-seotoggle]'); if(seot){ seot.closest('.seo-row').classList.toggle('open'); return; }
      const day=e.target.closest('[data-day]'); if(day){ openEventModal(day.dataset.day); return; }
    });

    // progress quick-set
    document.addEventListener('change',e=>{
      const ps=e.target.closest('[data-prog]'); if(ps){ setProgress(ps.dataset.prog, ps.value); return; }
    });

    // motif notes (save on blur)
    document.addEventListener('blur',e=>{
      const mn=e.target.closest('[data-motif]'); if(mn){ WM.motifMeta.set(mn.dataset.motif,{note:mn.value}); }
      const kw=e.target.closest('[data-seokw]'); if(kw){ WM.pieceMeta.set(kw.dataset.seokw,{focusKeyword:kw.value.trim()}); renderSeo(); }
      const ds=e.target.closest('[data-seodesc]'); if(ds){ WM.pieceMeta.set(ds.dataset.seodesc,{metaDescription:ds.value.trim()}); renderSeo(); }
    },true);
    // live description counter
    document.addEventListener('input',e=>{
      const ds=e.target.closest('[data-seodesc]'); if(ds){ const c=document.querySelector('[data-deskcount="'+CSS.escape(ds.dataset.seodesc)+'"]'); if(c) c.textContent=ds.value.length+'/160'; }
    });

    // settings
    document.querySelectorAll('.st').forEach(b=>b.addEventListener('click',()=>{
      document.querySelectorAll('.st').forEach(x=>x.classList.remove('active')); b.classList.add('active');
      document.querySelectorAll('.settings-sec').forEach(s=>s.classList.toggle('active',s.dataset.sec===b.dataset.sec));
    }));
    $('saveId').addEventListener('click',saveIdentity);
    $('resetId').addEventListener('click',()=>{ if(confirm('Clear your identity fields?')){ WM.identity.clear(); fillSettings(); renderOverview(); toast('Identity reset.'); } });
    $('saveSite').addEventListener('click',saveSite);
    $('exportBackup').addEventListener('click',exportBackup);
    $('importBackup').addEventListener('click',()=>$('importFile').click());
    $('importFile').addEventListener('change',e=>{ if(e.target.files[0]) importBackup(e.target.files[0]); });
    $('exportSubs').addEventListener('click',exportSubs);
    $('markAllRead').addEventListener('click',()=>{ WM.marks.all().forEach(m=>{ if(!m.read) WM.marks.markRead(m.id); }); renderMarks(); renderOverview(); updateBadges(); });
    $('signOut').addEventListener('click',doSignOut);
    $('gateSignOut').addEventListener('click',doSignOut);
    $('modalBg').addEventListener('click',e=>{ if(e.target===$('modalBg')) closeModal(); });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeModal(); });

    updateBadges();
  }
  async function doSignOut(){ try{ if(WM.auth&&WM.auth.signOut) await WM.auth.signOut(); }catch(e){} location.href='login.html'; }

  /* ════ GATE / BOOT ════ */
  function showGate(title,msg){ $('gateTitle').textContent=title; $('gateMsg').textContent=msg; $('gate').classList.add('show'); }
  function boot(detail){
    const online=!!detail.online;
    if(online && !WM.user){ location.href='login.html?redirect=hub.html'; return; }
    if(online && WM.user && !WM.isAdmin){ initApp(); showGate('A private studio','This room belongs to the author. You\'re signed in, but not as the author of this site.'); return; }
    if(!online){ $('localNote').style.display='block'; }
    initApp();
  }
  if(typeof WM!=='undefined' && WM.online!==undefined) boot({online:WM.online});
  else window.addEventListener('wm:ready',e=>boot(e.detail),{once:true});
})();
