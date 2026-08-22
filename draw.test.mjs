import test from 'node:test'; import assert from 'node:assert/strict'; import {buildSingleEliminationPairings} from '../admin/draw-utils.mjs';
test('creates power of two bracket with bye',()=>{const r=buildSingleEliminationPairings(['A','B','C']);assert.equal(r.length,2);assert.equal(r.filter(x=>x.bye).length,1)});
test('preserves seeds first',()=>{const r=buildSingleEliminationPairings([{id:'A',seed:1},{id:'B',seed:2},{id:'C'}]);assert.equal(r[0].a.id,'A');assert.equal(r[0].b.id,'B')});
