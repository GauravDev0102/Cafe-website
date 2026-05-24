/* ═══ CONFIGURATION ═══
   Update these values for your café:
   - WHATSAPP_NUMBER: Your WhatsApp business number (with country code, no +)
   - INSTAGRAM_HANDLE: Your Instagram username (without @)
   - FACEBOOK_PAGE: Your Facebook page URL
   - CAFE_NAME: Name of your café
*/
const CONFIG = {
  WHATSAPP_NUMBER: '919876543210',
  INSTAGRAM_HANDLE: 'brewedhaven',
  FACEBOOK_PAGE: 'https://facebook.com/brewedhaven',
  CAFE_NAME: 'Brewed Haven',
  CAFE_EMAIL: 'hello@brewedhaven.in',
  CAFE_ADDRESS: '12, MG Road, Koramangala, Bengaluru, Karnataka – 560034'
};

/* ── Cursor ── */
const dot = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  dot.style.left = e.clientX + 'px'; dot.style.top = e.clientY + 'px';
  rx += (e.clientX - rx) * .1; ry += (e.clientY - ry) * .1;
});
(function ani(){ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(ani);})();
document.querySelectorAll('a,button,.mcard,.ig-cell,.rcard').forEach(el=>{
  el.addEventListener('mouseenter',()=>{dot.style.width='14px';dot.style.height='14px';ring.style.width='48px';ring.style.height='48px';});
  el.addEventListener('mouseleave',()=>{dot.style.width='8px';dot.style.height='8px';ring.style.width='34px';ring.style.height='34px';});
});

/* ── Sticky Nav ── */
const nav = document.getElementById('nav');
const links = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id], div[id]');
window.addEventListener('scroll', () => {
  nav.classList.toggle('stuck', window.scrollY > 60);
  let cur = '';
  sections.forEach(s => { if(window.scrollY >= s.offsetTop - 150) cur = s.id; });
  links.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + cur);
  });
}, {passive:true});

/* ── Mobile Menu ── */
function toggleMob(){
  const h = document.getElementById('ham'), d = document.getElementById('drawer');
  h.classList.toggle('open'); d.classList.toggle('open');
  document.body.style.overflow = d.classList.contains('open') ? 'hidden' : '';
}
function closeMob(){
  document.getElementById('ham').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
  document.body.style.overflow = '';
}

/* ── Menu Tabs ── */
function showTab(id, btn){
  document.querySelectorAll('.mpanel').forEach(p=>p.classList.remove('act'));
  document.querySelectorAll('.tab').forEach(b=>b.classList.remove('act'));
  document.getElementById('tab-'+id).classList.add('act');
  btn.classList.add('act');
  document.querySelectorAll('#tab-'+id+' .mcard').forEach((c,i)=>{
    c.classList.remove('on');
    setTimeout(()=>c.classList.add('on'), i*70);
  });
}

/* ── Scroll Reveal ── */
const obs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on');});
},{threshold:0.1});
document.querySelectorAll('.reveal,.rl,.rr,.mcard,.rcard,.stat,.ig-cell').forEach(el=>obs.observe(el));

/* ── Set min date for reservation ── */
const rd = document.getElementById('resDate');
if(rd){ const t=new Date(); rd.min=t.toISOString().split('T')[0]; }

/* ── Reservation Form ── */
async function handleRes(e) {
  e.preventDefault();
  const btn = document.getElementById('resBtn');
  const ok  = document.getElementById('resSuccess');
  btn.classList.add('loading'); btn.textContent = 'Sending…';

  const fd = new FormData(e.target);
  try {
    const r = await fetch(e.target.action, {method:'POST',body:fd,headers:{Accept:'application/json'}});
    if(r.ok){
      ok.style.display='block'; btn.textContent='Reservation Confirmed ✓';
      btn.style.background='var(--green)'; e.target.reset();
      showToast('🎉 Reservation confirmed! Check WhatsApp.','success');
    } else {
      throw new Error('server');
    }
  } catch {
    const name  = fd.get('first_name') + ' ' + (fd.get('last_name')||'');
    const date  = fd.get('date'); const time = fd.get('time');
    const pax   = fd.get('guests'); const occ  = fd.get('occasion')||'';
    const phone = fd.get('phone');
    const msg = `Hi ${CONFIG.CAFE_NAME}! I'd like to reserve a table.\n\n👤 Name: ${name}\n📅 Date: ${date}\n🕐 Time: ${time}\n👥 Guests: ${pax}${occ?'\n🎉 Occasion: '+occ:''}\n📞 Phone: ${phone}`;
    window.open('https://wa.me/'+CONFIG.WHATSAPP_NUMBER+'?text='+encodeURIComponent(msg),'_blank');
    ok.style.display='block';
    document.getElementById('resSuccess').textContent='📱 Opening WhatsApp to complete your reservation…';
    btn.textContent='Sending via WhatsApp…'; btn.style.background='#25d366';
  }
  btn.classList.remove('loading');
}

/* ── Contact Form ── */
async function handleContact(e) {
  e.preventDefault();
  const btn = document.getElementById('contactBtn');
  const ok  = document.getElementById('contactSuccess');
  btn.textContent='Sending…'; btn.disabled=true;
  const fd = new FormData(e.target);
  try {
    const r = await fetch(e.target.action,{method:'POST',body:fd,headers:{Accept:'application/json'}});
    if(r.ok){
      ok.style.display='block'; btn.textContent='Sent ✓';
      btn.style.background='var(--green)'; e.target.reset();
      showToast('✅ Message received! We\'ll reply within 24hrs.','success');
    } else throw new Error();
  } catch {
    btn.textContent='Send Message →'; btn.disabled=false;
    showToast('❌ Something went wrong. Please try again.','error');
  }
}

/* ── WhatsApp ── */
function orderWA(item){
  const msg = item ? `Hi! I'd like to order ${item} from ${CONFIG.CAFE_NAME}.` : `Hi! I'd like to place an order at ${CONFIG.CAFE_NAME} 😊`;
  window.open('https://wa.me/'+CONFIG.WHATSAPP_NUMBER+'?text='+encodeURIComponent(msg),'_blank');
}

/* ── Reviews Slider (mobile) ── */
let reviewIdx = 0;
const allCards = document.querySelectorAll('.rcard');
function slideReviews(dir){
  const vis = window.innerWidth < 769 ? 2 : 3;
  const max = allCards.length - vis;
  reviewIdx = Math.max(0, Math.min(max, reviewIdx + dir));
  allCards.forEach((c,i)=>{
    c.style.display = (i >= reviewIdx && i < reviewIdx+vis) ? 'block' : 'none';
  });
}
function initReviews(){
  if(window.innerWidth < 769){
    allCards.forEach((c,i)=>{ c.style.display = i < 2 ? 'block' : 'none'; });
  } else {
    allCards.forEach(c=>c.style.display='');
  }
}
window.addEventListener('resize', initReviews);

/* ── Toast ── */
function showToast(msg, type='success'){
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast ' + type;
  setTimeout(()=>t.classList.add('show'), 50);
  setTimeout(()=>{ t.classList.remove('show'); }, 3500);
}

/* ── IG cells click ── */
document.querySelectorAll('.ig-cell').forEach(cell=>{
  cell.addEventListener('click',()=>window.open('https://instagram.com/brewedhaven','_blank'));
});

initReviews();
