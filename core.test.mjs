import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify, buildSingleElimination, calculateStandings } from '../core.mjs';

test('slugify tạo slug tiếng Việt ổn định',()=>{
  assert.equal(slugify('Giải Pickleball Đà Nẵng 2026'),'giai-pickleball-da-nang-2026');
});

test('bốc thăm single elimination tạo đủ nhánh và BYE',()=>{
  const entries=[1,2,3,4,5].map((id)=>({id,name:`Đội ${id}`,unit:`U${id}`}));
  const bracket=buildSingleElimination(entries,{avoidSameUnit:true,seed:123});
  assert.equal(bracket.size,8);
  assert.equal(bracket.matches.length,7);
  assert.equal(bracket.matches.flatMap(m=>[m.a,m.b]).filter(Boolean).length,5);
  assert.equal(bracket.matches.filter(m=>m.bye).length,3);
  assert.equal(bracket.rounds.at(-1).count,1);
  assert.equal(bracket.matches.length,7);
});

test('bảng xếp hạng tính điểm thắng hòa thua và hiệu số',()=>{
  const rows=calculateStandings([
    {a:'A',b:'B',sa:2,sb:0,status:'finished'},
    {a:'A',b:'C',sa:1,sb:1,status:'finished'},
    {a:'B',b:'C',sa:3,sb:1,status:'finished'}
  ]);
  assert.equal(rows[0].name,'A');
  assert.equal(rows[0].points,4);
  assert.equal(rows[1].name,'B');
});
