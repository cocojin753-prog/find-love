(() => {
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
// Chapter-based stops keep the warming point identical in both languages.
const stageChapters = [0,5,10,13,16,18];
const palette = [
 ['#54583c','#575334','#5c542c','#3c4537'],
 ['#4d573f','#505137','#625931','#394638'],
 ['#53583e','#5a5737','#55572f','#3d493b'],
 ['#72603a','#735b30','#78612b','#555035'],
 ['#895b30','#86552a','#846728','#68502e'],
 ['#96602f','#8e5a2a','#8d6c25','#74502b']
].map(row => row.map(hex => [1,3,5].map(i => parseInt(hex.slice(i,i+2),16))));
const vars = ['--glow','--sky','--mist','--horizon'];
let queued = false;
function update() {
 queued = false;
 if (reduced.matches) { vars.forEach(key => document.body.style.removeProperty(key)); return; }
 const max = Math.max(0,document.documentElement.scrollHeight-innerHeight);
 const readingTop = innerWidth >= 651 ? 198 : 166;
 const stops = stageChapters.map(n => Math.max(0,Math.min(max,sections[n].getBoundingClientRect().top+scrollY-readingTop)));
 let index = 0;
 while(index < palette.length-2 && scrollY >= stops[index+1]) index++;
 const span = stops[index+1]-stops[index];
 const t = span>0 ? Math.max(0,Math.min(1,(scrollY-stops[index])/span)) : 1;
 const blend = t*t*(3-2*t);
 vars.forEach((key, i) => {
  const rgb = palette[index][i].map((v,j) => Math.round(v + (palette[index+1][i][j] - v) * blend));
  document.body.style.setProperty(key, `rgb(${rgb.join(',')})`);
 });
}
function schedule() { if (!queued) { queued = true; requestAnimationFrame(update); } }
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule);
addEventListener('load',schedule);
if(reduced.addEventListener) reduced.addEventListener('change',schedule);
const buttons = [...document.querySelectorAll('[data-select-language]')];
const blocks = [...document.querySelectorAll('[data-language]')];
const sections = [...document.querySelectorAll('main section')];
function selectLanguage(lang, preservePosition) {
 if (!['ko','en'].includes(lang)) return;
 const top = innerWidth >= 651 ? 198 : 166;
 const current = sections.find(s => s.getBoundingClientRect().bottom > top) || sections[18];
 const fraction = Math.max(0, Math.min(1, (top-current.getBoundingClientRect().top)/current.offsetHeight));
 const wasAtTop = scrollY < 2;
 blocks.forEach(block => block.hidden = block.dataset.language !== lang);
 document.documentElement.lang = lang;
 buttons.forEach(button => button.setAttribute('aria-current',String(button.dataset.selectLanguage===lang)));
 document.querySelector('.language-toggle').setAttribute('aria-label',lang==='ko'?'본문 언어':'Reading language');
 document.querySelector('.skip-link').textContent=lang==='ko'?'본문 바로가기':'Skip to text';
 document.querySelector('[data-source-label]').textContent=lang==='ko'?'원문 게시':'Original post';
 const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);
 try{localStorage.setItem('reading-language',lang)}catch{}
 if(preservePosition){
  const previous=document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior='auto';
  scrollTo(0,wasAtTop?0:scrollY+current.getBoundingClientRect().top+fraction*current.offsetHeight-top);
  document.documentElement.style.scrollBehavior=previous;
 }
 update();
}
buttons.forEach(button => button.addEventListener('click',event=>{
 if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();selectLanguage(button.dataset.selectLanguage,true);
}));
const requested=new URLSearchParams(location.search).get('lang');
let stored;try{stored=localStorage.getItem('reading-language')}catch{}
selectLanguage(['ko','en'].includes(requested)?requested:location.pathname.endsWith('en.html')?'en':['ko','en'].includes(stored)?stored:document.documentElement.lang,false);
addEventListener('pageshow',update);
if(document.fonts)document.fonts.ready.then(schedule);
update();
})();
