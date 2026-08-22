import { navItems, sportCategories, newsData, tournamentData, filterNews } from './home-data.mjs';

const cfg = window.SPORTSVN_CONFIG || {};
const supabaseReady = Boolean(
  window.supabase &&
  cfg.SUPABASE_URL &&
  cfg.SUPABASE_ANON_KEY &&
  !String(cfg.SUPABASE_URL).includes('YOUR_') &&
  !String(cfg.SUPABASE_ANON_KEY).includes('YOUR_')
);
const sb = supabaseReady ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;

const app = document.querySelector('#app');
let currentUser = null;
let activeCategory = 'Tất cả';

const esc = (s='') => String(s).replace(/[&<>'"]/g, c => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'
}[c]));

function render() {
  app.innerHTML = `
    <header class="site-header">
      <div class="container header-inner">
        <a class="brand" href="#home" aria-label="SportsVN">
          <span class="brand-mark">SV</span>
          <span><strong>SPORTSVN</strong><small>Nền tảng thể thao Việt Nam</small></span>
        </a>
        <button class="mobile-menu" id="mobile-menu" aria-label="Mở menu">☰</button>
        <nav class="main-nav" id="main-nav">
          ${navItems.map((n,i)=>`<a class="${i===0?'active':''}" href="${n.href}">${n.label}</a>`).join('')}
        </nav>
        <div class="header-actions">
          <button class="icon-btn" id="search-btn" title="Tìm kiếm">⌕</button>
          ${currentUser
            ? `<div class="user-menu"><button class="user-btn" id="user-btn">${esc(currentUser.user_metadata?.full_name || currentUser.email || 'Tài khoản')} ▾</button><div class="user-dropdown" id="user-dropdown"><a href="admin.html">⚙ Trung tâm điều hành</a><button id="logout-btn">Đăng xuất</button></div></div>`
            : `<button class="btn btn-outline" data-open-auth="login">Đăng nhập</button><button class="btn btn-primary" data-open-auth="register">Đăng ký</button>`
          }
        </div>
      </div>
    </header>

    <div class="hotbar"><div class="container hotbar-inner"><b>🔥 ĐANG HOT</b>${['#Bóngđá','#Pickleball','#Bóngchuyền','#Bóngrổ','#Cầulông','#Tennis','#Đại hộiTDTT'].map(x=>`<span>${x}</span>`).join('')}</div></div>

    <main id="main-content">
      ${hero()}
      ${newsSection()}
      ${tournamentSection()}
      ${sportSection()}
      ${ctaSection()}
    </main>

    <footer class="site-footer">
      <div class="container footer-grid">
        <div><div class="footer-brand">SPORTSVN</div><p>Nền tảng công nghệ thể thao Việt Nam — nơi kết nối tin tức, vận động viên và giải đấu.</p></div>
        <div><h4>Khám phá</h4><a href="#news">Tin tức</a><a href="#tournaments">Giải đấu</a><a href="#schedule">Lịch thi đấu</a><a href="#results">Kết quả</a></div>
        <div><h4>Thể thao</h4>${sportCategories.slice(0,6).map(x=>`<a href="#news">${x}</a>`).join('')}</div>
        <div><h4>Tham gia SportsVN</h4><p>Tạo tài khoản miễn phí để tổ chức và điều hành giải đấu.</p><button class="btn btn-primary" data-open-auth="register">Tạo tài khoản</button></div>
      </div>
      <div class="footer-bottom"><div class="container">© 2026 SportsVN. Nền tảng công nghệ thể thao Việt Nam.</div></div>
    </footer>
  `;
  bind();
}

function hero() {
  const lead = newsData[0];
  return `<section class="hero container">
    <div class="hero-main" style="background-image:url('${lead.image}')">
      <div class="hero-overlay"></div>
      <div class="hero-content"><span class="tag">${esc(lead.category)}</span><h1>${esc(lead.title)}</h1><p>${esc(lead.time)} · SportsVN</p><a class="hero-link" href="#news">Xem tin mới nhất →</a></div>
    </div>
    <aside class="hero-side">
      ${newsData.slice(1,4).map(n=>`<article class="side-news"><img src="${n.image}" alt=""><div><span>${esc(n.category)}</span><h3>${esc(n.title)}</h3><small>${esc(n.time)}</small></div></article>`).join('')}
    </aside>
  </section>`;
}

