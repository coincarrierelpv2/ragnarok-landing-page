'use strict';
(() => {
const ASSETS={'swordman':'assets/images/swordman.webp','mage':'assets/images/mage.webp','archer':'assets/images/archer.webp','baphomet-full':'assets/images/baphomet-full.webp','eddga-full':'assets/images/eddga-full.webp'};

  const translations = {
  "th": {
    "skip": "ข้ามไปยังเนื้อหา",
    "navWorld": "โลกของเกม",
    "navClasses": "อาชีพของคุณ",
    "heroTitle1": "มิดการ์ดกำลังเรียกหา",
    "heroTitle2": "ออกไปเขียนเรื่องราวของคุณ",
    "ctaPrefix": "เล่น",
    "ctaFree": "ฟรี",
    "ctaSuffix": "บน Steam",
    "scroll": "การผจญภัยของคุณเริ่มที่นี่",
    "experienceTitle": "โลกใหม่รอคุณอยู่",
    "classesTitle": "ตำนานแห่งมิดการ์ด",
    "lastTitle": "การผจญภัยของคุณเริ่มที่นี่",
    "sticky": "โลกใหม่กำลังรอคุณอยู่"
  }
};
  const classes = {
  "swordman": {
    "image": "swordman",
    "name": "Swordman",
    "en": {
      "description": "Lead the charge with sword, shield, and heavy armor.",
      "traits": [
        "Melee",
        "Defense"
      ]
    },
    "th": {
      "description": "นำการต่อสู้ด้วยดาบ โล่ และเกราะหนัก",
      "traits": [
        "ระยะประชิด",
        "ป้องกัน"
      ]
    },
    "kind": "class"
  },
  "mage": {
    "image": "mage",
    "name": "Mage",
    "en": {
      "description": "Unleash elemental magic and strike at enemy weaknesses.",
      "traits": [
        "Magic",
        "Elements"
      ]
    },
    "th": {
      "description": "ปลดปล่อยเวทมนตร์ธาตุเพื่อโจมตีจุดอ่อนของศัตรู",
      "traits": [
        "เวทมนตร์",
        "ธาตุ"
      ]
    },
    "kind": "class"
  },
  "archer": {
    "image": "archer",
    "name": "Archer",
    "en": {
      "description": "Strike from afar with a bow and pinpoint precision.",
      "traits": [
        "Ranged",
        "Bow"
      ]
    },
    "th": {
      "description": "โจมตีจากระยะไกลด้วยธนูและความแม่นยำ",
      "traits": [
        "ระยะไกล",
        "ธนู"
      ]
    },
    "kind": "class"
  },
  "baphomet": {
    "image": "baphomet-full",
    "name": "Baphomet",
    "kind": "boss",
    "en": {
      "description": "Face Midgard’s horned legend and his mighty scythe.",
      "traits": [
        "Scythe"
      ]
    },
    "th": {
      "description": "เผชิญหน้าตำนานผู้มีเขาแห่งมิดการ์ดและเคียวทรงพลัง",
      "traits": [
        "เคียว"
      ]
    }
  },
  "eddga": {
    "image": "eddga-full",
    "name": "Eddga",
    "kind": "boss",
    "en": {
      "description": "Meet Payon’s fearsome tiger, with his signature pipe.",
      "traits": [
        "Tiger"
      ]
    },
    "th": {
      "description": "พบกับเสือผู้ดุดันแห่งพายอนและไปป์คู่ใจ",
      "traits": [
        "เสือ"
      ]
    }
  }
};
  const elements = [...document.querySelectorAll('[data-i18n]')];
  const english = new Map(elements.map(el => [el, el.innerHTML]));
  let language = 'en';
  let activeClass = 'swordman';
  let requestedClass = activeClass, transitionId = 0;
  const artworkCache = new Map();
  const decodedArtwork = new Map();
  const dotsBox=document.createElement('div');dotsBox.className='class-dots';dotsBox.setAttribute('aria-hidden','true');
  Object.keys(classes).forEach(()=>dotsBox.append(document.createElement('i')));
  document.querySelector('.class-stage').after(dotsBox);
  function prepareArtwork(key) {
    if (!artworkCache.has(key)) {
      const asset = new Image();
      const ready = new Promise(resolve => {
        asset.onload = async () => {
          try { await asset.decode?.(); } catch {}
          decodedArtwork.set(key, asset);
          resolve(true);
        };
        asset.onerror = () => { artworkCache.delete(key); resolve(false); };
      });
      artworkCache.set(key, ready);
      asset.src = ASSETS[classes[key].image];
    }
    return artworkCache.get(key);
  }
  function showClass(key, announce=true) {
    if (!Object.hasOwn(classes,key)) return;
    requestedClass = key;
    const request = ++transitionId;
    if (key === activeClass) { renderClass(key, announce); return; }
    prepareArtwork(key).then(ready => {
      if (request !== transitionId) return;
      if (ready) renderClass(key, announce);
      else requestedClass = activeClass;
      scheduleRotation();
    });
  }
  function renderClass(key, announce=true) {
    if (!Object.hasOwn(classes,key)) return;
    activeClass=key;
    document.getElementById('classes').dataset.cls=key;
    [...dotsBox.children].forEach((d,i)=>d.classList.toggle('on',i===Object.keys(classes).indexOf(key)));
    const entry=classes[key], copy=entry[language];
    document.querySelector('.class-copy').setAttribute('aria-live',announce?'polite':'off');
    document.querySelector('.character-art').dataset.kind=entry.kind;
    document.getElementById('legend-kind').textContent=language==='th'?(entry.kind==='class'?'อาชีพ':'บอส MVP'):(entry.kind==='class'?'CLASS':'MVP BOSS');
    document.getElementById('class-name').textContent=entry.name;
    document.getElementById('class-description').textContent=copy.description;
    const traits=document.getElementById('class-traits');traits.replaceChildren();
    copy.traits.forEach(text=>{const span=document.createElement('span');span.textContent=text;traits.append(span);});
    const previous=document.getElementById('character');
    const image=decodedArtwork.get(key) || previous;
    // Insert the decoded element itself. Never change the source of the visible image.
    // No opacity/slide animation: one complete artwork is visible at every paint.
    if (image !== previous) {
      image.id='character';
      image.width=1029; image.height=918;
      image.loading='eager';
      previous.replaceWith(image);
    }
    image.alt=language==='th'?`ภาพ ${entry.name}`:`${entry.name} artwork`;

  }
  function setLanguage(lang,save=false) {
    language=lang==='th'?'th':'en'; document.documentElement.lang=language;
    elements.forEach(el=>{
      if(language==='en') el.innerHTML=english.get(el);
      else {const value=translations.th[el.dataset.i18n];if(value!==undefined){el.replaceChildren();value.split('\n').forEach((line,i)=>{if(i)el.append(document.createElement('br'));el.append(document.createTextNode(line));});}}
    });
    document.querySelectorAll('[data-lang]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===language)));
    document.getElementById('play-video').setAttribute('aria-label',language==='th'?'เล่นวิดีโอตัวอย่างเกมอย่างเป็นทางการ':'Play the official game trailer');
    document.getElementById('trailer').setAttribute('aria-label',language==='th'?'วิดีโอตัวอย่าง Ragnarok The New World อย่างเป็นทางการจาก Steam':'Game trailer');
    document.title=language==='th'?'Ragnarok: The New World — การผจญภัยครั้งใหม่รอคุณอยู่':'Ragnarok: The New World — Your next adventure awaits';
    document.querySelector('.class-prev').setAttribute('aria-label',language==='th'?'ตัวละครก่อนหน้า':'Previous character');
    document.querySelector('.class-next').setAttribute('aria-label',language==='th'?'ตัวละครถัดไป':'Next character');
    showClass(activeClass);
    if(save){try{localStorage.setItem('ragnarok-language',language);}catch{/* The page also works when storage is blocked. */}}
  }
  let saved;try{saved=localStorage.getItem('ragnarok-language');}catch{}
  // Prefer an explicit choice, then the browser's primary language; English is the fallback.
  const browserLanguage=(navigator.languages?.[0]||navigator.language||'en').toLowerCase();
  setLanguage(saved==='en'||saved==='th'?saved:(browserLanguage.startsWith('th')?'th':'en'));
  document.querySelectorAll('[data-lang]').forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.lang,true)));
  function stepClass(step, announce=true) {
    const keys=Object.keys(classes);
    clearTimeout(rotationTimer);
    showClass(keys[(keys.indexOf(requestedClass)+step+keys.length)%keys.length],announce);
    if (announce) scheduleRotation();
  }
  document.querySelectorAll('[data-class-step]').forEach(button=>button.addEventListener('click',()=>stepClass(Number(button.dataset.classStep))));
  document.querySelector('.class-navigation').addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();stepClass(event.key==='ArrowLeft'?-1:1);}
  });
  const overlay=document.getElementById('video-overlay');
  overlay.hidden=false;
  document.getElementById('play-video').addEventListener('click',()=>window.open('https://www.youtube.com/watch?v=s9tQLg2QQUQ','_blank','noopener'));
  
  const sticky=document.getElementById('sticky-cta');
  const stickyButton=sticky.querySelector('.cta');
  let stickyWasVisible=false;
  function updateStickyVisibility(heroVisible,endVisible){
    const shouldShow=!heroVisible&&!endVisible;
    sticky.hidden=!shouldShow;
    if(shouldShow&&!stickyWasVisible&&!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
      stickyButton.classList.remove('cta-sticky-shimmer');
      requestAnimationFrame(()=>stickyButton.classList.add('cta-sticky-shimmer'));
    }
    stickyWasVisible=shouldShow;
  }
  stickyButton.addEventListener('animationend',event=>{if(event.animationName==='cta-sticky-arrival-sheen')stickyButton.classList.remove('cta-sticky-shimmer');});
  if('IntersectionObserver' in window){
    let heroVisible=true,endVisible=false;
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.target.id==='adventure')heroVisible=entry.isIntersecting;else endVisible=entry.isIntersecting;});updateStickyVisibility(heroVisible,endVisible);},{threshold:0});
    observer.observe(document.getElementById('adventure'));observer.observe(document.querySelector('.journey-cta'));
  }


  const scene=document.getElementById('hero-video');
  const scenePreference=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let sceneVisible=true;
  function updateScene(){
    const reduce=scenePreference?.matches;
    if(reduce||!sceneVisible||document.hidden){
      if(scene.hasAttribute('src'))scene.pause();
      if(reduce){scene.classList.remove('scene-ready');}
      return;
    }
    if(!scene.hasAttribute('src')){scene.src=scene.dataset.src;scene.muted=true;}
    const playback=scene.play();
    playback?.catch(()=>{});
    
  }
  scene.addEventListener('playing',()=>{scene.classList.add('scene-ready');});
  scene.addEventListener('error',()=>{scene.classList.remove('scene-ready');});
  scenePreference?.addEventListener?.('change',updateScene);
  document.addEventListener('visibilitychange',updateScene);
  if('IntersectionObserver' in window){new IntersectionObserver(entries=>{sceneVisible=entries[0].isIntersecting;updateScene();}).observe(document.getElementById('adventure'));}
  updateScene();

  Object.keys(classes).forEach(prepareArtwork);
  const ambientCtas=[...document.querySelectorAll('.hero-content .cta,.journey-cta .cta,.sticky-cta .cta')];
  const visibleCtas=new Set();
  const ctaMotionPreference=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  function updateCtaMotion(){
    ambientCtas.forEach(button=>button.classList.toggle('cta-motion-active',
      visibleCtas.has(button)&&!document.hidden&&!ctaMotionPreference?.matches));
  }
  ambientCtas.forEach(button=>button.classList.add('cta-ambient'));
  if ('IntersectionObserver' in window) {
    const ctaObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting && entry.intersectionRatio>=.5)visibleCtas.add(entry.target);
        else visibleCtas.delete(entry.target);
      });
      updateCtaMotion();
    },{threshold:[0,.5]});
    ambientCtas.forEach(button=>ctaObserver.observe(button));
  }
  document.addEventListener('visibilitychange',updateCtaMotion);
  ctaMotionPreference?.addEventListener?.('change',updateCtaMotion);
  const legends=document.getElementById('classes');
  const rotationPreference=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let rotationTimer=null,legendsVisible=false;
  function scheduleRotation(){
    clearTimeout(rotationTimer);rotationTimer=null;
    if(!legendsVisible||document.hidden||rotationPreference?.matches)return;
    rotationTimer=setTimeout(()=>{stepClass(1,false);},3000);
  }
  document.addEventListener('visibilitychange',scheduleRotation);
  rotationPreference?.addEventListener?.('change',scheduleRotation);
  if('IntersectionObserver' in window){new IntersectionObserver(entries=>{legendsVisible=entries[0].isIntersecting;scheduleRotation();},{threshold:.2}).observe(legends);}
})();
