/* RAYAN ONLINE EXHIBITION v3 — Museum Edition
   Everything essential works as a static site. Shared guestbook is optional via assets/shared-config.js. */

const CONFIG = {
  // PREVIEW = always open for testing. Change to LIVE when your final date/time is ready.
  mode: 'PREVIEW', // PREVIEW | LIVE
  openAt: '2026-09-26T20:00:00+08:00',
  closeAt: '2026-09-27T23:00:00+08:00',
  displaySchedule: '26–27 SEP 2026 · PRIVATE VIEW',
  openingEditionMinutes: 90,
  secretWord: 'FROG',
  clueAfterUniqueArtworks: 4,
  roomsForCompletion: 8,
  // Client-side invitation gate = ceremony/privacy layer, not bank-grade security.
  invitations: {
    'CURATOR2026': {name:'CURATOR', number:'000', curator:true},
    'RAYAN0922': {name:'OPEN INVITE', number:null},
    'OPENING2026': {name:'VIP OPENING GUEST', number:null, vip:true},
    'RAY-8F2K-001': {name:'GUEST 01', number:'001'},
    'RAY-3M7Q-002': {name:'GUEST 02', number:'002'},
    'RAY-9D4N-003': {name:'GUEST 03', number:'003'},
    'RAY-2P6X-004': {name:'GUEST 04', number:'004'},
    'RAY-7K3V-005': {name:'GUEST 05', number:'005'},
    'RAY-5T8B-006': {name:'GUEST 06', number:'006'},
    'RAY-4H9C-007': {name:'GUEST 07', number:'007'},
    'RAY-6W2J-008': {name:'GUEST 08', number:'008'},
    'RAY-1Q5R-009': {name:'GUEST 09', number:'009'},
    'RAY-8L3A-010': {name:'GUEST 10', number:'010'},
    'RAY-2C7M-011': {name:'GUEST 11', number:'011'},
    'RAY-9V4E-012': {name:'GUEST 12', number:'012'}
  }
};

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const storage = {
  get(k, fallback=null){ try{ const v=localStorage.getItem(k); return v===null?fallback:JSON.parse(v); }catch{return fallback;} },
  set(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch{} }
};
const session = {
  get(k, fallback=null){ try{ const v=sessionStorage.getItem(k); return v===null?fallback:JSON.parse(v); }catch{return fallback;} },
  set(k,v){ try{ sessionStorage.setItem(k,JSON.stringify(v)); }catch{} }
};

function scheduleState(guest=null){
  if(CONFIG.mode==='PREVIEW' || guest?.curator) return 'open';
  const now=Date.now(), open=Date.parse(CONFIG.openAt), close=Date.parse(CONFIG.closeAt);
  if(now<open) return 'before';
  if(now>close) return 'closed';
  return 'open';
}
function formatCountdown(ms){
  const t=Math.max(0,Math.floor(ms/1000));
  const d=Math.floor(t/86400), h=Math.floor((t%86400)/3600), m=Math.floor((t%3600)/60), s=t%60;
  return `${d}D ${String(h).padStart(2,'0')}H ${String(m).padStart(2,'0')}M ${String(s).padStart(2,'0')}S`;
}
function refreshSchedule(){
  const el=$('#scheduleText'); if(!el) return;
  if(CONFIG.mode==='PREVIEW'){ el.textContent='PRIVATE PREVIEW · OPEN NOW'; return; }
  const state=scheduleState();
  if(state==='before') el.textContent=`DOORS OPEN IN ${formatCountdown(Date.parse(CONFIG.openAt)-Date.now())}`;
  else if(state==='open') el.textContent=CONFIG.displaySchedule;
  else el.textContent='THE EXHIBITION IS NOW CLOSED · ARCHIVE AVAILABLE';
}
setInterval(refreshSchedule,1000); refreshSchedule();

function normalizeCode(v){ return v.trim().toUpperCase(); }
function randomVisitorNo(){ return String(Math.floor(100+Math.random()*899)); }
function resolveGuest(code){
  const base=CONFIG.invitations[code];
  if(!base) return null;
  const g={...base, code};
  if(!g.number){
    const remembered=storage.get('rayanOpenInviteNumber');
    g.number=remembered || randomVisitorNo();
    if(!remembered) storage.set('rayanOpenInviteNumber',g.number);
  }
  return g;
}

function visitorDate(){ return new Date().toLocaleDateString(undefined,{year:'numeric',month:'short',day:'2-digit'}).toUpperCase(); }
function currentGuest(){ return session.get('rayanGuest'); }