function newsSection() {
  const filtered = filterNews(newsData, activeCategory);
  return `<section class="section container" id="news">
    <div class="section-head"><div><span class="eyebrow">TIN TỨC</span><h2>Tin tức thể thao mới nhất</h2></div><a href="#news">Xem tất cả →</a></div>
    <div class="category-tabs">
      ${['Tất cả',...sportCategories.slice(0,7)].map(c=>`<button class="${activeCategory===c?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>
    <div class="news-grid">${filtered.map(n=>`<article class="news-card"><img src="${n.image}" alt=""><div class="news-body"><span>${esc(n.category)}</span><h3>${esc(n.title)}</h3><small>${esc(n.time)}</small></div></article>`).join('')}</div>
  </section>`;
}

function tournamentSection() {
  return `<section class="section section-soft" id="tournaments"><div class="container">
    <div class="section-head"><div><span class="eyebrow">GIẢI ĐẤU</span><h2>Giải đấu nổi bật</h2></div><a href="#tournaments">Khám phá giải đấu →</a></div>
    <div class="tournament-grid">${tournamentData.map(t=>`<article class="tournament-card"><div class="trophy">🏆</div><div><span class="sport-label">${esc(t.sport)}</span><h3>${esc(t.name)}</h3><p>📅 ${esc(t.date)} · <b>${esc(t.status)}</b></p><button class="text-btn">Xem giải đấu →</button></div></article>`).join('')}</div>
  </div></section>`;
}

function sportSection() {
  return `<section class="section container"><div class="section-head"><div><span class="eyebrow">KHÁM PHÁ</span><h2>Môn thể thao</h2></div></div>
    <div class="sport-grid">${sportCategories.map((s,i)=>`<a href="#news" class="sport-tile"><span>${['⚽','🏀','🏐','🏸','🥒','🎾','🏊','🥋','🥊','♟️'][i]}</span><strong>${s}</strong><small>Xem tin & giải đấu</small></a>`).join('')}</div>
  </section>`;
}

function ctaSection() {
  return `<section class="cta-section"><div class="container cta-inner"><div><span class="eyebrow">DÀNH CHO BAN TỔ CHỨC</span><h2>Tạo và điều hành giải đấu của bạn trên SportsVN</h2><p>Quản lý VĐV, bốc thăm, lịch thi đấu, kết quả và công khai giải đấu trên một nền tảng.</p></div><button class="btn btn-light" data-open-auth="register">Đăng ký tổ chức giải →</button></div></section>`;
}

function openAuth(tab='login') {
  const modal = document.querySelector('#auth-modal');
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
  document.querySelectorAll('.auth-tab').forEach(b=>b.classList.toggle('active', b.dataset.authTab===tab));
  document.querySelector('#login-form').classList.toggle('hidden', tab!=='login');
  document.querySelector('#register-form').classList.toggle('hidden', tab!=='register');
}

function closeAuth() {
  const modal = document.querySelector('#auth-modal');
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
}

function bind() {
  document.querySelectorAll('[data-open-auth]').forEach(b=>b.onclick=()=>openAuth(b.dataset.openAuth));
  document.querySelectorAll('[data-close-auth]').forEach(b=>b.onclick=closeAuth);
  document.querySelectorAll('[data-auth-tab]').forEach(b=>b.onclick=()=>openAuth(b.dataset.authTab));
  document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{activeCategory=b.dataset.category;render();location.hash='news';});
  document.querySelector('#mobile-menu')?.addEventListener('click',()=>document.querySelector('#main-nav').classList.toggle('open'));
  document.querySelector('#user-btn')?.addEventListener('click',()=>document.querySelector('#user-dropdown').classList.toggle('show'));
  document.querySelector('#logout-btn')?.addEventListener('click',async()=>{
    if(sb) await sb.auth.signOut();
    currentUser=null; render();
  });
  document.querySelector('#search-btn')?.addEventListener('click',()=>alert('Tìm kiếm SportsVN sẽ được kết nối với kho tin tức và giải đấu.'));
  document.querySelector('#login-form')?.addEventListener('submit',login);
  document.querySelector('#register-form')?.addEventListener('submit',register);
}

async function login(e) {
  e.preventDefault();
  const msg=document.querySelector('#login-message');
  if(!sb){msg.textContent='Supabase chưa được cấu hình trong config.js.';msg.className='form-message error';return;}
  msg.textContent='Đang đăng nhập...';
  const {data,error}=await sb.auth.signInWithPassword({
    email:document.querySelector('#login-email').value.trim(),
    password:document.querySelector('#login-password').value
  });
  if(error){msg.textContent='Email hoặc mật khẩu không chính xác.';msg.className='form-message error';return;}
  currentUser=data.user; closeAuth(); render();
}

async function register(e) {
  e.preventDefault();
  const msg=document.querySelector('#register-message');
  if(!sb){msg.textContent='Supabase chưa được cấu hình trong config.js.';msg.className='form-message error';return;}
  const name=document.querySelector('#register-name').value.trim();
  const email=document.querySelector('#register-email').value.trim();
  const password=document.querySelector('#register-password').value;
  const phone=document.querySelector('#register-phone').value.trim();
  if(password.length<8){msg.textContent='Mật khẩu phải có ít nhất 8 ký tự.';msg.className='form-message error';return;}
  msg.textContent='Đang tạo tài khoản...';
  const {data,error}=await sb.auth.signUp({email,password,options:{data:{full_name:name,phone}}});
  if(error){msg.textContent=error.message;msg.className='form-message error';return;}
  if(data.user) {
    try {
      await sb.from('profiles').upsert({id:data.user.id,full_name:name,phone,email,role:'organizer'});
    } catch (_) {}
  }
  msg.textContent='Đăng ký thành công. Nếu hệ thống yêu cầu xác minh email, hãy kiểm tra hộp thư.';
  msg.className='form-message success';
}

async function initAuth() {
  if(!sb) return;
  const {data}=await sb.auth.getSession();
  currentUser=data.session?.user || null;
  sb.auth.onAuthStateChange((_event,session)=>{
    currentUser=session?.user || null;
    render();
  });
}

await initAuth();
render();
