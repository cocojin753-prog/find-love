(() => {
'use strict';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const sections = [...document.querySelectorAll('main section')];
if (!sections.length) return;
const isHonesty = document.body.dataset.article === 'honesty';
const header = document.querySelector('.site-header');
const languageNav = document.querySelector('.language-toggle');
const actions = document.createElement('div');
actions.className = 'header-actions';
header.append(actions);
actions.append(languageNav);
const menuButton = document.createElement('button');
menuButton.type = 'button';
menuButton.className = 'article-menu-toggle';
menuButton.setAttribute('aria-controls', 'article-menu');
menuButton.setAttribute('aria-expanded', 'false');
menuButton.innerHTML = '<span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>';
actions.append(menuButton);
const menu = document.createElement('nav');
menu.id = 'article-menu';
menu.className = 'article-menu';
menu.hidden = true;
menu.setAttribute('aria-labelledby', 'article-menu-heading');
menu.innerHTML = '<p class="article-menu-heading" id="article-menu-heading"><span data-language="ko" lang="ko">글 목록</span><span data-language="en" lang="en" hidden>Readings</span></p><ul></ul>';
const articles = [
 {id:'love',file:'index.html',ko:'나는 어떻게 사랑을 찾을 수 있을까?',en:'How do I find love?'},
 {id:'honesty',file:'honesty.html',ko:'진실한 나로 관계 맺기',en:'Genuine Relationships'}
];
articles.forEach((article, index) => {
 const item = document.createElement('li');
 const link = document.createElement('a');
 link.dataset.articleFile = article.file;
 link.href = article.file;
 if (article.id === (isHonesty ? 'honesty' : 'love')) link.setAttribute('aria-current','page');
 const number = document.createElement('span');
 number.className = 'menu-article-number';
 number.lang = 'en';
 number.setAttribute('aria-hidden','true');
 number.textContent = String(index + 1).padStart(2,'0');
 const title = document.createElement('span');
 title.className = 'menu-article-title';
 ['ko','en'].forEach(lang => {
  const text = document.createElement('span');
  text.dataset.language = lang;
  text.lang = lang;
  text.textContent = article[lang];
  text.hidden = lang !== 'ko';
  title.append(text);
 });
 link.append(number,title);
 const check = document.createElementNS('http://www.w3.org/2000/svg','svg');
 check.classList.add('menu-check');
 check.setAttribute('viewBox','0 0 16 16');
 check.setAttribute('aria-hidden','true');
 check.innerHTML = '<path d="m3 8 3 3 7-7" fill="none" stroke="currentColor" stroke-width="1.2"/>';
 link.append(check);
 item.append(link);
 menu.querySelector('ul').append(item);
});
header.append(menu);
function labelMenu() {
 const ko = document.documentElement.lang === 'ko';
 menuButton.setAttribute('aria-label',menu.hidden ? (ko?'글 목록 열기':'Open readings') : (ko?'글 목록 닫기':'Close readings'));
}
function toggleMenu(open, returnFocus = false) {
 menu.hidden = !open;
 menuButton.setAttribute('aria-expanded',String(open));
 labelMenu();
 if (returnFocus) menuButton.focus({preventScroll:true});
}
menuButton.addEventListener('click',() => toggleMenu(menu.hidden));
menuButton.addEventListener('keydown',event => {
 if(event.key !== 'ArrowDown') return;
 event.preventDefault();
 toggleMenu(true);
 menu.querySelector('a').focus({preventScroll:true});
});
document.addEventListener('click',event => {
 if(!menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)) toggleMenu(false);
});
document.addEventListener('keydown',event => {
 if(event.key === 'Escape' && !menu.hidden){event.preventDefault();toggleMenu(false,true);}
});
// Do not close on focusout: during pointer activation activeElement can be
// body between blur and focus. Hiding the link then cancels its native click.
// Close only once focus has actually landed outside the header. Outside
// pointer clicks and Escape are still handled above; article links stay native.
document.addEventListener('focusin',event => {
 if(!menu.hidden && !header.contains(event.target)) toggleMenu(false);
});
// Preserve the existing six color stops and 25%-earlier transition timing.
// Scale chapter indices only, so articles of different lengths use the same rhythm.
const gradientTiming = 0.75;
const stageChapters = [0,5,10,13,16,18].map(n => Math.round(n*(sections.length-1)/18));
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
 document.body.classList.toggle('has-scrolled', scrollY > 8);
 if(reduced.matches){vars.forEach(key => document.body.style.removeProperty(key));return;}
 const max = Math.max(0,document.documentElement.scrollHeight-innerHeight);
 const readingTop = innerWidth >= 651 ? 198 : 166;
 const stops = stageChapters.map(n => Math.max(0,Math.min(max,sections[n].getBoundingClientRect().top+scrollY-readingTop)) * gradientTiming);
 let index = 0;
 while(index < palette.length-2 && scrollY >= stops[index+1]) index++;
 const span = stops[index+1]-stops[index];
 const t = span>0 ? Math.max(0,Math.min(1,(scrollY-stops[index])/span)) : 1;
 const blend = t*t*(3-2*t);
 vars.forEach((key,i) => {
  const rgb = palette[index][i].map((v,j) => Math.round(v+(palette[index+1][i][j]-v)*blend));
  document.body.style.setProperty(key,`rgb(${rgb.join(',')})`);
 });
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(update);}}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule);
addEventListener('load',schedule);
if(reduced.addEventListener) reduced.addEventListener('change',schedule);
const buttons = [...document.querySelectorAll('[data-select-language]')];
const blocks = [...document.querySelectorAll('[data-language]')];
function selectLanguage(lang,preservePosition){
 if(!['ko','en'].includes(lang)) return;
 const top = innerWidth >= 651 ? 198 : 166;
 const current = sections.find(s => s.getBoundingClientRect().bottom > top) || sections[sections.length-1];
 const fraction = Math.max(0,Math.min(1,(top-current.getBoundingClientRect().top)/current.offsetHeight));
 const wasAtTop = scrollY < 2;
 blocks.forEach(block => block.hidden = block.dataset.language !== lang);
 document.documentElement.lang = lang;
 buttons.forEach(button => {
  button.setAttribute('aria-current',String(button.dataset.selectLanguage===lang));
  const destination = new URL(location.href);
  destination.searchParams.set('lang',button.dataset.selectLanguage);
  button.href = destination.href;
 });
 languageNav.setAttribute('aria-label',lang==='ko'?'본문 언어':'Reading language');
 document.querySelector('.skip-link').textContent = lang==='ko'?'본문 언어' === 'Reading language' ? '' : '본문 바로가기':'Skip to text';
 const sourceLabel = document.querySelector('[data-source-label]');
 if(sourceLabel) sourceLabel.textContent = isHonesty ? (lang==='ko'?'원문 계정':'Source account') : (lang==='ko'?'원문 게시':'Original post');
 menu.querySelectorAll('[data-article-file]').forEach(link => {
  const destination = new URL(link.dataset.articleFile,location.href);
  destination.searchParams.set('lang',lang);
  link.href = destination.href;
 });
 labelMenu();
 const url = new URL(location.href);
 url.searchParams.set('lang',lang);
 history.replaceState(null,'',url);
 try{localStorage.setItem('reading-language',lang);}catch{}
 if(preservePosition){
  const previous = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = 'auto';
  scrollTo(0,wasAtTop?0:scrollY+current.getBoundingClientRect().top+fraction*current.offsetHeight-top);
  document.documentElement.style.scrollBehavior = previous;
 }
 update();
}
buttons.forEach(button => button.addEventListener('click',event => {
 if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey) return;
 event.preventDefault();
 selectLanguage(button.dataset.selectLanguage,true);
 toggleMenu(false);
}));
const requested = new URLSearchParams(location.search).get('lang');
let stored;
try{stored=localStorage.getItem('reading-language');}catch{}
selectLanguage(['ko','en'].includes(requested)?requested:location.pathname.endsWith('en.html')?'en':['ko','en'].includes(stored)?stored:document.documentElement.lang,false);
addEventListener('pageshow',() => {toggleMenu(false);update();});
if(document.fonts) document.fonts.ready.then(schedule);
update();
})();
