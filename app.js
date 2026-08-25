const sb=window.sportsvnSupabase;
const fallbackNews=[
 {category:'Bóng đá',title:'Những giải đấu thể thao đáng chú ý trong năm 2026',excerpt:'Cập nhật những thông tin mới nhất từ thể thao Việt Nam và quốc tế.',cover_url:'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80'},
 {category:'Bóng rổ',title:'Sôi động các giải bóng rổ phong trào',excerpt:'Lịch thi đấu và những trận đấu đáng chờ đợi.',cover_url:'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80'},
 {category:'Pickleball',title:'Pickleball tiếp tục thu hút người chơi tại Việt Nam',excerpt:'Phong trào pickleball tiếp tục phát triển mạnh.',cover_url:'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=900&q=80'}
];
const fallbackTournaments=[{name:'Đại hội Thể dục thể thao thành phố Đà Nẵng lần thứ X, năm 2026',sport:'Nhiều môn',status:'running',start_date:'2026-08-24'}];
function esc(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
async function load(){
 let news=fallbackNews,tournaments=fallbackTournaments;
 try{const n=await sb.from('public_news').select('*').order('published_at',{ascending:false}).limit(6);if(!n.error&&n.data?.length)news=n.data;}catch{}
 try{const t=await sb.from('public_tournaments').select('*').order('start_date',{ascending:false}).limit(6);if(!t.error&&t.data?.length)tournaments=t.data;}catch{}
 renderNews(news);renderTournaments(tournaments);renderEmptyTables();
}
function renderNews(items){document.getElementById('news-grid').innerHTML=items.map(x=>`<article class="card"><img src="${esc(x.cover_url||fallbackNews[0].cover_url)}" alt=""><div class="card-body"><small>${esc(x.category||'Thể thao')}</small><h3>${esc(x.title)}</h3><p>${esc(x.excerpt||'')}</p></div></article>`).join('');document.getElementById('top-news').innerHTML=items.slice(0,3).map(x=>`<article class="side-card"><img src="${esc(x.cover_url||fallbackNews[0].cover_url)}" alt=""><div><small>${esc(x.category||'Thể thao')}</small><h3>${esc(x.title)}</h3></div></article>`).join('');}
function renderTournaments(items){document.getElementById('tournament-grid').innerHTML=items.map(x=>`<article class="tournament"><span class="status">${esc(x.status||'draft')}</span><h3>${esc(x.name)}</h3><p>${esc(x.sport||'')}</p><small>${esc(x.start_date||'')}</small></article>`).join('');}
function renderEmptyTables(){for(const id of ['schedule-list','results-list','standings-list'])document.getElementById(id).innerHTML='<table class="table"><thead><tr><th>Nội dung</th><th>Thông tin</th><th>Trạng thái</th></tr></thead><tbody><tr><td colspan="3">Dữ liệu thi đấu sẽ hiển thị tại đây khi Ban tổ chức công bố.</td></tr></tbody></table>';}
load();
