const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

function showToast(message){
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function drawActivityChart(){
  const canvas = $('#activityChart');
  if(!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(320, rect.width || canvas.parentElement.clientWidth);
  const height = 175;
  canvas.width = width * ratio; canvas.height = height * ratio;
  const ctx = canvas.getContext('2d'); ctx.scale(ratio, ratio);
  ctx.clearRect(0,0,width,height);
  const pad = {l:30,r:12,t:18,b:25};
  const w = width-pad.l-pad.r, h=height-pad.t-pad.b;
  const a=[22,58,76,92,89,104,131,155,116,109,113,124,142,154,135,129,141,177,136];
  const b=[8,20,31,43,40,51,65,79,63,54,57,64,74,70,63,65,74,82,70];
  const yMax=200;
  ctx.strokeStyle='#e9eef5'; ctx.lineWidth=1;
  [0,50,100,150,200].forEach(v=>{const y=pad.t+h-(v/yMax)*h;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(width-pad.r,y);ctx.stroke();ctx.fillStyle='#8490a3';ctx.font='9px Inter';ctx.fillText(v,pad.l-22,y+3)});
  const px=i=>pad.l+(i/(a.length-1))*w, py=v=>pad.t+h-(v/yMax)*h;
  function area(data){ctx.beginPath();ctx.moveTo(px(0),pad.t+h);data.forEach((v,i)=>ctx.lineTo(px(i),py(v)));ctx.lineTo(px(data.length-1),pad.t+h);ctx.closePath();ctx.fillStyle='rgba(34,150,110,.08)';ctx.fill()}
  area(b);
  function line(data,stroke){ctx.beginPath();data.forEach((v,i)=>i?ctx.lineTo(px(i),py(v)):ctx.moveTo(px(i),py(v)));ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.stroke();data.forEach((v,i)=>{ctx.beginPath();ctx.arc(px(i),py(v),3,0,Math.PI*2);ctx.fillStyle=stroke;ctx.fill()})}
  line(a,'#1682e8'); line(b,'#22a57b');
  ctx.fillStyle='#718096';ctx.font='9px Inter';
  ['01/08','05/08','10/08','15/08','20/08','25/08','30/08'].forEach((label,i)=>ctx.fillText(label,pad.l+(i/6)*w-12,height-7));
  ctx.fillStyle='#1682e8';ctx.fillRect(width-230,10,22,3);ctx.fillStyle='#607086';ctx.fillText('VĐV đăng ký',width-203,14);
  ctx.fillStyle='#22a57b';ctx.fillRect(width-120,10,22,3);ctx.fillStyle='#607086';ctx.fillText('Trận đấu',width-93,14);
}

function filterContent(query){
  const q=query.trim().toLowerCase();
  $$('.event,.news-row,.schedule-row,.rank-row').forEach(el=>{
    el.style.display = !q || el.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

function initNavigation(){
  $$('.nav-item').forEach(item=>item.addEventListener('click',()=>{
    $$('.nav-item').forEach(n=>n.classList.remove('active')); item.classList.add('active');
    showToast(`Đang mở: ${item.dataset.section}`);
    if(window.innerWidth<=850) $('#sidebar').classList.remove('open');
  }));
  $('#menuBtn').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
  $$('.quick-actions button').forEach(btn=>btn.addEventListener('click',()=>showToast(`${btn.dataset.action}: module sẵn sàng kết nối dữ liệu`)));
  $$('.link-btn').forEach(btn=>btn.addEventListener('click',()=>showToast('Đang mở danh sách chi tiết...')));
}

function initSearch(){ $('#searchInput').addEventListener('input',e=>filterContent(e.target.value)); }
function init(){ initNavigation(); initSearch(); drawActivityChart(); window.addEventListener('resize',drawActivityChart); }

document.addEventListener('DOMContentLoaded',init);
if(typeof module!=='undefined') module.exports={drawActivityChart,filterContent};