// VIP / electronic-invitation context
const urlParams=new URLSearchParams(location.search);
if(urlParams.get('vip')==='1' || urlParams.get('vip')==='opening-night'){
  $('#vipRibbon')?.classList.remove('is-hidden');
}
const invitedCode=urlParams.get('code');
if(invitedCode && $('#accessCode')) $('#accessCode').value=invitedCode.toUpperCase();

const accessForm=$('#accessForm');
if(accessForm) accessForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const code=normalizeCode($('#accessCode').value);
  const guest=resolveGuest(code);
  const msg=$('#gateMessage');
  if(!guest){ msg.textContent='Invitation not recognized. Please check the code on your ticket.'; msg.className='gate-message error'; return; }
  const state=scheduleState(guest);
  if(state==='before'){
    msg.textContent=`Your ticket is valid, but the doors are not open yet. ${$('#scheduleText').textContent}`;
    msg.className='gate-message error'; return;
  }
  if(state==='closed'){
    msg.textContent='Your ticket is valid. The live exhibition has closed; the archive remains available.';
    msg.className='gate-message error'; return;
  }
  msg.textContent=`Ticket validated · ${guest.name} · № ${guest.number}`; msg.className='gate-message ok';
  session.set('rayanGuest',guest);
  session.set('rayanAccess',true);
  playOpeningSequence(guest);
});

$('#viewArchive')?.addEventListener('click',()=>{ location.href='archive.html'; });

function playOpeningSequence(guest){
  const overlay=$('#openingSequence');
  $('#openingGuest').textContent=`TICKET VALIDATED · ${guest.name} · № ${guest.number}`;
  overlay.classList.remove('is-hidden');
  document.body.style.overflow='hidden';
  setTimeout(()=>overlay.classList.add('open-doors'),650);
  setTimeout(()=>{
    overlay.classList.add('fade-away');
    openMuseum();
  },2200);
  setTimeout(()=>{ overlay.classList.add('is-hidden'); overlay.classList.remove('open-doors','fade-away'); document.body.style.overflow=''; },3200);
}

function openMuseum(){
  const guest=currentGuest(); if(!guest) return;
  $('#gate')?.classList.add('is-hidden');
  $('#museum')?.classList.remove('is-hidden');
  document.body.style.overflow='';
  stampVisitor(guest);
  restoreSecretState();
  refreshOpeningEdition();
  renderPassport();
  initObserversOnce();
}
if(session.get('rayanAccess') && currentGuest()) openMuseum();

function stampVisitor(guest){
  $('#visitorName').textContent=guest.name;
  $('#visitorNumber').textContent=`VISITOR № ${guest.number}`;
  $('#ticketNumber').textContent=`№ ${guest.number}`;
  $('#visitDate').textContent=visitorDate();
  $('#passportGuest').textContent=guest.name;
  $('#passportNumber').textContent=`VISITOR № ${guest.number}`;
  $('#souvenirGuest').textContent=`${guest.name} / PRIVATE VIEW`;
  if($('#guestName') && /^GUEST \d+$/i.test(guest.name)===false && guest.name!=='OPEN INVITE') $('#guestName').value=guest.name;
}

// OPENING NIGHT EDITION
function refreshOpeningEdition(){
  const panel=$('#openingEdition'); if(!panel) return;
  const text=$('#openingEditionText');
  if(CONFIG.mode==='PREVIEW'){
    panel.classList.remove('is-hidden'); text.textContent='CURATOR PREVIEW · opening-night work is visible for testing.'; return;
  }
  const open=Date.parse(CONFIG.openAt), windowEnd=open+CONFIG.openingEditionMinutes*60000, now=Date.now();
  const visible=now>=open && now<=windowEnd;
  panel.classList.toggle('is-hidden',!visible);
  text.textContent=visible?'OPENING WINDOW ACTIVE · this label disappears after the first 90 minutes.':'OPENING WINDOW CLOSED';
}
setInterval(refreshOpeningEdition,30000);

