// ===============================
// SUPABASE - SPORTSVN
// ===============================
const SUPABASE_URL = "https://bqziksmsdtnodcfykgqk.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_PyxvVa3K8LgTRyGCXeNLwA_HUoRPgli";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
const menuToggle=document.getElementById("menuToggle");
const mainNav=document.getElementById("mainNav");
if(menuToggle){
  menuToggle.addEventListener("click",()=>{
    const open=mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded",String(open));
  });
}
document.querySelectorAll(".main-nav a").forEach(a=>a.addEventListener("click",()=>mainNav.classList.remove("open")));

const cards=[...document.querySelectorAll("#news .card")];
const filters=[...document.querySelectorAll(".filter")];
const noResults=document.getElementById("noResults");
function applyFilter(value){
  let visible=0;
  cards.forEach(card=>{
    const show=value==="all"||card.dataset.category===value;
    card.style.display=show?"":"none";
    if(show) visible++;
  });
  noResults.style.display=visible?"none":"block";
}
filters.forEach(btn=>btn.addEventListener("click",()=>{
  filters.forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  applyFilter(btn.dataset.filter);
}));

const searchInput=document.getElementById("searchInput");
if(searchInput){
  searchInput.addEventListener("input",()=>{
    const q=searchInput.value.trim().toLowerCase();
    if(!q){applyFilter(document.querySelector(".filter.active")?.dataset.filter||"all");return}
    filters.forEach(b=>b.classList.remove("active"));
    document.querySelector('[data-filter="all"]').classList.add("active");
    let visible=0;
    cards.forEach(card=>{
      const show=card.innerText.toLowerCase().includes(q);
      card.style.display=show?"":"none";
      if(show)visible++;
    });
    noResults.style.display=visible?"none":"block";
  });
}

const sections=[...document.querySelectorAll("main section[id]")];
const navLinks=[...document.querySelectorAll(".main-nav a")];
const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+entry.target.id));
    }
  });
},{rootMargin:"-35% 0px -55% 0px",threshold:0});
sections.forEach(s=>observer.observe(s));
