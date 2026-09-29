/* RAYAN V7.1 — bilingual UI + Photo Salon + Starlight Chamber + deeper horror route */
(() => {
  const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const readJSON=(k,fallback=null)=>{try{const v=sessionStorage.getItem(k);return v===null?fallback:JSON.parse(v)}catch{return fallback}};
  const readLocal=(k,fallback=null)=>{try{const v=localStorage.getItem(k);return v===null?fallback:JSON.parse(v)}catch{return fallback}};
  const writeLocal=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
  let lang=readLocal('rayanLang','en')==='zh'?'zh':'en';
  const tr=(en,zh)=>lang==='zh'?zh:en;

  const dynamicPairs=new Map([
    ['PRIVATE PREVIEW · OPEN NOW','私人预展 · 当前开放'],
    ['LIVE SHARED WALL','实时共享留言墙'],
    ['SHARED WALL OFFLINE · LOCAL FALLBACK','共享留言墙离线 · 已切换本地保存'],
    ['PRIVATE PREVIEW WALL','私人预展留言墙'],
    ['Present the code printed on your invitation.','请输入邀请函上的入场密码。'],
    ['The door stays closed.','门没有打开。'],
    ['ACCESS GRANTED · STARLIGHT CHAMBER','已开启 · 明星秘密房间']
  ]);

  const publicStamps=[
    ['FOYER','FOYER','序厅'],['00 ARCHIVE','00 ARCHIVE','00 早期档案'],
    ['01 QUIET DAYS','01 QUIET DAYS','01 静日'],['02 CAFE STUDIO','02 CAFÉ & STUDIO','02 咖啡与工作室'],
    ['03 TWILIGHT','03 TWILIGHT & REST','03 黄昏与休憩'],['04 IDENTITY','04 IDENTITY & MOOD','04 人物与情绪'],
    ['05 INK PRINT','05 INK & PRINT','05 水墨与版画'],['06 WALL OIL','06 MURAL & OIL','06 壁画与油画'],
    ['07 LIGHT NIGHT','07 LIGHT & NIGHT','07 光与夜色'],['08 ORNAMENT FORM','08 ORNAMENT & FORM','08 装饰与形式'],
    ['09A PORTRAITS','09A PHOTO SALON · PORTRAITS','09A 精选摄影 · 肖像'],
    ['09B FORM DETAIL','09B PHOTO SALON · FORM & DETAIL','09B 精选摄影 · 造型与细节'],
    ['09C LIGHT STUDIES','09C PHOTO SALON · LIGHT STUDIES','09C 精选摄影 · 光线研究'],
    ['09D ENVIRONMENT','09D PHOTO SALON · ENVIRONMENT','09D 精选摄影 · 环境肖像'],
    ['10 AFTER HOURS','10 AFTER HOURS','10 闭馆后入口'],['PHOTO SPOT','CHECK-IN','观展打卡'],
    ['GUESTBOOK','VISITOR BOOK','纪念签名墙'],['EXIT','EXIT','出口']
  ];
  const starStamp=['STARLIGHT','★ STARLIGHT CHAMBER','★ 明星秘密房间'];
  const horrorStamps=[['S1 UNCANNY','S1 UNCANNY ROOMS','S1 异常空间'],['S2 GOTHIC','S2 GOTHIC DEPTHS','S2 哥特深处']];

  function renderPassportV7(){
    const grid=q('#stampGrid'); if(!grid) return;
    const stamps=new Set(readJSON('rayanStamps',[]));
    const starUnlocked=!!readJSON('rayanSecretUnlocked',false);
    const horrorUnlocked=!!readJSON('rayanHorrorUnlocked',false);
    grid.innerHTML='';
    const labels=[...publicStamps];
    if(starUnlocked) labels.push(starStamp);
    if(horrorUnlocked) labels.push(...horrorStamps);
    labels.forEach(([key,en,zh])=>{
      const d=document.createElement('div'); d.className='stamp '+(stamps.has(key)?'is-stamped':'');
      d.innerHTML=`<span>${tr(en,zh)}</span><small>${stamps.has(key)?tr('VISITED','已参观'):tr('NOT YET','未参观')}</small>`;
      grid.appendChild(d);
    });
    const publicCount=publicStamps.filter(([k])=>stamps.has(k)).length;
    const secretDefs=[starStamp,...horrorStamps];
    const secretCount=secretDefs.filter(([k])=>stamps.has(k)).length;
    const exit=q('#exitStampCount');
    if(exit) exit.textContent=tr(`${publicCount} / 18 PUBLIC ROOMS · ${secretCount} / 3 SECRET`, `公开路线 ${publicCount} / 18 · 隐藏空间 ${secretCount} / 3`);
  }

  function applyLanguage(){
    document.documentElement.lang=lang==='zh'?'zh-CN':'en';
    qa('[data-en][data-zh]').forEach(el=>{el.textContent=tr(el.dataset.en,el.dataset.zh)});
    qa('[data-ph-en][data-ph-zh]').forEach(el=>{el.placeholder=tr(el.dataset.phEn,el.dataset.phZh)});
    const b=q('#languageToggle'); if(b) b.textContent=lang==='zh'?'EN':'中文';
    if(lang==='zh') qa('#scheduleText,#guestbookStatus,#gateMessage,#secretMessage').forEach(el=>{const zh=dynamicPairs.get(el.textContent.trim());if(zh)el.textContent=zh;});
    renderPassportV7();
  }
  q('#languageToggle')?.addEventListener('click',()=>{lang=lang==='en'?'zh':'en';writeLocal('rayanLang',lang);applyLanguage();});

  try{ window.renderPassport=renderPassportV7; renderPassport=renderPassportV7; }catch(_){ window.renderPassport=renderPassportV7; }

  function revealSecretState(){
    if(readJSON('rayanSecretUnlocked',false)){
      q('#starlight')?.classList.remove('is-hidden');
      q('#starlightMapEntry')?.classList.remove('is-hidden');
    }
    if(readJSON('rayanHorrorUnlocked',false)){
      q('#secretroom')?.classList.remove('is-hidden'); q('#secretroom-b')?.classList.remove('is-hidden');
      qa('.horror-map-entry').forEach(el=>el.classList.remove('is-hidden'));
    }
    renderPassportV7();
  }
  q('#secretForm')?.addEventListener('submit',()=>setTimeout(revealSecretState,40));
  q('#horrorDoorButton')?.addEventListener('click',()=>setTimeout(revealSecretState,40));
  revealSecretState();

  const observer=new MutationObserver(()=>{if(lang==='zh')qa('#scheduleText,#guestbookStatus,#gateMessage,#secretMessage').forEach(el=>{const zh=dynamicPairs.get(el.textContent.trim());if(zh)el.textContent=zh;});});
  qa('#scheduleText,#guestbookStatus,#gateMessage,#secretMessage').forEach(el=>observer.observe(el,{childList:true,subtree:true}));
  applyLanguage();
})();