// ARTWORK CATALOGUE LABELS
$$('.artwork').forEach((card,idx)=>{
  const cap=$('figcaption',card); if(!cap || cap.dataset.catalogued==='1') return;
  cap.dataset.catalogued='1'; cap.classList.add('museum-plaque');
  const existingTitle=$('span',cap)?.textContent || card.dataset.title || 'UNTITLED';
  const existingSmall=$('small',cap)?.textContent || card.dataset.caption || 'Illustration';
  cap.innerHTML='';
  const no=document.createElement('span'); no.className='catalog-no'; no.textContent=`RYN.${String(idx+1).padStart(2,'0')} / 2026`;
  const title=document.createElement('span'); title.className='plaque-title';
  const strong=document.createElement('strong'); strong.textContent=existingTitle;
  const em=document.createElement('em'); em.textContent='RAYAN STUDY · DIGITAL ILLUSTRATION';
  title.append(strong,em);
  const meta=document.createElement('small'); meta.textContent=existingSmall;
  cap.append(no,title,meta);
});

// ARTWORK LIGHTBOX + CLUE TRACKING
const viewed=new Set(session.get('rayanViewedArtworks',[]));
function bindArtwork(card){
  card.addEventListener('click',()=>{
    const img=$('img',card);
    $('#lightboxImage').src=img.src;
    $('#lightboxImage').alt=img.alt;
    $('#lightboxTitle').textContent=card.dataset.title||'';
    $('#lightboxCaption').textContent=card.dataset.caption||'';
    $('#lightbox').classList.remove('is-hidden');
    document.body.style.overflow='hidden';
    viewed.add(card.dataset.title||img.alt||'Untitled');
    session.set('rayanViewedArtworks',[...viewed]);
    $('#artworkViewCount').textContent=`WORKS VIEWED THIS VISIT · ${viewed.size}`;
    if(viewed.size>=CONFIG.clueAfterUniqueArtworks) revealClue();
  });
}
$$('.artwork').forEach(bindArtwork);
function revealClue(){ $('#secretClue')?.classList.remove('is-hidden'); session.set('rayanClue',true); }
if(session.get('rayanClue') || viewed.size>=CONFIG.clueAfterUniqueArtworks) revealClue();
function closeLightbox(){ $('#lightbox')?.classList.add('is-hidden'); document.body.style.overflow=''; }
$('#closeLightbox')?.addEventListener('click',closeLightbox);
$('#lightbox')?.addEventListener('click',e=>{ if(e.target===$('#lightbox')) closeLightbox(); });

// MAP
$('#mapButton')?.addEventListener('click',()=>{ $('#museumMap').classList.remove('is-hidden'); document.body.style.overflow='hidden'; });
function closeMap(){ $('#museumMap')?.classList.add('is-hidden'); document.body.style.overflow=''; }
$('#closeMap')?.addEventListener('click',closeMap);
$('#museumMap')?.addEventListener('click',e=>{ if(e.target===$('#museumMap')) closeMap(); });
$$('#museumMap a').forEach(a=>a.addEventListener('click',closeMap));

// PASSPORT
const STAMP_LABELS=['FOYER','01 ORIGINAL','02 TRANSFORM','03 WORLDS','SPECIAL','SECRET','PHOTO SPOT','GUESTBOOK','EXIT'];
function getStamps(){ return new Set(session.get('rayanStamps',[])); }
function addStamp(label){
  const s=getStamps(); if(!s.has(label)){ s.add(label); session.set('rayanStamps',[...s]); renderPassport(); }
}
function renderPassport(){
  const grid=$('#stampGrid'); if(!grid) return;
  const s=getStamps(); grid.innerHTML='';
  STAMP_LABELS.forEach(label=>{
    if(label==='SECRET' && !session.get('rayanSecretUnlocked')) return;
    const d=document.createElement('div'); d.className='stamp '+(s.has(label)?'is-stamped':'');
    d.innerHTML=`<span>${label}</span><small>${s.has(label)?'VISITED':'NOT YET'}</small>`;
    grid.appendChild(d);
  });
  const count=s.size;
  $('#exitStampCount').textContent=`${count} STAMPS COLLECTED`;
}
$('#passportButton')?.addEventListener('click',()=>{ renderPassport(); $('#passportPanel').classList.remove('is-hidden'); document.body.style.overflow='hidden'; });
function closePassport(){ $('#passportPanel')?.classList.add('is-hidden'); document.body.style.overflow=''; }
$('#closePassport')?.addEventListener('click',closePassport);
$('#passportPanel')?.addEventListener('click',e=>{ if(e.target===$('#passportPanel')) closePassport(); });

let observersStarted=false;
function initObserversOnce(){
  if(observersStarted) return; observersStarted=true;
  const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting && entry.intersectionRatio>=.32){
        const label=entry.target.dataset.stamp;
        if(label) addStamp(label);
      }
    });
  },{threshold:[.32,.55]});
  $$('[data-stamp]').forEach(el=>io.observe(el));
}

