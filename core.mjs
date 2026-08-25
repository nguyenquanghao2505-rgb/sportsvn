export function slugify(value){
  return String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

function mulberry32(seed){
  let a=(Number(seed)||1)>>>0;
  return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
}

function shuffled(list,rng){
  const a=[...list];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

export function buildSingleElimination(entries=[],options={}){
  const avoidSameUnit=options.avoidSameUnit!==false;
  const rng=mulberry32(options.seed??Date.now());
  const clean=entries.filter(Boolean).map((x,i)=>typeof x==='string'?{id:x,name:x,unit:null,seed:null,index:i}:{...x,index:i});
  if(!clean.length)return {size:0,matches:[],rounds:[]};
  const size=2**Math.ceil(Math.log2(Math.max(2,clean.length)));
  const matchCount=size/2;
  const list=shuffled(clean,rng);
  const first=[];
  if(list.length===1) first.push({a:list[0],b:null,bye:true});
  else {
    let pairIndex=0,secondIndex=1;
    if(avoidSameUnit){
      outer: for(let i=0;i<list.length;i++) for(let j=i+1;j<list.length;j++) {
        if(!list[i].unit||!list[j].unit||String(list[i].unit)!==String(list[j].unit)){pairIndex=i;secondIndex=j;break outer;}
      }
    }
    const used=new Set([pairIndex,secondIndex]);
    first.push({a:list[pairIndex],b:list[secondIndex],bye:false});
    for(const [i,x] of list.entries()) if(!used.has(i)) first.push({a:x,b:null,bye:true});
  }
  while(first.length<matchCount) first.push({a:null,b:null,bye:false});
  const arranged=shuffled(first,rng);
  const rounds=[];
  let count=matchCount;
  let roundNo=1;
  while(count>=1){
    rounds.push({roundNo,name:roundNo===1?'Vòng 1':count===1?'Chung kết':`Vòng ${roundNo}`,count});
    count=Math.floor(count/2); roundNo++;
  }
  const all=[]; let previous=[];
  rounds.forEach((r,ri)=>{
    const round=[];
    for(let i=0;i<r.count;i++){
      const base={roundNo:r.roundNo,roundName:r.name,matchNo:i+1,a:null,b:null,bye:false,nextMatchIndex:ri<rounds.length-1?Math.floor(i/2):null,nextSlot:ri<rounds.length-1?(i%2===0?'a':'b'):null};
      if(ri===0){base.a=arranged[i]?.a??null;base.b=arranged[i]?.b??null;base.bye=!!(base.a&&!base.b);}
      round.push(base);all.push(base);
    }
    previous=round;
  });
  return {size,matches:all,rounds};
}

export function calculateStandings(matches=[]){
  const map=new Map();
  const ensure=n=>{if(!n)return null;if(!map.has(n))map.set(n,{name:n,played:0,won:0,draw:0,lost:0,for:0,against:0,diff:0,points:0});return map.get(n)};
  for(const m of matches){
    if(m.status!=='finished')continue;
    const a=ensure(m.a),b=ensure(m.b); if(!a||!b)continue;
    const sa=Number(m.sa),sb=Number(m.sb); if(!Number.isFinite(sa)||!Number.isFinite(sb))continue;
    a.played++;b.played++;a.for+=sa;a.against+=sb;b.for+=sb;b.against+=sa;
    if(sa>sb){a.won++;b.lost++;a.points+=3;} else if(sa<sb){b.won++;a.lost++;b.points+=3;} else {a.draw++;b.draw++;a.points++;b.points++;}
  }
  for(const x of map.values())x.diff=x.for-x.against;
  return [...map.values()].sort((a,b)=>b.points-a.points||b.diff-a.diff||b.for-a.for||a.name.localeCompare(b.name,'vi'));
}
