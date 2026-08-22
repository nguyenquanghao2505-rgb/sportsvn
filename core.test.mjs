import assert from 'node:assert/strict';
import { slugify, drawFirstRound, hasVenueConflict, canAccessTournament } from '../admin/core.mjs';

assert.equal(slugify('Giải Cầu lông Đại hội TDTT Đà Nẵng 2026'), 'giai-cau-long-dai-hoi-tdtt-da-nang-2026');

const entrants = [
  { name: 'A', unit: 'DN' }, { name: 'B', unit: 'DN' },
  { name: 'C', unit: 'QN' }, { name: 'D', unit: 'HUE' },
  { name: 'E', unit: 'DN' }, { name: 'F', unit: 'QN' }
];
const bracket = drawFirstRound(entrants, 8, 42);
assert.equal(bracket.length, 8);
for (let i = 0; i < bracket.length; i += 2) {
  if (bracket[i].name !== 'BYE' && bracket[i + 1].name !== 'BYE') {
    assert.notEqual(bracket[i].unit, bracket[i + 1].unit);
  }
}

assert.equal(hasVenueConflict([
  { venue_id: '1', start: '2026-08-22T08:00', end: '2026-08-22T09:00' },
  { venue_id: '1', start: '2026-08-22T08:30', end: '2026-08-22T09:30' }
], { venue_id: '1', start: '2026-08-22T08:45', end: '2026-08-22T09:15' }), true);

assert.equal(canAccessTournament({ role: 'owner', owner_id: 'u1' }, 'u1'), true);
assert.equal(canAccessTournament({ role: 'owner', owner_id: 'u1' }, 'u2'), false);
assert.equal(canAccessTournament({ role: 'super_admin', owner_id: 'u1' }, 'u2'), true);

console.log('GREEN: core.test.mjs passed');