// SECRET ROOM
$('#secretForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  const v=$('#secretCode').value.trim().toUpperCase();
  if(v===CONFIG.secretWord){
    $('#secretMessage').textContent='ACCESS GRANTED · UNLISTED ROOM 00';
    $('#secretMessage').className='ok-inline';
    unlockSecret();
    setTimeout(()=>document.querySelector('#secretroom').scrollIntoView({behavior:'smooth'}),350);
  }else{
    $('#secretMessage').textContent='The door stays closed.';
    $('#secretMessage').className='error-inline';
  }
});
function unlockSecret(){
  session.set('rayanSecretUnlocked',true);
  $('#secretroom')?.classList.remove('is-hidden');
  $('#secretMapEntry')?.classList.remove('is-hidden');
  renderPassport();
}
function restoreSecretState(){ if(session.get('rayanSecretUnlocked')) unlockSecret(); }

// PHOTO SPOT FULLSCREEN
$('#fullscreenPhoto')?.addEventListener('click',async()=>{
  const el=$('#photoWall');
  try{ if(document.fullscreenElement) await document.exitFullscreen(); else await el.requestFullscreen(); }catch(_){}
});

// CHECK-IN CARD GENERATOR
let lastCheckinDataURL='';
function fileToImage(file){
  return new Promise((resolve,reject)=>{
    if(!file) return resolve(null);
    const r=new FileReader();
    r.onload=()=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=reject; img.src=r.result; };
    r.onerror=reject; r.readAsDataURL(file);
  });
}
function cover(ctx,img,x,y,w,h){
  const r=Math.max(w/img.width,h/img.height), nw=img.width*r, nh=img.height*r;
  ctx.drawImage(img,x+(w-nw)/2,y+(h-nh)/2,nw,nh);
}
$('#checkinForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const guest=currentGuest()||{name:'GUEST',number:'—'};
  const file=$('#checkinPhoto').files?.[0];
  const userImg=await fileToImage(file).catch(()=>null);
  const line=($('#checkinLine').value.trim()||'I WAS HERE · PRIVATE VIEW').toUpperCase();
  const art=new Image();
  art.src='assets/images/11_isolated-sketch.webp';
  await new Promise(res=>{ if(art.complete) res(); else art.onload=res; });
  const c=document.createElement('canvas'); c.width=1200; c.height=1500;
  const x=c.getContext('2d');
  x.fillStyle='#182228'; x.fillRect(0,0,c.width,c.height);
  x.fillStyle='#e9e2d6'; x.fillRect(52,52,1096,1396);
  x.fillStyle='#111'; x.font='900 150px Arial'; x.fillText('RAYAN',92,225);
  x.font='700 32px Arial'; x.fillText('SAME KID / DIFFERENT WORLD',98,285);
  x.fillStyle='#87b83d'; x.fillRect(92,322,1016,10);
  if(userImg){ cover(x,userImg,92,382,625,680); }
  else { x.fillStyle='#d7d0c4'; x.fillRect(92,382,625,680); x.fillStyle='#676158'; x.font='700 28px monospace'; x.fillText('YOUR PHOTO / SCREENSHOT AREA',130,720); }
  x.drawImage(art,650,635,470,470);
  x.fillStyle='#111'; x.font='900 44px Arial'; x.fillText(line.slice(0,36),92,1148);
  x.font='700 26px monospace'; x.fillText(`${guest.name} · VISITOR № ${guest.number}`,92,1210);
  x.fillText(visitorDate(),92,1252);
  x.font='700 22px Arial'; x.fillStyle='#516f25'; x.fillText('PRIVATE ONLINE EXHIBITION · 2026',92,1340);
  x.fillStyle='#111'; x.font='900 24px Arial'; x.fillText('GOOD THINGS AHEAD',820,1390);
  lastCheckinDataURL=c.toDataURL('image/png');
  $('#checkinImage').src=lastCheckinDataURL;
  $('#checkinPreview').classList.remove('is-hidden');
});
$('#downloadCheckin')?.addEventListener('click',()=>{
  if(!lastCheckinDataURL) return;
  const g=currentGuest()||{number:'000'}; const a=document.createElement('a');
  a.download=`RAYAN_checkin_${g.number}.png`; a.href=lastCheckinDataURL; a.click();
});

