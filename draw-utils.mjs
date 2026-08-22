export function buildSingleEliminationPairings(entries=[], options={}){
  const list=[...entries].filter(Boolean).map((x,i)=>typeof x==='string'?{id:x,seed:null,name:x}:{...x,seed:x.seed??null});
  if(!list.length) return [];
  const size=2**Math.ceil(Math.log2(list.length));
  const seeded=list.filter(x=>Number.isInteger(x.seed)).sort((a,b)=>a.seed-b.seed);
  const unseeded=list.filter(x=>!Number.isInteger(x.seed));
  const slots=new Array(size).fill(null);
  seeded.forEach((x,i)=>{ if(i<size) slots[i]=x; });
  let u=0; for(let i=0;i<size;i++) if(!slots[i] && u<unseeded.length) slots[i]=unseeded[u++];
  const pairs=[];
  for(let i=0;i<size;i+=2) pairs.push({matchNo:i/2+1,a:slots[i],b:slots[i+1],bye:!!(slots[i]&&!slots[i+1])});
  return pairs;
}