// GUESTBOOK — local preview + optional Supabase shared wall
const starter=[
  {name:'CURATOR',favorite:'Private Selection I',message:'Welcome to the first private viewing of RAYAN.',created_at:'OPENING NOTE'},
  {name:'VISITOR 001',favorite:'Night City',message:'Same kid, different world.',created_at:'FIRST ENTRY'}
];
const shared=window.RAYAN_SHARED||{enabled:false};
function localEntries(){ return storage.get('rayanGuestbook',starter); }
function saveLocalEntries(list){ storage.set('rayanGuestbook',list); }
function renderGuestbook(entries){
  const wall=$('#signatureWall'); if(!wall) return; wall.innerHTML='';
  entries.slice().reverse().forEach((e,i)=>{
    const card=document.createElement('article'); card.className='signature-card';
    card.style.setProperty('--tilt',`${((i%7)-3)*.38}deg`);
    const strong=document.createElement('strong'); strong.textContent=e.name||'ANONYMOUS';
    const small=document.createElement('small');
    const when=e.created_at && !String(e.created_at).includes('NOTE') && !String(e.created_at).includes('ENTRY') ? new Date(e.created_at).toLocaleDateString(undefined,{month:'short',day:'2-digit',year:'numeric'}).toUpperCase() : (e.created_at||'');
    small.textContent=when;
    const p=document.createElement('p'); p.textContent=e.message||e.msg||'';
    const em=document.createElement('em'); em.textContent=`FAVORITE: ${e.favorite||e.fav||'—'}`;
    card.append(strong,small,p,em); wall.append(card);
  });
}
async function sharedFetch(table,path='',opts={}){
  const url=`${shared.supabaseUrl}/rest/v1/${table}${path}`;
  const headers={apikey:shared.anonKey,Authorization:`Bearer ${shared.anonKey}`,'Content-Type':'application/json',...(opts.headers||{})};
  const r=await fetch(url,{...opts,headers}); if(!r.ok) throw new Error(`Shared wall error ${r.status}`); return r;
}
async function loadGuestbook(){
  if(shared.enabled && shared.supabaseUrl && shared.anonKey){
    try{
      const r=await sharedFetch(shared.guestbookTable||'guestbook','?select=id,name,favorite,message,ticket_no,created_at&order=created_at.desc&limit=100');
      const data=await r.json();
      renderGuestbook(data.slice().reverse());
      $('#guestbookModeText').textContent='This wall is live: invited visitors can see one another’s notes.';
      $('#guestbookStatus').textContent='LIVE SHARED WALL';
      $('#guestbookStatus').classList.add('live');
      return;
    }catch(err){
      $('#guestbookStatus').textContent='SHARED WALL OFFLINE · LOCAL FALLBACK';
    }
  }
  renderGuestbook(localEntries());
  $('#guestbookModeText').textContent='Preview mode: signatures are stored on this device. Connect the included free shared-wall option before opening night.';
}
loadGuestbook();
$('#guestbookForm')?.addEventListener('submit',async e=>{
  e.preventDefault();
  const guest=currentGuest()||{};
  const entry={
    name:$('#guestName').value.trim(),
    favorite:$('#guestFavorite').value,
    message:$('#guestMessage').value.trim(),
    ticket_no:guest.number||null,
    created_at:new Date().toISOString()
  };
  const button=e.submitter||$('button[type="submit"]',e.target); if(button) button.disabled=true;
  if(shared.enabled && shared.supabaseUrl && shared.anonKey){
    try{
      await sharedFetch(shared.guestbookTable||'guestbook','',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(entry)});
      await loadGuestbook(); e.target.reset(); if($('#guestName') && guest.name && guest.name!=='OPEN INVITE') $('#guestName').value=guest.name;
      if(button) button.disabled=false; return;
    }catch(err){ $('#guestbookStatus').textContent='SHARED WALL WRITE FAILED · SAVED LOCALLY'; }
  }
  const list=localEntries(); list.push(entry); saveLocalEntries(list); renderGuestbook(list); e.target.reset();
  if($('#guestName') && guest.name && guest.name!=='OPEN INVITE') $('#guestName').value=guest.name;
  if(button) button.disabled=false;
});

// SHARED CHECK-IN WALL — optional Supabase Storage + table
async function loadCheckinWall(){
  if(!(shared.enabled && shared.supabaseUrl && shared.anonKey)) return;
  try{
    const r=await sharedFetch(shared.checkinsTable||'checkins','?select=id,name,ticket_no,image_url,created_at&order=created_at.desc&limit=30');
    const data=await r.json();
    const gallery=$('#checkinGallery'), grid=$('#checkinGalleryGrid');
    if(!gallery||!grid) return;
    grid.innerHTML='';
    data.forEach(e=>{
      const card=document.createElement('article'); card.className='checkin-post';
      const img=document.createElement('img'); img.src=e.image_url; img.alt=`${e.name||'Visitor'} check-in`;
      const meta=document.createElement('div'); const n=document.createElement('span'); n.textContent=e.name||'VISITOR'; const no=document.createElement('small'); no.textContent=e.ticket_no?`№ ${e.ticket_no}`:''; meta.append(n,no); card.append(img,meta); grid.append(card);
    });
    gallery.classList.toggle('is-hidden',data.length===0);
    $('#postCheckin')?.classList.remove('is-hidden');
  }catch(err){
    console.warn('Shared check-in wall unavailable',err);
  }
}
async function postCheckinToWall(){
  if(!lastCheckinDataURL || !(shared.enabled && shared.supabaseUrl && shared.anonKey)) return;
  const btn=$('#postCheckin'); if(btn) btn.disabled=true;
  try{
    const g=currentGuest()||{name:'VISITOR',number:'000'};
    const blob=await (await fetch(lastCheckinDataURL)).blob();
    const filename=`rayan_${g.number}_${Date.now()}.png`;
    const bucket=shared.storageBucket||'checkins';
    const uploadUrl=`${shared.supabaseUrl}/storage/v1/object/${bucket}/${filename}`;
    const ur=await fetch(uploadUrl,{method:'POST',headers:{apikey:shared.anonKey,Authorization:`Bearer ${shared.anonKey}`,'Content-Type':'image/png','x-upsert':'false'},body:blob});
    if(!ur.ok) throw new Error(`upload ${ur.status}`);
    const publicUrl=`${shared.supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;
    await sharedFetch(shared.checkinsTable||'checkins','',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({name:g.name,ticket_no:g.number,image_url:publicUrl})});
    await loadCheckinWall();
    if(btn){btn.textContent='POSTED TO WALL'; setTimeout(()=>btn.textContent='POST TO VISITOR WALL',1800);}
  }catch(err){
    if(btn) btn.textContent='POST FAILED';
    console.warn(err);
  }finally{ if(btn) btn.disabled=false; }
}
$('#postCheckin')?.addEventListener('click',postCheckinToWall);
loadCheckinWall();

// DIGITAL SOUVENIR TICKET
$('#downloadTicket')?.addEventListener('click',()=>{
  const g=currentGuest()||{name:'GUEST',number:'000'};
  const c=document.createElement('canvas'); c.width=1800; c.height=1000; const x=c.getContext('2d');
  x.fillStyle='#e9e1d2'; x.fillRect(0,0,c.width,c.height);
  x.fillStyle='#121212'; x.fillRect(0,0,135,c.height); x.fillRect(1665,0,135,c.height);
  x.fillStyle='#111'; x.font='900 220px Arial'; x.fillText('RAYAN',215,330);
  x.font='700 52px Arial'; x.fillText('SAME KID, DIFFERENT WORLD',225,435);
  x.strokeStyle='#111'; x.lineWidth=4; x.setLineDash([18,14]); x.beginPath(); x.moveTo(225,520); x.lineTo(1575,520); x.stroke(); x.setLineDash([]);
  x.font='700 36px monospace'; x.fillText('PRIVATE ONLINE EXHIBITION · 2026',225,630);
  x.font='900 68px monospace'; x.fillText(`${g.name}`,225,760);
  x.font='900 58px monospace'; x.fillText(`VISITOR № ${g.number}`,225,842);
  x.fillStyle='#6f8f35'; x.font='900 34px Arial'; x.fillText('ADMIT ONE · THANK YOU FOR VISITING',225,915);
  const a=document.createElement('a'); a.download=`RAYAN_visitor_${g.number}.png`; a.href=c.toDataURL('image/png'); a.click();
});
$('#restartTour')?.addEventListener('click',()=>{ location.hash='#foyer'; window.scrollTo({top:0,behavior:'smooth'}); });

$$('.fragment').forEach(btn=>btn.addEventListener('click',()=>{
  $$('.fragment').forEach(b=>b.classList.remove('is-active'));
  btn.classList.add('is-active');
  const target=$('#secretWhisper'); if(target) target.textContent=btn.dataset.fragment||'';
}));

document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ closeLightbox(); closeMap(); closePassport(); } });
